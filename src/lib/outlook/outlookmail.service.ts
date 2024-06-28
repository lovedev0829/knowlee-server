import axios from "axios";

const MICROSOFT_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

//
export async function outlookMailUsersMessagesSend({
    token,
    ...params
  
  }:{
    token: string
  }) {
  
    const response = await axios.post(
      `${MICROSOFT_GRAPH_BASE_URL}/me/sendMail`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      },
    );
  
    return response?.status;
  }
  
  //my mail that has 'Hello World'
  export async function outlookMailUsersMessagesSearch({
    token,
    keyword
  }: {
    token: string;
    keyword:string
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/messages?$search="${keyword}"`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value; // Return the HTTP status code if needed
  }

  //my high important mail
  export async function outlookMailUsersHighMessagesGet({
    token,
  }: {
    token: string;
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/messages?$filter=importance eq 'high'`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value; // Return the HTTP status code if needed
  }

  // my mails from an address 
  export async function outlookMailUsersMessagesByAddressGet({
    token,
    email
  }: {
    token: string;
    email:string;
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/messages?$filter=(from/emailAddress/address) eq '${email}'`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value; // Return the HTTP status code if needed
  }

  

  