import { linkedInRetrieveMemberDetails } from "../../../lib/linkedin/linkedin.services";
import { User } from "../../../models/user.model";

import axios from "axios";
import { findOneThirdPartyConfig } from "../../thirdPartyConfig.services";

interface ShareRequestBody {
    shareCommentary: string;
    shareMediaCategory: "NONE" | "ARTICLE" | "IMAGE";
    originalUrl?: string;
    title?: string;
    description?: string;
    visibility: "CONNECTIONS" | "PUBLIC";
}

export async function linkedInCreateShareFunction({
    user,
    shareCommentary,
    shareMediaCategory,
    originalUrl,
    title,
    description,
    visibility,
}: {
    user: User;
} & ShareRequestBody): Promise<any> {
    try {
        if (!user) return "please provide user";
        const { id: userId } = user;
        const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
        if (!thirdPartyConfig) {
            throw new Error("Not Authorized: No third party config found");
        }
        const linkedInToken = thirdPartyConfig?.linkedin?.token;
        if (!linkedInToken) {
            throw new Error("Not Authorized: No LinkedIn token found");
        }

        const author = `urn:li:person:${thirdPartyConfig.linkedin?.userInfo?.sub}`;

        //console.log("author----->", author);
        const requestBody: any = {
            author,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: shareCommentary,
                    },
                    shareMediaCategory,
                },
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": visibility,
            },
        };

        if (shareMediaCategory === "ARTICLE" || shareMediaCategory === "IMAGE") {
            requestBody.specificContent["com.linkedin.ugc.ShareContent"].media = [
                {
                    status: "READY",
                    originalUrl,
                    title: { text: title },
                    description: { text: description },
                },
            ];
        }

        const response = await axios.post(
            "https://api.linkedin.com/v2/ugcPosts",
            requestBody,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0",
                    Authorization: `Bearer ${linkedInToken.access_token}`,
                },
            }
        );

        if (response.status === 201) {
            //console.log("Share created successfully!");
            return response.data;
        } else {
            throw new Error("Failed to create share. Status: " + response.status);
        }
    } catch (error: any) {
        const errorMessage = error.response ? error.response.data : error.message;
        //console.log("Error creating share:----->", errorMessage);
        return errorMessage;
    }
}

// // Example usage:
// linkedInCreateShareFunction({
//     shareCommentary: "Hello World! This is my first Share on LinkedIn!",
//     shareMediaCategory: "NONE",
//     visibility: "PUBLIC"
// })
