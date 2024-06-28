import { User } from "../../../models/user.model";
import {
  APIFY_ACTOR_ID,
  runApifyActorAndGetResults,
} from "../../apify.services";

type ApifyLinkedInJobSearchInput = {
  searchUrl: string;
  scrapeCompany: boolean;
  startPage?: number;
  count?: number;
  cookies?: string[];
  scrapeJobDetails: boolean;
  scrapeSkills: boolean;
  minDelay?: number;
  maxDelay?: number;
};

export async function apifyAdvancedLinkedInJobScraperFunction({
  user,
  ...input
}: {
  user: User;
} & ApifyLinkedInJobSearchInput) {
  try {
    const result = await runApifyActorAndGetResults(APIFY_ACTOR_ID.linkedin.url, {
      count: 5,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["BUYPROXIES94952"],
        apifyProxyCountry: "US",
      },
      ...input,
    });

    const optimizedResponse = result.items.map((item: any) => ({
      title: item.title,
      company: item.companyName,
      location: item.location,
      link: item.link,
      description: item.descriptionText,
    }));

    return optimizedResponse;
  } catch (error: any) {
    const errorMessage = error.response ? error.response.data : error.message;
    // console.log("Error scraping LinkedIn jobs:----->", errorMessage);
    return { error: errorMessage };
  }
}
