import { 
  PromptTemplate, 
  ChatPromptTemplate, 
  HumanMessagePromptTemplate, 
  SystemMessagePromptTemplate 
} from "@langchain/core/prompts";
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StructuredOutputParser } from "langchain/output_parsers";
import { ConversationSummaryMemory } from "langchain/memory";
import { AIMessage } from "@langchain/core/messages";

interface GenerateFunctionWithLanguage {
  language: string;
  task: string;
}

interface Message {
  message: string;
}

interface IHelloWorld {
  chatModel: ChatOpenAI;
  helloWorld: (param: GenerateFunctionWithLanguage) => any,
  helloChatWithBot: (params: Message) => any;
  helloWorldSequence: (params: GenerateFunctionWithLanguage) => any;
}

export class HelloWorldService implements IHelloWorld {
  chatModel: ChatOpenAI<ChatOpenAICallOptions>;

  constructor () {
    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      model: 'gpt-3.5-turbo'
    });
  }

  public helloWorld = async (params: GenerateFunctionWithLanguage) => {
    const prompt = ChatPromptTemplate.fromTemplate("Tell me a {adjective} joke");
    const chain = prompt.pipe(this.chatModel);
    const response = await chain.invoke({ adjective: "funny" });
    console.log('Joke:', response);
    return response.content ? response.content : response;
  };
  

  public helloChatWithBot = async (params: Message) => {   
    // Reference: https://javascript.plainenglish.io/embarking-on-the-ai-adventure-part2-merging-two-chains-within-langchain-2c806842d1ab
    const outputParser = new StringOutputParser();
    const memory = new ConversationSummaryMemory({
      memoryKey: "chat_history",
      llm: this.chatModel,
    });
  
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "Act as a math teacher who wants to help students with their homework"
      ),
      "Current conversation:",
      "{chat_history}",
      HumanMessagePromptTemplate.fromTemplate("{message}"),
    ]);
  
    const chain = RunnableSequence.from([
      {
        message: (initialInput) => initialInput.message,
        memory: () => memory.loadMemoryVariables({}),
      },
      {
        message: (previousOutput) => previousOutput.message,
        chat_history: (previousOutput) => previousOutput.memory.chat_history,
      },
      prompt,
      this.chatModel,
      outputParser,
    ]);

    const aiMessage = await chain.invoke({ message: params.message });
    await memory.saveContext(
      {
        message: params.message,
      },
      {
        chat_history: new AIMessage(aiMessage),
      }
    );
    console.log({ aiMessage, memory: await memory.loadMemoryVariables({}) });
    return aiMessage;
  };

  public helloWorldSequence = async (params: GenerateFunctionWithLanguage) => {
    // Reference: https://javascript.plainenglish.io/embarking-on-the-ai-adventure-part2-merging-two-chains-within-langchain-2c806842d1ab
    const outputParser = new StringOutputParser();
    const generateCodePrompt = PromptTemplate.fromTemplate(
      "Write a very short {language} function that will {task}. Only respond with the code"
    );
    const generateTestPrompt = PromptTemplate.fromTemplate(
      "Write unit tests for the following code: {code} with this language: {language}. respond with the code and generated tests in this {format_instructions}"
    );
    const chain = generateCodePrompt.pipe(this.chatModel).pipe(outputParser);
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      code: "the generated code",
      tests: "the generated tests for that code",
    });
    const combinedChain = RunnableSequence.from([
      {
        code: chain,
        language: (input) => input.language,
        format_instructions: (input) => input.format_instructions,
      },
      generateTestPrompt,
      this.chatModel,
      parser,
    ]);
    return combinedChain.invoke({
      language: params.language,
      task: params.task,
      format_instructions: parser.getFormatInstructions(),
    });
  }

}
