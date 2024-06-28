import { Request, Response } from "express";
import { RetrievalQAChain } from "langchain/chains";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "langchain/stores/message/ioredis";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { ClientSession } from "mongoose";
import { createClient } from "redis";
import { getUser } from "../services/user.services";
import { RequestError } from "../utils/globalErrorHandler";
import { sendResponse } from "../utils/response.utils";
import { parseLangchainMessages } from "../utils/chat.utils";
import { addNewQueryQuestionToConversation } from "../services/conversation.services";
import { PANEL_OPTIONS } from "../models/queryQuestion.model";
import { processFileContent } from "../services/documentChat.services";


export const getDocumentChatHistory = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) throw new RequestError("User ID is required", 400);

  try {
    const redisClient = createClient({
      url: process.env.REDIS_URL ?? "redis://localhost:6379",
    });
    await redisClient.connect();

    const memory = new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: userId, // use userId as sessionId
        url: process.env.REDIS_URL ?? "redis://localhost:6379",
      }),
    });

    const chatMessages = await memory.chatHistory.getMessages();
    if (!chatMessages.length) return sendResponse(res, 200, "", []);

    const parsedMessages = parseLangchainMessages(chatMessages);

    return sendResponse(res, 200, "", parsedMessages);
  } catch (error) {
    //console.log(error);
    throw new RequestError("Error fetching chat history", 500);
  }
};


export const queryWithPdfDocument = async (
  req: Request,
  res: Response
) => {
  // Mongoose session
  // Potentially gonna save chat history on mongodb in the future
  const session: ClientSession = req.session!;

  const { userId, query, conversationId } = req.body;
  if (!userId) throw new RequestError("User ID is required", 400);
  if (!query) throw new RequestError("Query message is required", 400);
  if (!conversationId) throw new RequestError("ConversationId is required", 400);

  try {
    const user = await getUser(userId, session);
    if (!user) throw new RequestError("User does not exist", 404);

    const redisClient = createClient({
      url: process.env.REDIS_URL ?? "redis://localhost:6379",
    });
    await redisClient.connect();

    // Initialize Redis-backed chat memory for langchain
    const memory = new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: userId, // use userId as sessionId
        url: process.env.REDIS_URL ?? "redis://localhost:6379",
      }),
    });

    const openAIApiKey = process.env.OPENAI_APIKEY as string;
    let newDocs: Document<Record<string, any>>[] = [];

    // In case there is a file uploaded
    if (req.file) {
      const fileType = req.file.mimetype;
      newDocs = await processFileContent(fileType, req.file.buffer);
      //console.log("fileType----->", fileType);
      //console.log("newDocs----->", newDocs);
    }

    // Get previous documents from Redis if they exist
    const existingChatDocs = await redisClient.get(`chat-${userId}`);
    let existingDocs: Document<Record<string, any>>[] = [];
    if (existingChatDocs) {
      existingDocs = JSON.parse(existingChatDocs);
    }

    // Concatenate existing documents with new ones
    const docs = [...existingDocs, ...newDocs];

    if (newDocs.length > 0) {
      // If there are new documents, update the docs in Redis
      await redisClient.set(`chat-${userId}`, JSON.stringify(docs));
    }

    // TODO: do the check only if we need to upload the file
    const vectorStore = new RedisVectorStore(
      new OpenAIEmbeddings({ openAIApiKey }),
      {
        redisClient,
        indexName: "docs",
      }
    );

    // Check if index exists, if not create it
    const indexExists = await vectorStore.checkIndexExists()
    if (!indexExists) {
      await vectorStore.createIndex();
    }

    if (newDocs.length > 0) {
      // Add embeddings to the the vector store only for new documents uploaded
      await vectorStore.addDocuments(newDocs);
    }

    // Save user's query to the chat session
    await memory.chatHistory.addUserMessage(query);

    // This is a rough and simple method to give some context
    const recentHistory = await memory.chatHistory.getMessages();
    const N = 10;
    const lastNMessages = recentHistory.slice(-N);

    // Step 2: Format the Chat History
    let context = "";
    lastNMessages.forEach((message: any) => {
      if (message.content) {
        context += (message.type === "user" ? "User: " : "AI: ") + message.content + "\n";
      }
    });

    const fullQuery = context + "User: " + query;
    //console.log('fullQuery : ', fullQuery);

    const model = new OpenAI({ openAIApiKey });
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(2), {
      returnSourceDocuments: true,
    });
    const chainRes = await chain.call({ query: fullQuery });

    await memory.chatHistory.addAIChatMessage(chainRes.text);
    ////console.log('sourceDocuments : ', chainRes.sourceDocuments);

    // store in queryQuestion
    await addNewQueryQuestionToConversation(conversationId, {
      question: query,
      type: PANEL_OPTIONS.DOCUMENT,
      answer: chainRes.text,
    });

    return sendResponse(res, 200, "", chainRes.text);
  } catch (error) {
    //console.log("error----->", error);
    throw new RequestError("Error parsing this PDF", 500);
  }
};
