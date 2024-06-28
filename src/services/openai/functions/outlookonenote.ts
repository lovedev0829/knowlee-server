import { getMicrosoftTokenOfUser } from "../../../lib/microsoft/microsoft.services";
import {
  getUsersNotebooks,
  getUsersNoteBookSections,
  getUsersNoteBookPages,
  outlookOneNoteBookCreate,
  outlookOneNoteBookSectionCreate,
  outlookOneNoteUsersPageCreate,
} from "../../../lib/outlook/outlookonenote.service";
import { User } from "../../../models/user.model";

// Helper function to get the auth token
async function getAuthToken(user: User): Promise<string> {
  if (!user) throw new Error("Please provide user");
  const { id: userId } = user;
  const accessToken = await getMicrosoftTokenOfUser({ userId });
  return accessToken.access_token;
}

// Helper function to handle API calls
async function handleApiCall(fn: Function, token: string, params: any) {
  try {
    const res = await fn({ token, ...params });
    return res;
  } catch (error: any) {
    console.error("API call error----->", error.response ? error.response.data : error);
    throw new Error(error?.message || "An error occurred");
  }
}

// Get users' notebooks
export async function outlookOneNoteUsersNotebooksGetFunction({
  user,
}: {
  user: User;
}) {
  const token = await getAuthToken(user);
  return await handleApiCall(getUsersNotebooks, token, {});
}

// Get users' notebook sections
export async function outlookOneNoteUsersSectionsGetFunction({
  user,
}: {
  user: User;
}) {
  const token = await getAuthToken(user);
  return await handleApiCall(getUsersNoteBookSections, token, {});
}

// Get users' notebook pages
export async function outlookOneNoteUsersPagesGetFunction({
  user,
}: {
  user: User;
}) {
  const token = await getAuthToken(user);
  return await handleApiCall(getUsersNoteBookPages, token, {});
}

// Create Notebook
export async function outlookOneNoteUsersNotebookCreateFunction({
  user,
  ...params
}: {
  user: User;
}) {
  const token = await getAuthToken(user);
  return await handleApiCall(outlookOneNoteBookCreate, token, params);
}

// Create Notebook Section
interface OutlookOneNoteUsersSectionCreateParams {
  notebookId: string;
  displayName: string;
}

export async function outlookOneNoteUsersSectionCreateFunction({
  user,
  ...params
}: {
  user: User;
} & OutlookOneNoteUsersSectionCreateParams) {
  const token = await getAuthToken(user);
  return await handleApiCall(outlookOneNoteBookSectionCreate, token, {
    notebookId: params.notebookId,
    displayName: params.displayName,
  });
}

// Create Notebook Page
interface OutlookOneNoteUsersPageCreateParams {
  sectionId: string;
  page: string;
}

export async function outlookOneNoteUsersPageCreateFunction({
  user,
  ...params
}: {
  user: User;
} & OutlookOneNoteUsersPageCreateParams) {
  const token = await getAuthToken(user);
  return await handleApiCall(outlookOneNoteUsersPageCreate, token, {
    sectionId: params.sectionId,
    pageContent: params.page,
  });
}
