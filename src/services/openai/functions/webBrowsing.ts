import { User } from "../../../models/user.model";
import axios from "axios";

const SCALE_SERP_API_KEY = process.env.SCALE_SERP_API_KEY;

if (!SCALE_SERP_API_KEY) {
    throw new Error("Missing Scale SERP API key. Please set the SCALE_SERP_API_KEY environment variable.");
}

export async function webBrowsingFunction({
    user,
    ...params
}: {
    user: User;
    [key: string]: unknown;
}) {
    if (!user) return "Please provide user";

    try {
        const response = await axios.get("https://api.scaleserp.com/search", {
            params: {
                api_key: SCALE_SERP_API_KEY,
                ...params,
            },
        });

        // Filter out unnecessary fields from news results
        const filteredResults = response.data.news_results.map((result: any) => {
            const { thumbnail, date, date_utc, domain, position, source, ...filteredResult } = result;
            return filteredResult;
        });

        return {
            news_results: filteredResults,
        };
    } catch (error: any) {
        const errorMessage = error?.response?.data || error.message;
        console.error(errorMessage);
        return errorMessage;
    }
}
