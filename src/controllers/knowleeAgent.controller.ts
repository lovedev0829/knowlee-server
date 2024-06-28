import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import {
  handleThreadsRunsRequiresAction,
    openAIAssistantsCreate,
    openAIAssistantsDel,
    openAIAssistantsList,
    // openAIAssistantsRetrieve,
    openAIAssistantsUpdate,
    openAIThreadRunCreate,
    openAIThreadRunGet,
    openAIThreadsCreate,
    openAIThreadsDel,
    openAIThreadsMessagesCreate,
    openAIThreadsMessagesList,
  openAIThreadsRunsCancel,
  openAIThreadsRunsList,
  openAIThreadsRunsStream,
  openAIThreadsRunsStreamWithEventHandler,
  openAIVectorStoresCreate,
  openAIVectorStoresDel,
  openAIVectorStoresFileBatchesCreate,
  openAIVectorStoresFilesDel,
  openAIVectorStoresFilesList,
} from "../services/openAI.services";
import { RequestError } from "../utils/globalErrorHandler";
import {
    createOneUserAgentDocument,
    deleteManyUserAgent,
    findOneAndUpdateUserAgent,
    findOneUserAgentDocument,
    findUserAgentDocuments,
    getOpenAIFileIdsFromEntityId,
} from "../services/knowlee-agent/agent.services";
import {
    findOneAndUpdateUserThreadDocument,
    findOneUserThread,
    findUserThreadDocuments,
} from "../services/knowlee-agent/userThread.services";
import { Thread } from "openai/resources/beta/threads/threads";
import UserThreadModel, { IUserThreadDocument } from "../models/knowlee-agent/UserThread.model";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import { findEntityDocuments } from "../services/entity.services";
import { findLocalEntity } from "../services/localEntity.service";
import { findDefaultAgentDocuments, findOneDefaultAgentDocument } from "../services/knowlee-agent/defaultAgent.service";
import { findFunctionDefinitionDocuments } from "../services/knowlee-agent/functionDefinition.services";
import { AssistantTool } from "openai/resources/beta/assistants";
import { UpdateQuery } from "mongoose";
import { IUserUsageStat } from "../models/UserUsageStat.model";
import { findOneStatsPriceDocument } from "../services/stripe/statsPrice.services";

const openAIDefaultAssistantId = process.env.OPENAI_DEFAULT_ASSISTANT_ID as string;

export const DEFAULT_MODEL = 'gpt-4o';

export async function createAgentController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const userId = user.id;

  const {
    avatar,
    name,
    instructions,
    entityIds = [],
    initialPrompts,
    functionDefinitions = [],
    functionTypes = [],
    openai_model = 'gpt-3.5-turbo',
  } = req.body;
    if (!name) throw new RequestError("name is required", 400);
    if (!instructions) throw new RequestError("instructions is required", 400);
  if (!entityIds?.length && !functionDefinitions?.length) {
    throw new RequestError("At least one entityId or a function call is required", 400);
  }
  // if (!entityIds?.length && !functionTypes?.length) {
  //   throw new RequestError("At least one entityId or a function call type is required", 400);
  // }

  const file_ids = [];
  const tools: Array<AssistantTool> = [];

  // handle selected entities
  if (entityIds?.length) {
  const entities = await findEntityDocuments({
    id: entityIds,
  });

  for (const entity of entities) {
    if (entity.fileId) {
      file_ids.push(entity.fileId);
      continue;
    }
    
    // Create new file_id for the entity if doesn't exist already
    const fileId = await getOpenAIFileIdsFromEntityId(entity.id);
    file_ids.push(fileId);
  }

    const localEntities = await findLocalEntity({ id: { $in: entityIds } });

    for (const localEntity of localEntities) {
      if (localEntity.fileId) {
        file_ids.push(localEntity.fileId);
        continue;
      }
        const fileId = await getOpenAIFileIdsFromEntityId(localEntity.id);
        file_ids.push(fileId);
    }

    if (!file_ids.length) {
      throw new RequestError("No fileIds were found", 400);
    }
    tools.push({ type: "file_search" });
  }

  // handle selected functions
  if (functionDefinitions.length) {
    const dbFunctionList = await findFunctionDefinitionDocuments({
      _id: { $in: functionDefinitions },
    });

    if (functionDefinitions.length !== dbFunctionList.length) {
      throw new RequestError(
        "Function definition not found for one or more selected function",
        400
      );
    }

    // add function definitions to tools array
    dbFunctionList.forEach((fd) => {
      tools.push({
        type: "function",
        function: fd.functionDefinition,
      });
    });
  }

  // create openAi assistant with file_id
  const assistant = await openAIAssistantsCreate({
    tool_resources: file_ids.length
      ? {
        file_search: {
          vector_stores: [{ file_ids: file_ids }],
        },
      }
      : undefined,
    instructions,
    metadata: {
      creatorId: userId,
    },
    name,
    tools,
    model: openai_model || DEFAULT_MODEL,
  });

  // increment userAgentCount
  const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
    { userId: userId },
    { $inc: { userAgentCount: 1 } },
    { upsert: true, new: true }
  );

    // create userAgent document
  const userAgent = await createOneUserAgentDocument({
    creatorId: userId,
    avatar,
    assistant,
    entityIds,
    initialPrompts,
    functionDefinitions,
    functionTypes,
    openai_model,
  });

  return sendResponse(res, 200, "success", { userAgent });
}

export async function getAssistantsListController(req: Request, res: Response) {
    const assistants = await openAIAssistantsList({ limit: 100 });
    return sendResponse(res, 200, "success", assistants);
}

export async function getThreadRunsController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const { threadId } = req.params;

  const userThread = await findOneUserThread({
    _id: threadId,
    creatorId: userId,
  });
  if (!userThread) {
    throw new RequestError("UserThread not found", 404);
  }
  const { thread } = userThread;
  const runs = await openAIThreadsRunsList(thread.id, {
    limit: 100,
    ...req.query,
  });
  return sendResponse(res, 200, "success", runs);
}

export async function updateAssistantController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const { assistantId } = req.params;
  const dbAgent = await findOneUserAgentDocument({
    "assistant.id": assistantId,
    creatorId: userId,
  });
  if (!dbAgent) throw new RequestError("Could not find this assistant", 404);
  const vectorStoreId =
    dbAgent.assistant?.tool_resources?.file_search?.vector_store_ids?.[0];

  const {
    avatar,
    entityIds = [],
    functionDefinitions = [],
    functionTypes = [],
    openai_model,
    initialPrompts,
    instructions,
    name,
  } = req.body;

  const file_ids: string[] = [];
  const tools: Array<AssistantTool> = [];
  let newVectorStoreId: string | undefined = undefined; 

  // handle selected entities
  if (entityIds?.length) {
  // Fetching entities
  const entities = await findEntityDocuments({ id: { $in: entityIds } });
  for (const entity of entities) {
      if (entity.fileId) {
          file_ids.push(entity.fileId);
          continue;
      }
      
      const fileId = await getOpenAIFileIdsFromEntityId(entity.id);
      // console.log("Generated fileId for entity:", entity.id, fileId);
      file_ids.push(fileId);
  }

  // Fetching local entities
  const localEntities = await findLocalEntity({ id: { $in: entityIds } });
  for (const localEntity of localEntities) {
    if (localEntity.fileId) {
      file_ids.push(localEntity.fileId);
      continue;
    }
      const fileId = await getOpenAIFileIdsFromEntityId(localEntity.id);
      file_ids.push(fileId);
  }

  if (!file_ids || !file_ids.length)
      throw new RequestError("No fileIds were found", 400);

  // file_search needs file_ids
  tools.push({ type: "file_search" });
    if (vectorStoreId && file_ids.length) {

      // retreive files attached to vector store
      const vectorStoreFileList = await openAIVectorStoresFilesList(
        vectorStoreId
      );

      const removedVectorStoreFileList = vectorStoreFileList.data.filter(
        (vsFile) => !file_ids.includes(vsFile.id)
      );

      for (const vsFile of removedVectorStoreFileList) {
        // remove file_id from vector store
        await openAIVectorStoresFilesDel(vectorStoreId, vsFile.id)
      }

      // update fileIds of vector store
      // no need to update assistant as files from vector store will be removed
      await openAIVectorStoresFileBatchesCreate(vectorStoreId, {
        file_ids: file_ids,
      });
    } else if(!vectorStoreId && file_ids.length){
      // create vector store and assign to assistant
      const vectorStore = await openAIVectorStoresCreate({
        file_ids: file_ids,
      });
      newVectorStoreId = vectorStore.id;
    }
  }

  if (vectorStoreId && !entityIds?.length) {
    // delete vector store
    await openAIVectorStoresDel(vectorStoreId);
  }

  // handle selected functions
  if (functionDefinitions.length) {
    const dbFunctionList = await findFunctionDefinitionDocuments({
      _id: { $in: functionDefinitions },
    });

    if (functionDefinitions.length !== dbFunctionList.length) {
      throw new RequestError(
        "Function definition not found for one or more selected function",
        400
      );
    }

    // add function definitions to tools array
    dbFunctionList.forEach((fd) => {
      tools.push({
        type: "function",
        function: fd.functionDefinition,
      });
    });
  }

  // Updating the assistant
  const updatedAssistant = await openAIAssistantsUpdate(assistantId, {
    tool_resources: newVectorStoreId
      ? {
          file_search: {
            vector_store_ids: [newVectorStoreId],
          },
        }
      : undefined,
      instructions,
      metadata: {
          creatorId: userId,
      },
      model: openai_model,
      name,
    tools,
  });

  // Updating the userAgent in the database
  await findOneAndUpdateUserAgent(
    { "assistant.id": assistantId, creatorId: userId },
    {
      $set: {
        avatar,
        assistant: updatedAssistant,
        entityIds: entityIds,
        initialPrompts: initialPrompts,
        functionDefinitions: functionDefinitions,
        functionTypes: functionTypes,
        openai_model: openai_model,
      },
    }
  );
  
  return sendResponse(res, 200, "success", updatedAssistant);
}

export async function retrieveAssistantController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const { assistantId } = req.params;
  // const myAssistant = await openAIAssistantsRetrieve(assistantId);
  const userAgent = await findOneUserAgentDocument({
    "assistant.id": assistantId,
    creatorId: userId,
  });

  if (!userAgent) throw new RequestError("Could not find this assistant", 404);
  return sendResponse(res, 200, "success", userAgent);
}

export async function deleteAssistantController(req: Request, res: Response) {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

    const { assistantId } = req.params;

  const dbAgent = await findOneUserAgentDocument({
    "assistant.id": assistantId,
    creatorId: userId,
  });
  if (!dbAgent) throw new RequestError("Could not find this assistant", 404);

    const response = await openAIAssistantsDel(assistantId);

    // decrement userAgentCount
    // const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
    //     { userId: userId },
    //     { $inc: { "userAgentCount": -1 } },
    //     { upsert: true, new: true }
    // );

    // delete userAgent from database
    await deleteManyUserAgent({ "assistant.id": assistantId, creatorId: userId })
    return sendResponse(res, 200, "success", response);
}

export async function getUserAgentsController(req: Request, res: Response) {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const userId = user.id;

  const userAgents = await findUserAgentDocuments({ creatorId: userId }, undefined, { populate: "functionDefinitions" });
    return sendResponse(res, 200, "success", userAgents);
}

export async function getFilteredUserAgentsWithFunctionTypesController(
  req: Request,
  res: Response
) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const userId = user.id;

  const userAgents = await findUserAgentDocuments(
    { creatorId: userId },
    undefined,
    { populate: "functionDefinitions" }
  );

  // Filter userAgents to include only those with "Telegram" in functionTypes
  const filteredUserAgents = userAgents.filter(
    (agent) => agent.functionTypes && agent.functionTypes.includes("Telegram")
  );

  return sendResponse(res, 200, "success", filteredUserAgents);
}

export async function getDefaultAgentsController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const userId = user.id;

  const defaultAgents = await findDefaultAgentDocuments({
    creatorId: "e296a837-287e-40c4-8527-5f3d755608b1",
  });
  
  return sendResponse(res, 200, "success", defaultAgents);
}

export async function getUserThreadsController(req: Request, res: Response) {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const userId = user.id;

    const userThreads = await findUserThreadDocuments({ creatorId: userId }, {}, {
        sort: {
            createdAt: -1
        }
    })
    return sendResponse(res, 200, "success", userThreads);
}

export async function createUserThreadsController(req: Request, res: Response) {
    const user = req.user;
    const { title } = req.body;
    // Hard-coded default assistantId
    const assistantId = req.body.assistantId || openAIDefaultAssistantId;
    if (!user) throw new RequestError("Could not verify user", 401);
    const userId = user.id;
    const thread: Thread = await openAIThreadsCreate()
    // increment userThreadCount
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        { $inc: { "userThreadCount": 1 }, },
        { upsert: true, new: true }
    );

    const dbThread = new UserThreadModel({
        title,
        createdAt: new Date(),
        creatorId: userId,
        updatedAt: new Date(),
        thread: {
           id: thread.id,
           created_at: thread.created_at,
           metadata: thread.metadata,
           object: thread.object 
        }
    })
    const createdThread = await dbThread.save()
    return sendResponse(res, 201, "success", createdThread);
}

export async function updateUserThreadsController(req: Request, res: Response) {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const userId = user.id;
    const { threadId } = req.params;

    const updatedThread = await findOneAndUpdateUserThreadDocument(
        {
            _id: threadId,
            creatorId: userId,
        },
        req.body
    );
    return sendResponse(res, 200, "success", updatedThread);
}

export async function deleteUserThreadsController(req: Request, res: Response) {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const userId = user.id;
    const { threadId } = req.params;

    const userThread = await findOneUserThread({
        _id: threadId,
        creatorId: userId,
    });
    if (!userThread) {
        throw new RequestError("UserThread not found", 404);
    }
    await openAIThreadsDel(userThread.thread.id);

    // decrement userThreadCount
    // const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
    //     { userId: userId },
    //     { $inc: { "userThreadCount": -1 } },
    //     { upsert: true, new: true }
    // );

    await userThread.deleteOne();
    return sendResponse(res, 200, "success", userThread);
}

export async function createMessageInUserThreadsController(req: Request, res: Response) {
    const user = req.user;
    if (!user) throw new RequestError("Could not verify user", 401);
    const userId = user.id;

    let { threadId, textMessage, shouldRun, title } = req.body;
    
    // Hard-coded default assistantId
    const assistantId = req.body.assistantId || openAIDefaultAssistantId;

    let dbThread: IUserThreadDocument | null = await findOneUserThread({
        _id: threadId,
        creatorId: userId,
    });
    
    if(!dbThread) {
        const thread: Thread = await openAIThreadsCreate()
        const dbThreadInstance = new UserThreadModel({
            title,
            createdAt: new Date(),
            creatorId: userId,
            updatedAt: new Date(),
            thread: {
               id: thread.id,
               created_at: thread.created_at,
               metadata: thread.metadata,
               object: thread.object 
            }
        })
        dbThread = await dbThreadInstance.save()
    }
    
    const message = await openAIThreadsMessagesCreate(dbThread?.thread.id as string, { content: textMessage, role: "user"  })

    if (!shouldRun) return sendResponse(res, 201, "success", { message, createdRun: null, userThread: dbThread });

    const createdRun = await openAIThreadRunCreate(dbThread.thread.id, { assistant_id: assistantId })

    return sendResponse(res, 201, "success", { message, createdRun, userThread: dbThread });
}

export async function threadsRunsStreamController(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const { userThreadId } = req.params;
  const { textMessage, title } = req.body;

  // Hard-coded default assistantId
  const assistantId = req.body.assistantId || openAIDefaultAssistantId;

  let dbThread = await findOneUserThread({
    _id: userThreadId,
    creatorId: userId,
  });

  if (!dbThread) {
    const thread: Thread = await openAIThreadsCreate();
    const dbThreadInstance = new UserThreadModel({
      title,
      createdAt: new Date(),
      creatorId: userId,
      updatedAt: new Date(),
      thread: {
        id: thread.id,
        created_at: thread.created_at,
        metadata: thread.metadata,
        object: thread.object,
      },
    });
    dbThread = await dbThreadInstance.save();
  }

  const message = await openAIThreadsMessagesCreate(
    dbThread?.thread.id as string,
    { content: textMessage, role: "user" }
  );

  // await openAIThreadsRunsStream(
  //   { res, user, useCredit: req?.useCredit },
  //   dbThread.thread.id,
  //   {
  //     assistant_id: assistantId,
  //   }
  // );

  await openAIThreadsRunsStreamWithEventHandler(
    { req, res },
    dbThread.thread.id,
    {
      assistant_id: assistantId,
    }
  );
}

export async function getMessagesInUserThreadsController(req: Request, res: Response) {
    const user = req.user;
    const { threadId } = req.params
    if (!user) throw new RequestError("Could not verify user", 401);
    const userThread = await findOneUserThread({
        _id: threadId,
        creatorId: user.id,
    });

    if (!userThread) {
        throw new RequestError("UserThread not found", 404);
    }
    const messages = await openAIThreadsMessagesList(userThread.thread.id, {
        order: "asc",
        limit: 100
    })

    return sendResponse(res, 200, "success", messages);
}

export async function createUserThreadsRunController(req: Request, res: Response) {
    const user = req.user;
    const { threadId, assistantId } = req.body
    if (!user) throw new RequestError("Could not verify user", 401);

    const createdRun = await openAIThreadRunCreate(threadId, { assistant_id: assistantId })

    return sendResponse(res, 200, "success", createdRun);
}

export async function getUserThreadsRunController(req: Request, res: Response) {
    const user = req.user;
    const { threadId, runId } = req.query;
    if (!user) throw new RequestError("Could not verify user", 401);
    if (!threadId) throw new RequestError("threadId is required", 400);
    if (!runId) throw new RequestError("runId is required", 400);
  const { id: userId } = user;

    const run = await openAIThreadRunGet(threadId as string, runId as string);

  // check run status
  if (run.status === "requires_action") {
    const updatedRun = handleThreadsRunsRequiresAction(run, user);
    return sendResponse(res, 200, "success", updatedRun);
  }
  //console.log("run.usage----->", run.usage);
  if (run.usage) {
    const { total_tokens } = run.usage;
    const updateObject: UpdateQuery<IUserUsageStat> = { $inc: {} };
    updateObject.$inc["totalRunTokenUsed"] =
        total_tokens || 0;

    if (req.useCredit) {
        // find stats price document
        const statsPrice = await findOneStatsPriceDocument(
            {}
        );

        const { unitCost = 0, perUnit = 1 } =
            statsPrice?.features?.tokens || {};
        const creditUsed =
            (unitCost / perUnit) * total_tokens;
        updateObject.$inc["credit.used"] = creditUsed || 0;
    }
    // increment totalRunTokenUsed 
    const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
      { userId: userId },
      updateObject,
      { upsert: true, new: true }
    );
  }
    return sendResponse(res, 200, "success", run);
}

export async function addDefaultAgent(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const userId = user.id;

  const { agentId } = req.body;
  if (!agentId) throw new RequestError("agentId is required", 400);

  const defaultAgent = await findOneDefaultAgentDocument({ _id: agentId }, {}, { lean: true });
  if (!defaultAgent) throw new RequestError("Could not find default agent");

  const {
    entityIds: defaultAgentEntityIds,
    initialPrompts,
    assistant: defaultOpenAiAssistant,
  } = defaultAgent;

  const { instructions, name, description, tool_resources, tools } = defaultOpenAiAssistant
  const metadata = defaultOpenAiAssistant.metadata as { entityIds: string, creatorId: string }

  // increment userAgentCount
  const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
    { userId: userId },
    { $inc: { userAgentCount: 1 } },
    { upsert: true, new: true }
  );
  
  // Create the new assistant with same parameters but new assistantId
  const assistant = await openAIAssistantsCreate({
    tool_resources: tool_resources,
    instructions,
    metadata: {
      creatorId: userId,
    },
    name,
    description,
    // tools,
    model: DEFAULT_MODEL,
  });

  // create userAgent document
  const userAgent = await createOneUserAgentDocument({
    creatorId: userId,
    assistant: assistant,
    entityIds: defaultAgentEntityIds,
    initialPrompts,
    isDefaultAgentAdded: true
  });

  return sendResponse(res, 200, "success", { userAgent });
}

export async function cancelThreadRunController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const { userThreadId } = req.params;

  // check thread is created by requested user
  const userThread = await findOneUserThread({
    _id: userThreadId,
    creatorId: userId,
  });
  if (!userThread) {
    throw new RequestError("UserThread not found", 404);
  }
  const { thread } = userThread;
  const { id: threadId } = thread || {};

  // get last run of thread
  const runs = await openAIThreadsRunsList(threadId, { limit: 1 });
  const run = runs?.[0];
  if (!run) {
    throw new RequestError("run not found for the requested thread", 404);
  }

  const { id: runId, status } = run;

  // if (status !== "queued" && status !== "in_progress") {
  //   throw new RequestError(`run is not active, run status is ${status}`, 400);
  // }

  const result = await openAIThreadsRunsCancel(threadId, runId);
  return sendResponse(res, 200, "success", result);
}
