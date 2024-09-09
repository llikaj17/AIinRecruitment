import express from "express";
import dotenv from "dotenv";
import { HelloWorldService } from "./services/HelloWorldService.js";
import { VectorDbService } from "./services/VectorDbService.js";
import { ApplicationStorageService } from "./services/StorageService.js";
import { Request } from "express";
import { ChatBotService } from "./services/ChatBotService.js";
import { RAGFusionService } from "./services/RAGFusionService.js";

import cors from "cors";

dotenv.config();

const app: express.Express = express();
const port: string | number = process.env.PORT || 3000;

app.use(express.json());

const corsOptions = {
   credentials: true,
   origin: ['http://localhost:3000', 'http://localhost:3030', 'http://localhost:80'],
   optionsSuccessStatus: 200,
   methods: 'GET,POST',
   allowedHeaders: ['Content-Type', 'Authorization']
 };

app.use(cors<Request>(corsOptions));

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.get("/api/v1/hello/world", async (req, res, next) => {
   res.status(200);
   return res.send('Hello World');
});

app.post("/api/v1/hello/joke", async (req, res, next) => {
   console.log('Incoming request: ', req.body);
   const response = await new HelloWorldService().helloWorld(req.body);
   res.status(200).send({
     res: response,
   });
});

app.post("/api/v1/hello/sequence", async (req, res, next) => {
   const codeGenerated = await new HelloWorldService().helloWorldSequence(req.body);
   res.status(200).send(codeGenerated);
});

app.post("/api/v1/hello/chat", async (req, res) => {
   const generatedMessage = await new HelloWorldService().helloChatWithBot(req.body);
   res.status(200).send({
     message: generatedMessage,
   });
});

app.post("/api/v1/vectordb/embeddings", async (req, res, next) => {
   await new VectorDbService().loadDataToDb("c-test-collection");
   res.status(200).send({
     message: "loaded",
   });
});

app.get("/api/v1/vectordb/collection", async (req, res, next) => {
   const loadedData = await new VectorDbService().getCollectionData("c-test-collection");
   res.status(200).send({
     loadedData,
   });
});

app.post("/api/v1/vectordb/search", async (req, res, next) => {
   const data = await new VectorDbService().retrieveRelatedData("c-test-collection", 
      {
         input: `The job description is: ${req.body.jobDesciption}`
      }); 
   res.status(200).send({
     data
   });
});

app.post("/api/v1/vectordb/freesearch", async (req, res, next) => {
   const data = await new VectorDbService().freeSemanticSearch(req.body);
   res.status(200).send({
     data,
   });
});

app.post("/api/v1/chat", async (req, res, next) => {
   // TODO: Add AUTHENTICATION using API_KEY in the HEADER for the future
   if (!Object.keys(req.body).length || !req.body.message || !req.body.assistantMode || !req.body.sessionId) {
      res.status(400).send({
         data: 'Message is missing!'
      });
      return;
   }
   const chatBotService = new ChatBotService(req.body.sessionId, req.body.mode, req.body.temperature);
   const data = req.body.assistantMode === 'job' 
      ? req.body.ragFusionFlag 
         ? await new RAGFusionService(req.body.sessionId, req.body.mode, req.body.temperature).retrieveSearchWithSubQueries(req.body) 
         : await chatBotService.findRelevantCandidatesForJob(req.body) 
      : await chatBotService.chatWithResume(req.body);

   if (data && Object.keys(data).length) {
      res.status(200).send({
         data
      });
      return;
   }
   res.status(500).send({
      error: 'Internal error'
   });
});

app.get("/api/v1/content/resumes", async (req, res, next) => {
   const data = await new ApplicationStorageService().loadResumes();
   console.log(data);
   if (data && Object.keys(data).length) {
      res.status(200).send({
         ...data
      });
      return;
   }
   res.status(500).send({
      error: 'Internal error'
   });
});

app.get("/api/v1/content/jobs", async (req, res, next) => {
   const data = await new ApplicationStorageService().loadJobs();
   console.log(data);
   if (data && Object.keys(data).length) {
      res.status(200).send({
         ...data
      });
      return;
   }
   res.status(500).send({
      error: 'Internal error'
   });
});
