import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import {
  cancelUserProcessAgendaJobs,
  createOneUserProcessDocument,
  deleteOneUserProcess,
  findOneAndUpdateUserProcess,
  findOneUserProcessDocument,
  findUserProcesses,
  processUserDefinedProcess,
} from "../services/knowlee-process/userProcess.services";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import {
  RUN_USER_PROCESS,
  SCHEDULE_RECURRING_USER_PROCESS,
  agendaDefine,
  agendaEvery,
  agendaSchedule,
} from "../lib/agenda.services";
import { Job } from "agenda";
import { runUserProcessProcessor } from "../lib/agendaProcessor";
import {
  IRunUserProcess,
  IScheduleRecurringUserProcess,
} from "../types/agenda";
import {
  openAIAssistantsCreate,
  openAIRetrieveThreadsFromThreadIds,
  openAIThreadsMessagesList,
  openAIThreadsRunsList,
} from "../services/openAI.services";
import {
  createOneUserAgentDocument,
  findOneUserAgentDocument,
} from "../services/knowlee-agent/agent.services";
import { DEFAULT_MODEL } from "./knowleeAgent.controller";

export async function createUserProcessController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const { name, goals, isRecurring, scheduledAt, interval, avatar } =
    req.body;
  if (!name) throw new RequestError("name is required", 400);
  if (!goals || !goals.length) throw new RequestError("goals is required", 400);

  const userProcess = await createOneUserProcessDocument({
    creatorId: userId,
    goals,
    avatar,
    name,
    isRecurring,
    scheduledAt,
    interval,
  });

  let job: Job | undefined;
  if (isRecurring && interval) {
    const jobName = `${RUN_USER_PROCESS}-${userProcess._id}`;
    // define job for each process
    await agendaDefine<IRunUserProcess>(
      jobName,
      { shouldSaveResult: true },
      runUserProcessProcessor
    );
    if (scheduledAt) {
      // start scheduling from scheduledAt time
      job = await agendaSchedule<IScheduleRecurringUserProcess>(
        scheduledAt,
        SCHEDULE_RECURRING_USER_PROCESS,
        {
          userProcessId: userProcess._id,
          jobName,
          interval: interval,
        }
      );
    } else {
      //  schedule agenda job to run the user process at every interval hours
      job = await agendaEvery(
        `${interval} hours`,
        jobName,
        {
          userProcessId: userProcess._id,
        },
        {
          skipImmediate: true,
        }
      );
    }
  } else if (scheduledAt) {
    //  schedule agenda job to run the user process
    job = await agendaSchedule<IRunUserProcess>(scheduledAt, RUN_USER_PROCESS, {
      userProcessId: userProcess._id,
    });
  }

  if (job) {
    // console.log("New job scheduled ", job?.attrs?._id);
    // update jobId to user process
    userProcess.set("jobId", job?.attrs?._id);
    await userProcess.save();
  }

  // increment user process count by 1 in user usage stat
  await findOneAndUpdateUserUsageStatDocument(
    { userId: userId },
    { $inc: { userProcessCount: 1 } },
    { upsert: true, new: true }
  );

  return sendResponse(res, 200, "success", userProcess);
}

export async function updateUserProcessController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const { processId } = req.params;
  const userProcess = await findOneUserProcessDocument({
    _id: processId,
    creatorId: userId,
  });
  if (!userProcess)
    throw new RequestError("Could not find User process", 404);

  const {
    avatar,
    name,
    goals,
    isRecurring,
    scheduledAt,
    interval,
  } = req.body;

  let job: Job | undefined;
  if (isRecurring && interval) {
    await cancelUserProcessAgendaJobs(processId);
    const jobName = `${RUN_USER_PROCESS}-${processId}`;
    // define job for each process
    await agendaDefine<IRunUserProcess>(
      jobName,
      { shouldSaveResult: true },
      runUserProcessProcessor
    );
    if (scheduledAt) {
      // start scheduling from scheduledAt time
      job = await agendaSchedule<IScheduleRecurringUserProcess>(
        scheduledAt,
        SCHEDULE_RECURRING_USER_PROCESS,
        {
          userProcessId: userProcess._id,
          jobName,
          interval,
        }
      );
    } else {
      //  schedule agenda job to run the user process at every interval hours
      // Every creates a job of type single, which means that it will only create one job in the database, even if that line is run multiple times.
      job = await agendaEvery(
        `${interval} hours`,
        jobName,
        {
          userProcessId: userProcess._id,
        },
        {
          skipImmediate: true,
        }
      );
    }
  } else if (scheduledAt && scheduledAt !== userProcess.scheduledAt) {
    await cancelUserProcessAgendaJobs(processId);
    //  schedule agenda job to run the user process
    job = await agendaSchedule<IRunUserProcess>(scheduledAt, RUN_USER_PROCESS, {
      userProcessId: userProcess._id,
    });
  }

  if (job) {
    // console.log("New job scheduled ", job?.attrs?._id);
    // update jobId to user process
    userProcess.set("jobId", job?.attrs?._id);
    await userProcess.save();
  }

  const updatedUserProcess = await findOneAndUpdateUserProcess(
    { _id: processId },
    {
      $set: {
        avatar: avatar,
        name: name,
        goals: goals,
        isRecurring: isRecurring,
        scheduledAt: scheduledAt,
        interval: interval,
      },
    },
    { new: true }
  );

  return sendResponse(res, 200, "success", updatedUserProcess);
}

export async function retrieveUserProcessController(
  req: Request,
  res: Response
) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;
  const { processId } = req.params;
  const userProcess = await findOneUserProcessDocument({
    _id: processId,
    creatorId: userId,
  });

  if (!userProcess)
    throw new RequestError("Could not find this user process", 404);

  const { threadIds = [] } = userProcess;

  const threads = await openAIRetrieveThreadsFromThreadIds(threadIds);

  return sendResponse(res, 200, "success", {
    ...(userProcess.toJSON() || {}),
    threads: threads,
  });
}

export async function deleteUserProcessController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const { processId } = req.params;

  const userProcess = await findOneUserProcessDocument({
    _id: processId,
    creatorId: userId,
  });
  if (!userProcess) throw new RequestError("user process not found", 404);

  await cancelUserProcessAgendaJobs(processId);

  // decrement count for user process
  // await findOneAndUpdateUserUsageStatDocument(
  //   { userId: userId },
  //   { $inc: { userProcessCount: -1 } },
  //   { upsert: true, new: true }
  // );

  await deleteOneUserProcess({
    _id: processId,
    creatorId: userId,
  });

  return sendResponse(res, 200, "success");
}

export async function getUserProcessesController(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const userProcesses = await findUserProcesses({ creatorId: userId });
  return sendResponse(res, 200, "success", userProcesses);
}

export async function manuallyRunUserProcessController(
  req: Request,
  res: Response
) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const { processId } = req.params;
  const threadId = await processUserDefinedProcess({
    userProcessId: processId,
  });
  return sendResponse(res, 200, "success", threadId);
}

export async function getDefaultProcessesController(
  req: Request,
  res: Response
) {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const defaultProcesses = await findUserProcesses({
    isDefault: true,
  });
  return sendResponse(res, 200, "success", defaultProcesses);
}

export async function getMessagesOfUserProcessThreadController(req: Request, res: Response) {
  const user = req.user;
  const { threadId } = req.params
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const userProcess = await findOneUserProcessDocument({
    creatorId: userId,
    threadIds: threadId,
  });

  if (!userProcess) {
    throw new RequestError("User process not found", 404);
  }
  const messages = await openAIThreadsMessagesList(threadId, {
    order: "asc",
    limit: 100
  })

  return sendResponse(res, 200, "success", messages);
}

export async function getRunsOfUserProcessThreadController(req: Request, res: Response) {
  const user = req.user;
  const { threadId } = req.params
  if (!user) throw new RequestError("Could not verify user", 401);
  const { id: userId } = user;

  const userProcess = await findOneUserProcessDocument({
    creatorId: userId,
    threadIds: threadId,
  });

  if (!userProcess) {
    throw new RequestError("User process not found", 404);
  }
  const runs = await openAIThreadsRunsList(threadId, {
    limit: 100,
    ...req.query,
  });
  return sendResponse(res, 200, "success", runs);
}

export async function addDefaultProcess(req: Request, res: Response) {
  const user = req.user;
  if (!user) throw new RequestError("User not found in request", 401);
  const { id: userId } = user;

  const { processId } = req.body;
  if (!processId) throw new RequestError("processId is required", 400);

  const defaultProcess = await findOneUserProcessDocument({
    _id: processId,
    isDefault: true,
  });

  if (!defaultProcess) throw new RequestError("Could not find default process");

  const { name, goals } = defaultProcess;

  const userGoals: {
    goal: string;
    assistantId: string;
  }[] = [];

  const assistantIdMap: {
    [key: string]: string;
  } = {};

  for (const defaultGoal of goals) {
    const { assistantId, goal } = defaultGoal;
    const userAgent = await findOneUserAgentDocument({
      "assistant.id": assistantId,
    });
    if (!userAgent) {
      // console.log(`userAgent not found with assistant id = ${assistantId}`);
      continue;
    }
    const {
      assistant,
      avatar,
      entityIds,
      initialPrompts,
      functionDefinitions,
      functionTypes,
    } = userAgent.toJSON();
    const { tool_resources, instructions, tools } = assistant;

    if (userAgent.creatorId === userId) {
      userGoals.push(defaultGoal);
    } else {
      if (assistantIdMap[assistantId]) {
        userGoals.push({
          goal: goal,
          assistantId: assistantIdMap[assistantId],
        });
        continue;
      }
      //create assistant with same parameters
      const newAssistant = await openAIAssistantsCreate({
        instructions,
        metadata: {
          creatorId: userId,
        },
        model: DEFAULT_MODEL,
        name: assistant?.name,
        tool_resources,
        tools: tools?.map((tool) => ({ ...tool, _id: undefined })),
      });
      const { id: newAssistantId } = newAssistant;
      assistantIdMap[assistantId] = newAssistantId;

      // create userAgent document
      const userAgent = await createOneUserAgentDocument({
        assistant: newAssistant,
        avatar,
        creatorId: userId,
        entityIds,
        initialPrompts,
        functionDefinitions,
        functionTypes,
      });

      // increment userAgentCount
      const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
        { userId: userId },
        { $inc: { userAgentCount: 1 } },
        { upsert: true, new: true }
      );
      userGoals.push({
        goal: goal,
        assistantId: newAssistantId,
      });
    }
  }

  // create user process
  const userProcess = await createOneUserProcessDocument({
    creatorId: userId,
    // goals: goals,
    goals: userGoals,
    isDefault: false,
    name: name,
  });

  // increment user process count by 1 in user usage stat
  await findOneAndUpdateUserUsageStatDocument(
    { userId: userId },
    { $inc: { userProcessCount: 1 } },
    { upsert: true, new: true }
  );

  return sendResponse(res, 200, "success", userProcess);
}
