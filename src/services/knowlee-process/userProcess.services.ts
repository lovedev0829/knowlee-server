import {
  CreateOptions,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import UserProcessModel, {
  IUserProcessDocument,
} from "../../models/knowlee-process/UserProcess.model";
import {
  openAIThreadRunCreate,
  openAIThreadsCreate,
  openAIThreadsMessagesCreate,
  waitForRunCompletion,
} from "../openAI.services";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { RUN_USER_PROCESS, agendaCancel } from "../../lib/agenda.services";
import { ObjectId } from "mongodb";

export async function createUserProcessDocument(
  docs: Array<Partial<IUserProcessDocument>>,
  options?: CreateOptions
) {
  return await UserProcessModel.create(docs, options);
}

export async function createOneUserProcessDocument(
  doc: Partial<IUserProcessDocument>
) {
  return await UserProcessModel.create(doc);
}

export async function findUserProcesses(
  filter: FilterQuery<IUserProcessDocument>,
  projection?: ProjectionType<IUserProcessDocument>,
  options?: QueryOptions<IUserProcessDocument>
) {
  return await UserProcessModel.find(filter, projection, options);
}

export async function findOneUserProcessDocument(
  filter: FilterQuery<IUserProcessDocument>,
  projection?: ProjectionType<IUserProcessDocument>,
  options?: QueryOptions<IUserProcessDocument>
) {
  return await UserProcessModel.findOne(filter, projection, options);
}

export const findOneAndUpdateUserProcess = async (
  filter?: FilterQuery<IUserProcessDocument>,
  update?: UpdateQuery<IUserProcessDocument>,
  options?: QueryOptions<IUserProcessDocument>
) => {
  return await UserProcessModel.findOneAndUpdate(filter, update, options);
};

export const deleteManyUserProcess = async (
  filter?: FilterQuery<IUserProcessDocument>,
  options?: QueryOptions<IUserProcessDocument>
) => {
  return await UserProcessModel.deleteMany(filter, options);
};

export const deleteOneUserProcess = async (
  filter?: FilterQuery<IUserProcessDocument>,
  options?: QueryOptions<IUserProcessDocument>
) => {
  return await UserProcessModel.deleteOne(filter, options);
};

export const countUserProcesses = async (
  filter?: FilterQuery<IUserProcessDocument>
) => {
  return await UserProcessModel.count(filter);
};

export async function processUserDefinedProcess({
  userProcessId,
}: {
  userProcessId: string;
}) {
  const userProcess = await findOneUserProcessDocument({
    _id: userProcessId,
  });
  if (!userProcess) throw new Error("Please specify a user process");
  // console.log("userProcess----->", userProcess);
  const { goals } = userProcess;

  // create new thread
  const thread = await openAIThreadsCreate({
    metadata: { type: "user-process-thread" },
  });
  const { id } = thread;
  const threadId = id;

  // save threadId to userProcessRunHistory
  await findOneAndUpdateUserProcess(
    { _id: userProcessId },
    {
      $push: {
        threadIds: threadId,
      },
    }
  );

  for (const goal of goals) {
    await openAIThreadsMessagesCreate(threadId, {
      content: goal?.goal,
      role: "user",
    });
    // create a new run
    const createdRun = await openAIThreadRunCreate(threadId, {
      assistant_id: goal?.assistantId,
    }) as Run;
    const { id: runId } = createdRun;

    // Wait for run completion
    await waitForRunCompletion(threadId, runId);
  }
  return threadId;
}

export async function cancelUserProcessAgendaJobs(userProcessId: string) {
  const jobName = `${RUN_USER_PROCESS}-${userProcessId}`;
  // cancel agenda job
  await agendaCancel({
    $or: [
      { name: jobName },
      { "data.jobName": jobName },
      { "data.userProcessId": new ObjectId(userProcessId) },
    ],
  });
}
