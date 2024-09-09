import {
   ChatPromptTemplate,
   SystemMessagePromptTemplate
} from "@langchain/core/prompts";
import { 
   ChatOpenAI,
   ChatOpenAICallOptions,
   OpenAIEmbeddings
} from "@langchain/openai";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { VectorDbService } from "./VectorDbService.js";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { faker } from '@faker-js/faker';

interface IRAGFusion {
   apiKey: string,
   chatModel: ChatOpenAI,
   sessionId: string,
   retrieveSearchWithSubQueries: (params: RAGParams) => any;
}

interface RAGParams {
   message: string;
   jobDescription: string;
   customSystemPrompt?: string;
}

type RetrievedDocuments = {
   [query: string]: {
       [docID: string]: number; // Document ID as string, rank/score as number
   };
};

type FusedScores = {
   [docID: string]: number;
};

export class RAGFusionService implements IRAGFusion {
   // Reference: https://gist.github.com/mdwoicke/da86e5cbf45239f6afdb3d378fa5ceaa
   apiKey: string;
   chatModel: ChatOpenAI<ChatOpenAICallOptions>;
   sessionId: string;
   messageHistories: Record<string, RedisChatMessageHistory> = {};
   chatConfig: any;

   constructor(sessionId: string, model?: string, temperature?: number) {
      this.apiKey = process.env.OPENAI_API_KEY ?? '';
      this.chatModel = new ChatOpenAI({
         openAIApiKey: this.apiKey,
         temperature: temperature || 0.7,
         model: model || 'gpt-3.5-turbo'
      });
      this.sessionId = sessionId;
      this.chatConfig = {
         configurable: {
            sessionId: this.sessionId
         },
      };
   }

   /**
    * generate multiple SUB queries and use them to search more relevant documents in the vector storage
    * @param params 
    */
   public retrieveSearchWithSubQueries = async (params: RAGParams) => {
      const prompt = ChatPromptTemplate.fromTemplate(`Answer the user's question: {input} with context {context}`);
      const subQueries = await this.generateSubQueries(params.message);
      const altQueryDocs: any = {};
      
      const combineDocsChain = await createStuffDocumentsChain({
         llm: this.chatModel,
         prompt
      });


      const ids = {};
      for (const query of subQueries) {
         // OR new VectorDbService().retrieveRelatedData('c-test-collection', { input: query });
         const relevantDocs = await this.vectorSearch(params.message); 
         relevantDocs.map(doc => {
            if (!ids[doc[0].pageContent.substring(0, 100)]) {
               ids[doc[0].pageContent.substring(0, 100)] =  `doc_id_${faker.string.uuid()}`;
            }
            doc[0]['id'] = ids[doc[0].pageContent.substring(0, 100)];
            return doc;
         });
         altQueryDocs[`${query}`] = relevantDocs;
      };

      const rankedResults = await this.reciprocalRankFusion(Object.values(altQueryDocs));
      
      // TODO: Match doc ids of ranked results to reciprocal rank fusion
      const vectorstore = await FaissStore.fromDocuments(
         rankedResults,
         new OpenAIEmbeddings()
      );
      const retriever = vectorstore.asRetriever();

      const retrievalChain = await createRetrievalChain({
         combineDocsChain,
         retriever: retriever
      });

      const withMessageHistory = new RunnableWithMessageHistory({
         runnable: retrievalChain,
         getMessageHistory: async (sessionId) => {
            return new RedisChatMessageHistory({
               sessionId,
               sessionTTL: 300,
               url: process.env.REDIS_URL ?? "redis://localhost:6379"
            });
         },
         inputMessagesKey: "message",
         historyMessagesKey: "chat_history",
      });
      const data = await withMessageHistory.invoke({input: params.message}, this.chatConfig);
      return data.answer;
   }

   /**
    * Create new queries from the main query
    * @param originalQuery 
    * @returns 
    */
   private generateSubQueries = async (originalQuery: string, maxQuery: number = 4) => {
      const prompt = ChatPromptTemplate.fromMessages([
         SystemMessagePromptTemplate.fromTemplate(`
            You are a helpful assistant that generates alternative queries 
            that could be asked to a large language model related 
            to the users original query: {queryPrompt}. 
            OUTPUT A COMMA SEPARATED LIST (CSV) of {numberQuery} alternative queries. 
            The queries themselves should not be listed by number. 
            Do not include the original query in the array`
         )
      ]);
      const chain = prompt.pipe(this.chatModel);
      const response = await chain.invoke({ queryPrompt: originalQuery, numberQuery: maxQuery });
      const answer = response.content ? response.content : '';
      const generatedQueries = typeof answer === "string" ? answer.trim().split("\n") : answer;
      console.log('Generated Queries: ', generatedQueries);
      return generatedQueries;
   }

   //retrieve the most relevant documents based on each alternate query
   private vectorSearch = async (query: string) => {
      const vectorDB = new VectorDbService();
      const docs = await vectorDB.freeSemanticSearch({message: query}, 5, true);
      return docs;
   }

   /**
    * Adapted from: https://gist.github.com/mdwoicke/da86e5cbf45239f6afdb3d378fa5ceaa
    * apply the RRF algorithm to the docs, merge any similarities,
    * @return the top results in a single object (fusedScores)
    *  */ 
   private reciprocalRankFusion = (retrievedDocuments: any, k: number = 60) => {
      const fusedScores: any = {};


      for (const docs of retrievedDocuments) {
         const sortedDocs = Object.entries(docs).sort(([, scoreA], [, scoreB]) => (scoreB as number) - (scoreA as number));
         sortedDocs.forEach(([rank, doc]) => {
            const docId = doc[0].id;
            if (!fusedScores[docId] && fusedScores[docId] !== 0) {
               fusedScores[docId] = {
                  'rank': 0
               }
            } else {
               fusedScores[docId].rank += (1 / ((rank as number) + k))
            }
            fusedScores[docId]['doc'] = doc[0];
         });
      }

      // reranking
      const rerankedDocs = Object.values(fusedScores)
         .sort((docA, docB) => (docA.rank as number) - (docB.rank as number))
         .map(acc => {
            return acc.doc;
         }, {} as any);
      return rerankedDocs;
   }
}
