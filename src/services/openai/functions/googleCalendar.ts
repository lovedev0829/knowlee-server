import { calendar_v3 } from "googleapis";
import { getGoogleOAuth2ClientOfUser } from "../../../lib/google/google.services";
import {
  gCalCalenderListList,
  gCalEventsDelete,
  gCalEventsGet,
  gCalEventsInsert,
  gCalEventsList,
  gCalEventsUpdate,
} from "../../../lib/google/googleCalendar.services";
import { User } from "../../../models/user.model";

// Helper function to get the auth client
async function getAuthClient(user: User) {
  if (!user) throw new Error("Please provide user");
  const { id: userId } = user;
  return await getGoogleOAuth2ClientOfUser({ userId });
}

// Helper function to handle API calls
async function handleApiCall(fn: Function, auth: any, params: any) {
  try {
    const res = await fn({ auth, ...params });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    throw new Error(error?.message || "An error occurred");
  }
}

export async function gCalCalenderListListFunction({
  user,
  ...params
}: {
  user: User;
} & calendar_v3.Params$Resource$Calendarlist$List) {
  const auth = await getAuthClient(user);
  return await handleApiCall(gCalCalenderListList, auth, params);
}

export async function gCalEventsDeleteFunction({
  user,
  ...params
}: {
  user: User;
} & calendar_v3.Params$Resource$Events$Delete) {
  const auth = await getAuthClient(user);
  return await handleApiCall(gCalEventsDelete, auth, params);
}

export async function gCalEventsGetFunction({
  user,
  ...params
}: {
  user: User;
} & calendar_v3.Params$Resource$Events$Get) {
  const auth = await getAuthClient(user);
  return await handleApiCall(gCalEventsGet, auth, params);
}

export async function gCalEventsInsertFunction({
  user,
  ...params
}: {
  user: User;
} & calendar_v3.Params$Resource$Events$Insert) {
  const auth = await getAuthClient(user);
  return await handleApiCall(gCalEventsInsert, auth, params);
}

export async function gCalEventsListFunction({
  user,
  ...params
}: {
  user: User;
} & calendar_v3.Params$Resource$Events$List) {
  const auth = await getAuthClient(user);
  return await handleApiCall(gCalEventsList, auth, params);
}

// Function to update an event with proper start and end time
export async function gCalEventsUpdateFunction({
  user,
  calendarId,
  eventId,
  resource,
  ...params
}: {
  user: User;
  calendarId: string;
  eventId: string;
  resource: {
    summary: string;
    attendees: calendar_v3.Schema$EventAttendee[];
    start: calendar_v3.Schema$EventDateTime;
    end: calendar_v3.Schema$EventDateTime;
    description?: string;
  };
} & Omit<calendar_v3.Params$Resource$Events$Update, 'resource'>) {
  try {
    if (!user) throw new Error("Please provide user");
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId });

    // Ensure start and end times are provided
    const { start, end } = resource;
    if (!start || !end) {
      throw new Error("Missing start or end time.");
    }

    const res = await gCalEventsUpdate({
      auth,
      calendarId,
      eventId,
      requestBody: {
        ...resource,
        ...params,
      },
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}
