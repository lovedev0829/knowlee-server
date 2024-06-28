import axios from "axios";

const MICROSOFT_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

export async function getUsersJoinedTeams({
    token,
  }: {
    token: string;
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/joinedTeams`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }


  export async function getMembersofTeam({
    token,
    teamId
  }: {
    token: string;
    teamId:string
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/teams/${teamId}/members`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }


  export async function getChannelsofTeam({
    token,
    teamId
  }: {
    token: string;
    teamId:string
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/teams/${teamId}/channels`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }

  export async function getChannelInfo({
    token,
    teamId,
    channelId
  }: {
    token: string;
    teamId:string;
    channelId:string
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/teams/${teamId}/channels/${channelId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }

  
  export async function getItemsByGroupId({
    token,
    groupId,
  }: {
    token: string;
    groupId:string;
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/groups/${groupId}/drive/items/root/children`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }

    
export async function createTeamsChat({
    token,
    ...params
  }: {
    token: string;
  }) {
    
    const response = await axios.post(
      `${MICROSOFT_GRAPH_BASE_URL}/chats`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.status;
  }
  

interface OutlookTeamsParams {
    teamId: string,
    channelId:string,
    groupId:string
}

export async function sendChannelMsg({
    token,
    ...params
  }: {
    token: string;
  }& OutlookTeamsParams) {
    
    const response = await axios.post(
      `${MICROSOFT_GRAPH_BASE_URL}/teams/${params?.teamId}/channels/${params?.channelId}/messages`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response?.status;
  }