import {
    getMicrosoftTokenOfUser,
  } from "../../../lib/microsoft/microsoft.services";
  
  import {
    getEventsForNextWeek,
    getUsersEvents,
    getUsersCalendars,
    getUsersMeetingTimes,
    usersScheduleMeetingTime,
    usersGraphCommunityCallAdd,
    usersTrackChangesEvents
  } from "../../../lib/outlook/outlookcalendar.service";
  
  import { User } from "../../../models/user.model";
  
  
  interface OutlookCalendarUsersEventsNextWeekParams {
    startdatetime: string,
    enddatetime: string
  }

  // User's events for the next week

  export async function outlookCalendarUsersEventsNextWeekGetFunction({
    user,
    ...params
  }: {
    user: User;
  }&OutlookCalendarUsersEventsNextWeekParams) {
    try {
      //console.log("Next Events Params:", params);
      if (!user) return "please provide user";
      const { id: userId } = user;
      const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
      const { access_token: token } = accessToken;
      const res = await getEventsForNextWeek({ token: token, startDateTime: params?.startdatetime, endDateTime:params?.enddatetime });
      return res;
  
    } catch (error: any) {
  
      //console.log("error----->", error);
  
      return error?.message;
    }
  }


  // all events in user's calendar
  export async function outlookCalendarUsersEventsGetFunction({
    user,
  }: {
    user: User;
  }) {
    try {
      if (!user) return "please provide user";
      const { id: userId } = user;
      const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
      const { access_token: token } = accessToken;
      const res = await getUsersEvents({ token: token});
      return res;
  
    } catch (error: any) {
  
      //console.log("error----->", error);
  
      return error?.message;
    }
}

  // users all calendars
  export async function outlookCalendarUsersCalendarsGetFunction({
    user,
  }: {
    user: User;
  }) {
    try {
      if (!user) return "please provide user";
      const { id: userId } = user;
      const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
      const { access_token: token } = accessToken;
      const res = await getUsersCalendars({ token: token});
      return res;
  
    } catch (error: any) {
  
      //console.log("error----->", error);
  
      return error?.message;
    }
}

  
  // find meeting time
  export async function outlookCalendarUsersMeetingTimesGetFunction({
    user,
    ...params
  }: {
    user: User;
  }) {
    try {
      if (!user) return "please provide user";
      const { id: userId } = user;
      const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
      const { access_token: token } = accessToken;
      const res = await getUsersMeetingTimes({ token: token, ...params});
      return res;
  
    } catch (error: any) {
  
      //console.log("error----->", error);
  
      return error?.message;
    }
}

  // Users schedule a meeting
  export async function outlookCalendarUsersMeetingScheduleInsertFunction({
    user,
    ...params
  }: {
    user: User;
  }) {
    try {
      if (!user) return "please provide user";
      const { id: userId } = user;
      const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
      const { access_token: token } = accessToken;
      const res = await usersScheduleMeetingTime({ token: token, ...params});
      return res;
  
    } catch (error: any) {
  
      //console.log("error----->", error);
  
      return error?.message;
    }
}

  // Users add graph community call
  export async function outlookCalendarUsersGraphCallAddFunction({
    user,
    ...params
  }: {
    user: User;
  }) {
    try {
      if (!user) return "please provide user";
      const { id: userId } = user;
      const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
      const { access_token: token } = accessToken;
      const res = await usersGraphCommunityCallAdd({ token: token, ...params});
      return res;
  
    } catch (error: any) {
  
      //console.log("error----->", error);
  
      return error?.message;
    }
}

  // track changes on users events for the next week
  export async function outlookCalendarUsersEventsTrackGetFunction({
    user,
    ...params
  }: {
    user: User;
  }&OutlookCalendarUsersEventsNextWeekParams) {
    try {
      if (!user) return "please provide user";
      const { id: userId } = user;
      const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
      const { access_token: token } = accessToken;
      const res = await usersTrackChangesEvents({ token: token, startDateTime: params?.startdatetime, endDateTime:params?.enddatetime});
      return res;
  
    } catch (error: any) {
  
      //console.log("error----->", error);
  
      return error?.message;
    }
}