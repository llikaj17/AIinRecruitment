import {
   ChatPromptTemplate,
   HumanMessagePromptTemplate,
   MessagesPlaceholder,
   SystemMessagePromptTemplate
} from "@langchain/core/prompts";
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import { RunnableSequence, RunnablePassthrough, RunnableLambda, RunnableMap } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ConversationSummaryMemory } from "langchain/memory";
import { AIMessage } from "@langchain/core/messages";
import { OpenAI } from "@langchain/openai";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { VectorDbService } from "./VectorDbService.js";
import { formatDocumentsAsString } from "langchain/util/document";

interface IChatBot {
   apiKey: string,
   chatModel: ChatOpenAI,
   memory: ConversationSummaryMemory,
   sessionId: string,
   chatWithResume: (params: ChatParams) => any,
   findRelevantCandidatesForJob: (params: ChatParams) => any
}

interface ChatParams {
   message: string;
   jobDescription?: string;
   resume?: string;
   customSystemPrompt?: string;
}

export class ChatBotService implements IChatBot {
   apiKey: string;
   chatModel: ChatOpenAI<ChatOpenAICallOptions>;
   memory: ConversationSummaryMemory;
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
      // the memory is used to generate a summary of what is being talked between the bot and human
      this.memory = new ConversationSummaryMemory({
         memoryKey: `chat_history`,
         llm: new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 }), // temperature to 0 to be deterministic. set it higher, you'll get more random outputs. 
      });
      this.sessionId = sessionId;
      this.chatConfig = {
         configurable: {
            sessionId: this.sessionId
         },
      };
   }

   public memoryChatRunnable = async (promptTemplate: ChatPromptTemplate) => {
      const outputParser = new StringOutputParser();
      const chain = RunnableSequence.from([
         promptTemplate,
         this.chatModel,
         outputParser,
      ]);
      return new RunnableWithMessageHistory({
         runnable: chain,
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
   }

   /**
    * Get analysis for a resume
    * @param params 
    * @returns 
    */
   public chatWithResume = async (params: ChatParams) => {
      const prompt = ChatPromptTemplate.fromMessages([
         SystemMessagePromptTemplate.fromTemplate(
            `Act has head of human resource management and talent acquisition. 
            Your job is to analyse resumes and match them with input job description or question from hiring managers.
            You should be able to know if the candidate is a good match for the job or not.
            ----------------
            RESUME DATA:
            {resume}`
         ),
         new MessagesPlaceholder("chat_history"),
         HumanMessagePromptTemplate.fromTemplate("{message}"),
      ]);

      // TODO: Fix me - memory does not seem to work properly...
      // SOLUTION 1: Need to pass back the memory to user and send it back in every request so it will not get reinitialized every time
      // SOLUTION 2: Create a ID when opening chat. Relate that chat_id with the history (retrieve it from JSONDB or a dabase) when creating ChatBotService()...
      // You don't know pain ... OR See here: https://js.langchain.com/v0.2/docs/tutorials/chatbot/ and https://js.langchain.com/v0.2/docs/tutorials/qa_chat_history/
      // Solution about the memory: To fix the memory problem I am running a Redis instance: 
      const withMessageHistory = await this.memoryChatRunnable(prompt);
      const aiMessage = await withMessageHistory.invoke({ message: params.message, resume: params.resume }, this.chatConfig);
      console.log('Message: ', new AIMessage(aiMessage));
      return aiMessage;
   };

   /**
    * Get relevant candidates for a job description or a chat input ...
    * @param params 
    * @returns 
    */
   public findRelevantCandidatesForJob = async (params: ChatParams) => {

      const outputParser = new StringOutputParser();
      const vectorDB = new VectorDbService();
      const retrieval = await vectorDB.getRetrieval('c-test-collection');
      
      // To get relevant documents using retrieval vector db mode: await retrieval._getRelevantDocuments("Data science related resume that have a PHD");

      const prompt = ChatPromptTemplate.fromMessages([
         SystemMessagePromptTemplate.fromTemplate(
            `Act has head of human resource management and talent acquisition
            Your job is to analyse a job description from the user, get and analyse relevant resumes and provide a ranking for the shortlisted candidates or answer the question of hiring managers.
            If applicable provide a score for the shortlisting if you are ask to shortlist a few candidates from candidate pool. You can use the context to generate your answer. 
            If you don't know the answer, just say that you don't know, don't try to make up an answer.
            ----------------
            {context}
            ----------------
            JOB DESCRIPTION:
            ${params.jobDescription}
            `
         ),
         new MessagesPlaceholder("chat_history"),
         HumanMessagePromptTemplate.fromTemplate("{message}"),
      ]);

      /*

      // Another method using RunnableLambda and passing the output/input to next chain
      // https://js.langchain.com/v0.1/docs/expression_language/get_started/
      // TODO: Fix TypeError: text.replace is not a function when running
      // This is related with .invoke() and .invoke({param1, param2 ...}) somehow an additional step is needed to make this work
      const setupAndRetrieval = RunnableMap.from({
         context: new RunnableLambda({
            func: (message: string) =>
               vectorDBRetriever.pipe(formatDocumentsAsString).invoke(message).then((response: any) => response[0].pageContent),
         }).withConfig({ runName: "contextRetriever" }),
         message: new RunnablePassthrough(),
         description: new RunnablePassthrough()
      });
      const chain = setupAndRetrieval.pipe(prompt).pipe(this.chatModel).pipe(outputParser);
      
      */

      const withMessageHistory = await this.memoryChatRunnable(prompt);
      const aiMessage = await withMessageHistory.invoke({"message": `${params.message}`, context: await retrieval.pipe(formatDocumentsAsString).invoke(params.message)}, this.chatConfig);
      console.log('Chat with retrieval and history: ', aiMessage);
      return aiMessage;
   };
}
