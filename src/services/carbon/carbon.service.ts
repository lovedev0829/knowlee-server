import {
  Carbon,
  OrganizationUserFilesToSyncQueryInput,
} from "carbon-typescript-sdk";
const CARBON_API_KEY = process.env.CARBON_API_KEY;
// console.log("CARBON_API_KEY", CARBON_API_KEY);

export async function carbonAuthGetAccessToken({
  customerId,
}: {
  customerId: string;
}) {
  const carbon = new Carbon({
    apiKey: CARBON_API_KEY,
    customerId: customerId,
  });

  const res = await carbon.auth.getAccessToken();
  // console.log("carbonAuthGetAccessToken", res.data);
  return res.data;
}

export async function carbonEmbeddingsGetDocuments({
  customerId,
}: {
  customerId: string;
}) {
  const carbon = new Carbon({
    apiKey: CARBON_API_KEY,
    customerId: customerId,
  });

  const res = await carbon.embeddings.getDocuments({
    query: " ",
    k: 4,
    media_type: "TEXT",
    embedding_model: "OPENAI",
    // file_ids: [4320714],
  });
  // console.log("carbonEmbeddingsGetDocuments", res.data);
  return res.data;
}

export async function carbonFilesQueryUserFiles({
  customerId,
  requestParameters,
}: {
  customerId: string;
  requestParameters: OrganizationUserFilesToSyncQueryInput;
}) {
  const carbon = new Carbon({
    apiKey: CARBON_API_KEY,
    customerId: customerId,
  });

  const res = await carbon.files.queryUserFiles(requestParameters);
  // console.log("carbonFilesQueryUserFiles", res.data);
  return res.data;
}

export async function carbonDataSourcesQueryUserDataSources({
  customerId,
}: {
  customerId: string;
}) {
  const carbon = new Carbon({
    apiKey: CARBON_API_KEY,
    customerId: customerId,
  });
  const res = await carbon.dataSources.queryUserDataSources({
    filters: {
      ids: [4320714],
    },
  });
  // console.log("carbonDataSourcesQueryUserDataSources", res.data);
  return res.data;
}
