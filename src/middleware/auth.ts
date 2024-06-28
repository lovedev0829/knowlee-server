import { auth } from "express-oauth2-jwt-bearer";

const issuerBaseURL =
  process.env.AUTH0_ISSUER_BASE_URL;

  export const checkJwt = auth({
  audience: 'app.knowlee.ai',
  issuerBaseURL: issuerBaseURL,
  tokenSigningAlg: 'RS256'
});

// export const checkScopes = requiredScopes('add:entities');