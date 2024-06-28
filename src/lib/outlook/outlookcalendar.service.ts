import axios from "axios";

const MICROSOFT_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

//Get users events for the next week
export async function getEventsForNextWeek({
    token,
    startDateTime,
    endDateTime,
  }: {
    token: string;
    startDateTime:string;
    endDateTime:string;
  }) {
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/calendarview?startdatetime=${startDateTime}&enddatetime=${endDateTime}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }


//Get all events in user's calendar
export async function getUsersEvents({
    token,
  }: {
    token: string;
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/events?$select=subject,body,bodyPreview,organizer,attendees,start,end,location`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value; 
  }


//Get Users all calendars
export async function getUsersCalendars({
    token,
  }: {
    token: string;
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/calendars`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }

  //Find Users all calendars
export async function getUsersMeetingTimes({
    token,
    ...params
  }: {
    token: string;
  }) {
    
    const response = await axios.post(
      `${MICROSOFT_GRAPH_BASE_URL}/me/findMeetingTimes`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response?.data?.value; 
  }

//schedule a meeting
export async function usersScheduleMeetingTime({
    token,
    ...params
  }: {
    token: string;
  }) {
    
    const response = await axios.post(
      `${MICROSOFT_GRAPH_BASE_URL}/me/events`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response?.status; // Return the HTTP status code if needed
  }


//add graph community call
export async function usersGraphCommunityCallAdd({
    token,
    ...params
  }: {
    token: string;
  }) {
    
    const response = await axios.post(
      `${MICROSOFT_GRAPH_BASE_URL}/me/events`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response?.status; // Return the HTTP status code if needed
  }


//track changes on my events for the next week
export async function usersTrackChangesEvents({
    token,
    startDateTime,
    endDateTime
  }: {
    token: string;
    startDateTime: string;
    endDateTime:string
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/calendarView/delta?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response?.data?.value; 
  }