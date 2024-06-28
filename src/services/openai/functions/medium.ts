import axios, { AxiosError } from "axios";
import { User } from "../../../models/user.model";
import { findOneThirdPartyConfig } from "../../thirdPartyConfig.services";

export const MEDIUM_BASE_URL = "https://api.medium.com/v1";

export async function mediumCreateShareFunction({
    user,
    title,
    content,
    canonicalUrl,
    tags,
    contentFormat,
    publishStatus = "public",
    license = "all-rights-reserved",
    notifyFollowers = true,
  }: {
    user: User;
    title: string;
    content: string;
    canonicalUrl?: string;
    tags: string[];
    contentFormat: string;
    publishStatus?: "public" | "draft" | "unlisted";
    license?: "all-rights-reserved" | "cc-40-by" | "cc-40-by-sa" | "cc-40-by-nd" | "cc-40-by-nc" | "cc-40-by-nc-nd" | "cc-40-by-nc-sa" | "cc-40-zero" | "public-domain";
    notifyFollowers: boolean;
  }) {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
    if (!thirdPartyConfig) {
      throw new Error("Not Authorized: No third party config found");
    }
    const MEDIUM_USER_ID = thirdPartyConfig?.medium?.userInfo?.id;
    const MEDIUM_AUTH_TOKEN = thirdPartyConfig?.medium?.token?.access_token;

    // Define the payload
    const payload = {
      title,
      content,
      canonicalUrl,
      tags,
      contentFormat,
      publishStatus,
      license,
      notifyFollowers
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
      console.log("Article published successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error publishing medium article:", (error as AxiosError)?.response?.data);
      throw error;
    }
  }