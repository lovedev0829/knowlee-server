import { getJson } from "serpapi";

// Ensure the API key is set from environment variables
const SERP_GOOGLE_JOBS_API_KEY = process.env.SERP_GOOGLE_JOBS_API_KEY;
const DEFAULT_ENGINE = "google_jobs";

if (!SERP_GOOGLE_JOBS_API_KEY) {
    throw new Error("Missing SERP API key. Please set the SERP_GOOGLE_JOBS_API_KEY environment variable.");
}

export async function serpapiGoogleJobFunction({
  q,
  hl = "en",
  location,
  uule,
  google_domain,
  gl,
  start,
  chips,
  lrad,
  ltype,
  no_cache,
  async,
  output = "json",
}: {
  q: string;
  hl?: string;
  location?: string;
  uule?: string;
  google_domain?: string;
  gl?: string;
  start?: number;
  chips?: string;
  lrad?: number;
  ltype?: string;
  no_cache?: boolean;
  async?: boolean;
  output?: 'json' | 'html';
}) {
  return new Promise((resolve, reject) => {
    // Check if the 'q' parameter is provided
    if (!q) {
      reject(new Error("Missing query `q` parameter."));
      return;
    }

    getJson(
      DEFAULT_ENGINE,
      {
        q,
        hl,
        location,
        uule,
        google_domain,
        gl,
        start,
        chips,
        lrad,
        ltype,
        no_cache,
        async,
        output,
        api_key: SERP_GOOGLE_JOBS_API_KEY,
      },
      (json) => {
        if (json) {
          // console.log("Response from SERP API:", json);

          if (json.error) {
            // Handle API errors gracefully
            reject(new Error(`API Error: ${json.error}`));
            return;
          }

          switch (output) {
            case 'json':
              if (json["jobs_results"]) {
                // Extracting and simplifying the necessary fields
                const optimizedResponse = json["jobs_results"].map((job: any) => ({
                  title: job.title,
                  company: job.company_name,
                  location: job.location,
                  description: job.description,
                  link: job.related_links && job.related_links.length ? job.related_links[0].link : null,
                }));
                resolve(optimizedResponse);
              } else {
                resolve([]);
              }
              break;

            case 'html':
              if (json["html_results"]) {
                resolve(json["html_results"]);
              } else {
                resolve([]);
              }
              break;

            default:
              reject(new Error(`Unsupported output format: ${output}`));
              break;
          }
        } else {
          reject(new Error("Error: No response from SERP API"));
        }
      }
    );
  });
}
