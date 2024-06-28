import axios, { AxiosError } from "axios";

const MEDIUM_USER_ID = process.env.MEDIUM_USER_ID!;
const MEDIUM_AUTH_TOKEN = process.env.MEDIUM_AUTH_TOKEN!;
// const MEDIUM_AUTH_STATE = process.env.MEDIUM_AUTH_STATE!;
// const SERVER_BASE_URL = process.env.SERVER_BASE_URL!;
export const MEDIUM_BASE_URL = "https://api.medium.com/v1";

export type MediumMemberDetail = {
  data: {
    id: string;
    username: string;
    name: string;
    url: string;
    imageUrl: string;
  }
}

// export function getMediumAuthURL({ userId }: { userId: string }) {
//   const redirectURI = `${SERVER_BASE_URL}/api/medium/callback?userId=${userId}`;
//  - with new routes of thirdpartyconfigs
//   const redirectURI = `${SERVER_BASE_URL}/api/third-party/medium/auth/callback?userId=${userId}`;
//   const authURL = `https://medium.com/m/oauth/authorize?client_id=${MEDIUM_CLIENT_ID}&scope=basicProfile,listPublications,publishPost,uploadImage&state=${MEDIUM_AUTH_STATE}&response_type=code&redirect_uri=${redirectURI}`;
//   return authURL;
// }

// Function to publish an article on Medium
export async function publishMediumArticle({
  title,
  content,
  canonicalUrl,
  tags,
}: {
  title: string;
  content: string;
  canonicalUrl?: string;
  tags: string[];
}) {
  // Define the payload
  const payload = {
    title,
    contentFormat: "markdown",
    content,
    canonicalUrl,
    tags,
    publishStatus: "public",
  };

  // Define the API endpoint
  const endpoint = `${MEDIUM_BASE_URL}/users/${MEDIUM_USER_ID}/posts`;

  // Define the authorization token
  const authToken = `Bearer ${MEDIUM_AUTH_TOKEN}`;

  // Make the API call
  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Charset": "utf-8",
      },
    });
    // console.log("Article published successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error publishing medium article:", (error as AxiosError)?.response?.data);
    throw error;
  }
}

export async function mediumRetrieveMemberDetails({
  accessToken,
}: {
  accessToken: string
}) {
  const response = await axios.get<MediumMemberDetail>(
    `${MEDIUM_BASE_URL}/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data.data;
}