import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import ThirdPartyConfigModel, {
  ThirdPartyConfig,
} from "../models/third-party/ThirdPartyConfig.model";
import {
  CryptoEncryptionKey,
  decryptData,
  decryptDataWithKey,
  encryptData,
  encryptDataWithKey,
} from "../utils/encryption";

export const KEYS_TO_ENCRYPT = [
  "access_token",
  "access_token_secret",
  "oauth_token",
  "oauth_token_secret",
  "refresh_token",
];

export interface Token {
  access_token?: string;
  access_token_secret?: string;
  oauth_token?: string;
  oauth_token_secret?: string;
  refresh_token?: string;
}

export async function findOneThirdPartyConfig(
  filter: FilterQuery<ThirdPartyConfig>,
  projection?: ProjectionType<ThirdPartyConfig>,
  options?: QueryOptions<ThirdPartyConfig>
) {
  return await ThirdPartyConfigModel.findOne(filter, projection, options);
}

export const findOneAndUpdateThirdPartyConfig = async (
  filter?: FilterQuery<ThirdPartyConfig>,
  update?: UpdateQuery<ThirdPartyConfig>,
  options?: QueryOptions<ThirdPartyConfig>
) => {
  return await ThirdPartyConfigModel.findOneAndUpdate(filter, update, options);
};

export const deleteManyThirdPartyConfig = async (
  filter?: FilterQuery<ThirdPartyConfig>,
  options?: QueryOptions<ThirdPartyConfig>
) => {
  return await ThirdPartyConfigModel.deleteMany(filter, options);
};

export const encryptToken = (token?: Token) => {
  if (!token) return;
  if (token.access_token) {
    token.access_token = encryptData(token.access_token);
  }
  if (token.access_token_secret) {
    token.access_token_secret = encryptData(token.access_token_secret);
  }
  if (token.refresh_token) {
    token.refresh_token = encryptData(token.refresh_token);
  }
  if (token.oauth_token) {
    token.oauth_token = encryptData(token.oauth_token);
  }
  if (token.oauth_token_secret) {
    token.oauth_token_secret = encryptData(token.oauth_token_secret);
  }
};

export const decryptTokenWithKey = (
  encryptionKey: CryptoEncryptionKey,
  token?: Token
) => {
  if (!token) return;
  if (token.access_token) {
    token.access_token = decryptDataWithKey(
      encryptionKey,
      token.access_token
    );
  }
  if (token.access_token_secret) {
    token.access_token_secret = decryptDataWithKey(
      encryptionKey,
      token.access_token_secret
    );
  }
  if (token.refresh_token) {
    token.refresh_token = decryptDataWithKey(
      encryptionKey,
      token.refresh_token
    );
  }
  if (token.oauth_token) {
    token.oauth_token = decryptDataWithKey(
      encryptionKey,
      token.oauth_token
    );
  }
  if (token.oauth_token_secret) {
    token.oauth_token_secret = decryptDataWithKey(
      encryptionKey,
      token.oauth_token_secret
    );
  }
};

export const encryptTokenWithKey = (
  encryptionKey: CryptoEncryptionKey,
  token?: Token
) => {
  if (!token) return;
  if (token.access_token) {
    token.access_token = encryptDataWithKey(
      encryptionKey,
      token.access_token
    );
  }
  if (token.access_token_secret) {
    token.access_token_secret = encryptDataWithKey(
      encryptionKey,
      token.access_token_secret
    );
  }
  if (token.refresh_token) {
    token.refresh_token = encryptDataWithKey(
      encryptionKey,
      token.refresh_token
    );
  }
  if (token.oauth_token) {
    token.oauth_token = encryptDataWithKey(
      encryptionKey,
      token.oauth_token
    );
  }
  if (token.oauth_token_secret) {
    token.oauth_token_secret = encryptDataWithKey(
      encryptionKey,
      token.oauth_token_secret
    );
  }
};

export const decryptToken = (token?: Token) => {
  if (!token) return;
  if (token.access_token) {
    token.access_token = decryptData(token.access_token);
  }
  if (token.access_token_secret) {
    token.access_token_secret = decryptData(token.access_token_secret);
  }
  if (token.refresh_token) {
    token.refresh_token = decryptData(token.refresh_token);
  }
  if (token.oauth_token) {
    token.oauth_token = decryptData(token.oauth_token);
  }
  if (token.oauth_token_secret) {
    token.oauth_token_secret = decryptData(token.oauth_token_secret);
  }
};

export const decryptThirdPartyConfigData = (doc: ThirdPartyConfig) => {
  try {
    decryptToken(doc.google?.token);
    decryptToken(doc.microsoft?.token);
    decryptToken(doc.linkedin?.token);
    decryptToken(doc.trello?.token);
    decryptToken(doc.twitter?.token);
    decryptToken(doc.medium?.token);
    decryptToken(doc.notion?.token);
    decryptToken(doc.slack?.token);
    decryptToken(doc.telegram?.token);
    decryptToken(doc.discord?.token);

    if (doc.openai?.apiKey) {
      doc.openai.apiKey = decryptData(doc.openai.apiKey);
    }
  } catch (err: any) {
    console.log(err);
  }
};

export async function findThirdPartyConfig(
  filter: FilterQuery<ThirdPartyConfig>,
  projection?: ProjectionType<ThirdPartyConfig>,
  options?: QueryOptions<ThirdPartyConfig>
) {
  return await ThirdPartyConfigModel.find(filter, projection, options);
}

export async function encryptExistingThirdPartyConfig(
  encryptionKey: CryptoEncryptionKey
) {
  // find all third party configs
  const thirdPartyConfigs = await findThirdPartyConfig({});
  // const thirdPartyConfigs = await findThirdPartyConfig({
  //   userId: "cdb2f409-39e1-4094-9a42-c55dd642bb88",
  // });

  for (const config of thirdPartyConfigs) {
    if (config.google?.token)
      encryptTokenWithKey(encryptionKey, config.google.token);
    if (config.microsoft?.token)
      encryptTokenWithKey(encryptionKey, config.microsoft.token);
    if (config.linkedin?.token)
      encryptTokenWithKey(encryptionKey, config.linkedin.token);
    if (config.trello?.token)
      encryptTokenWithKey(encryptionKey, config.trello.token);
    if (config.twitter?.token)
      encryptTokenWithKey(encryptionKey, config.twitter.token);
    if (config.medium?.token)
      encryptTokenWithKey(encryptionKey, config.medium.token);
    if (config.notion?.token)
      encryptTokenWithKey(encryptionKey, config.notion.token);
    if (config.slack?.token)
      encryptTokenWithKey(encryptionKey, config.slack.token);
    if (config.telegram?.token)
      encryptTokenWithKey(encryptionKey, config.telegram.token);
    if (config.discord?.token)
      encryptTokenWithKey(encryptionKey, config.discord.token);
    if (config.openai?.apiKey) {
      config.openai.apiKey = encryptDataWithKey(
        encryptionKey,
        config.openai.apiKey
      );
    }
    await config.save();
  }

  console.log("encryptExistingThirdPartyConfig Done");
}

// encryptExistingThirdPartyConfig({ secret_key: process.env.SECRET_KEY!, secret_iv: process.env.SECRET_IV! });

export async function rotateEncryptionKey(
  newEncryptionKey: CryptoEncryptionKey
) {
  // find all third party configs
  const thirdPartyConfigs = await findThirdPartyConfig({});
  // const thirdPartyConfigs = await findThirdPartyConfig({
  //   userId: "cdb2f409-39e1-4094-9a42-c55dd642bb88",
  // });

  for (const config of thirdPartyConfigs) {
    // decryption of data with old key is already performed by middlewares
    // encrypt data with new key
    if (config.google?.token) {
      encryptTokenWithKey(newEncryptionKey, config.google.token);
    }
    if (config.microsoft?.token) {
      encryptTokenWithKey(newEncryptionKey, config.microsoft.token);
    }
    if (config.linkedin?.token) {
      encryptTokenWithKey(newEncryptionKey, config.linkedin.token);
    }
    if (config.trello?.token) {
      encryptTokenWithKey(newEncryptionKey, config.trello.token);
    }
    if (config.twitter?.token) {
      encryptTokenWithKey(newEncryptionKey, config.twitter.token);
    }
    if (config.medium?.token) {
      encryptTokenWithKey(newEncryptionKey, config.medium.token);
    }
    if (config.notion?.token) {
      encryptTokenWithKey(newEncryptionKey, config.notion.token);
    }
    if (config.slack?.token) {
      encryptTokenWithKey(newEncryptionKey, config.slack.token);
    }
    if (config.telegram?.token) {
      encryptTokenWithKey(newEncryptionKey, config.telegram.token);
    }
    if (config.discord?.token) {
      encryptTokenWithKey(newEncryptionKey, config.discord.token);
    }

    if (config.openai?.apiKey) {
      config.openai.apiKey = encryptDataWithKey(
        newEncryptionKey,
        config.openai.apiKey
      );
    }

    // save newly decrypted data to DB
    await config.save();
  }

  console.log("rotateEncryptionKey Done");
}

// rotateEncryptionKey(
//   {
//     secret_key: "Z3V6Pq4tUMd8HbR2SfXjWkYn3r5uV8zA",
//     secret_iv: "G4fR5hUj8Kl6nO9r",
//   },
// );
