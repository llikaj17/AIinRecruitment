import {
   ChromaClient,
   IncludeEnum
} from "chromadb";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import {
   OpenAIEmbeddings,
   ChatOpenAI
} from "@langchain/openai";
import {
   SystemMessagePromptTemplate,
   HumanMessagePromptTemplate,
   ChatPromptTemplate,
} from "@langchain/core/prompts";
import {
   RunnablePassthrough,
   RunnableSequence
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

interface IVectorDb {
   apiKey: string,
   client: any,
   embedder: any,
   vectorStoreUrl: any,
   loadDataToDb: (collectionName: string) => void,
   getCollectionData: (collectionName: string) => any,
   retrieveRelatedData: (collectionName: string, params: GetRelatedDataAsRetrieval) => any
}

interface GetRelatedDataAsRetrieval {
   input: string;
}

export class VectorDbService implements IVectorDb {
   apiKey: string;
   embedder: any;
   client: any;
   vectorStoreUrl: any;

   constructor() {
      this.apiKey = process.env.OPENAI_API_KEY ?? '';
      this.vectorStoreUrl = `http://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`;
      this.client = new ChromaClient({
         path: this.vectorStoreUrl
      });
      this.embedder = new OpenAIEmbeddings({
         apiKey: process.env.OPENAI_API_KEY
      });
   }

   public loadDataToDb = async (collectionName: string) => {
      // each job description would be a collection
      // in each collection there would be resumes
      const loader = new DirectoryLoader("src/configs/resumes",
         { ".json": (path) => new JSONLoader(path, '/raw') }
      );
      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
         'chunkSize': 3072,
         'chunkOverlap': 500
      });
      const documents: any = [];
      docs.forEach(doc => {
         documents.push(doc.pageContent)
      });
      // clean database
      const chunks = await splitter.createDocuments(documents);
      await Chroma.fromDocuments(
         chunks,
         this.embedder,
         {
            collectionName: 'c-test-collection',
            url: this.vectorStoreUrl,
            collectionMetadata: {
               "hnsw:space": "cosine",
            },
         }
      );
      console.log('Reindexing Done :)');
      /* */
   };

   public getCollectionData = async (collectionName: string) => {
      const collection = await this.client.getCollection({
         name: collectionName,
      });
      const data = await collection.get({
         include: [IncludeEnum.Documents, IncludeEnum.Embeddings, IncludeEnum.Metadatas],
      });
      return data;
   };

   public freeSemanticSearch = async (req: any, limit: number = 3, withScores: boolean = false) => {
      const vectorStore = await Chroma.fromExistingCollection(this.embedder, {
         collectionName: 'c-test-collection',
         url: this.vectorStoreUrl,
         collectionMetadata: {
            "hnsw:space": "cosine",
         }
      });
      const response = withScores ? await vectorStore.similaritySearchWithScore(req.message, limit) : await vectorStore.similaritySearch(req.message, limit);
      return response;
   }

   /**
    * A custom method to shortlist candidates and give them score
    * @param collectionName 
    * @param params 
    * @returns 
    */
   public retrieveRelatedData = async (collectionName: string, params: GetRelatedDataAsRetrieval) => {
      const SYSTEM_TEMPLATE = `Act as a HR talent acquisition. 
         Your job is to shortlist resumes and find best fit candidate in the system given a job description.
         Use only the following context to answer the question at the end.
         If you don't know the answer, just say that you don't know, don't try to make up an answer.
         ----------------
         {context}`;

      const chatModel = new ChatOpenAI({});

      const retrieval = await this.getRetrieval(collectionName);

      // To get relevant documents using retrieval vector db mode: await retrieval._getRelevantDocuments("Data science related resume that have a PHD");

      const messages = [
         SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
         HumanMessagePromptTemplate.fromTemplate(`
            Find best candidate for the job. Rank all candidates with a score from 0 to 1. State canddidate name, 
            score and the reason why you decided that? 
            {input}
         `),
      ];
      const prompt = ChatPromptTemplate.fromMessages(messages);
      const chain = RunnableSequence.from([
         {
            context: retrieval.pipe(formatDocumentsAsString),
            input: new RunnablePassthrough(),
         },
         prompt,
         chatModel,
         new StringOutputParser(),
      ]);

      const answer = await chain.invoke(params.input);
      return answer;
   };

   public getRetrieval = async (collectionName: string, limitListResult : number = 10) => {
      const vectorStore = await Chroma.fromExistingCollection(this.embedder, {
         collectionName: collectionName,
         url: this.vectorStoreUrl,
         collectionMetadata: {
            "hnsw:space": "cosine",
         }
      });
      return vectorStore.asRetriever(limitListResult);
   }
}
