import axios from "axios";
import { RequestError } from "../../utils/globalErrorHandler";

import {
    findOneThirdPartyConfig,
  } from "../../services/thirdPartyConfig.services";

const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!;
const NOTION_BASE_URL = "https://api.notion.com/v1";


// replace 127.0.0.1 with localhost
// notion redirect URI does not support 127.0.0.1
const redirectUri = `${SERVER_BASE_URL?.replace(
  "127.0.0.1",
  "localhost"
)}/api/third-party/notion/auth/callback`;

export async function notionGetAuthCodeUrl({ userId }: { userId: string }) {
  return `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${redirectUri}&state={"userId":"${userId}"}`
}

export async function notionAcquireTokenByCode({ code }: { code: string }) {
 
    const encoded = Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString("base64");

    const response = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${encoded}`,
    },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });

     // Parse the JSON response
     const data = await response.json();
     // Extract the access token from the response
     const accessToken = data.access_token;
    //  console.log("accessToken:", accessToken);
     return { access_token: accessToken };
}

export async function getTokenByUser({ userId }: { userId: string }) {
    
    
    const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
    if (!thirdPartyConfig) {
       throw new RequestError("Not Authorized: No third party config found");
    }
  
    const notionToken = thirdPartyConfig?.notion?.token;
  
    if (!notionToken) {
       throw new RequestError("Not Authorized: No microsoft token found");
    }
  
    // console.log("notionTokenByuserId:", notionToken)
  
    return notionToken?.access_token;
  }

export const handleHttpGet = async({
    accessToken, 
    httpURL, 
}:{
    accessToken: any, 
    httpURL: string, 
}) => {

const response = await axios.get(
    `${NOTION_BASE_URL}/${httpURL}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-02-22', 
        'Content-Type': 'application/json'
      },
    }
);

return response?.data; // Return the HTTP status code if needed
}

export const handleHttpPost = async({
    accessToken, 
    httpURL, 
    httpMethod,
    ...params
}:{
    accessToken: any, 
    httpURL: string, 
    httpMethod: string,
}) => {

const response = await axios.request({
     method: httpMethod,
     url: `${NOTION_BASE_URL}/${httpURL}`,
     headers: {
        "Authorization": `Bearer ${accessToken}`,
        'Notion-Version': '2022-02-22',
     },
     data: params
});

return response?.data;
}