import { AuthenticationClient, Connection, ManagementClient } from "auth0";
import axios from "axios";

// remove values once added to doppler
const auth0Domain =
    process.env.AUTH0_DOMAIN as string;
const auth0ClientId =
    process.env.AUTH0_CLIENT_ID as string;
const auth0ClientSecret =
    process.env.AUTH0_MTM_SECRET as string;

const auth0MTMClientId = process.env.AUTH0_MTM_CLIENT_ID as string;
const auth0MTMClientSecret = process.env.AUTH0_MTM_SECRET as string;

export const auth0Axios = axios.create();

// Initialize Auth0 clients
const auth0 = new AuthenticationClient({
    domain: auth0Domain,
    clientId: auth0ClientId,
    clientSecret: auth0ClientSecret,
});

const management = new ManagementClient({
    domain: auth0Domain,
    clientId: auth0MTMClientId,
    clientSecret: auth0MTMClientSecret,
    audience: `https://${auth0Domain}/api/v2/`,
});

export async function getAuth0AccessToken() {
    try {
        const res = await axios.request({
            method: "POST",
            maxBodyLength: Infinity,
            url: `https://${auth0Domain}/oauth/token`,
            headers: {
                "content-type": "application/json",
            },
            data: {
                client_id: auth0MTMClientId,
                client_secret: auth0MTMClientSecret,
                audience: `https://${auth0Domain}/api/v2/`,
                grant_type: "client_credentials",
            },
        });
        // //console.log(JSON.stringify(res.data));
        const accessToken: string = res.data?.access_token;
        if (accessToken) {
            auth0Axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${accessToken}`;
        }
        return accessToken;
    } catch (error) {
        // console.error("Error:", error?.response?.data);
        console.error(error);
    }
}

// Function to get the total number of users who logged in within the last 24 hours
export async function getUsersLoggedInLast24Hours() {
    try {
        await getAuth0AccessToken();
        // Calculate the timestamp for 24 hours ago
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

        // Use the Auth0 Management API to get users with last login within the last 24 hours
        const res = await management.users.getAll({
            q: `last_login:[${twentyFourHoursAgo} TO *]`,
            search_engine: 'v3',
            include_totals: true
        });
        return res.data;
    } catch (error) {
        console.error("Error getting users logged in last 24 hours:", error);
    }
}

export async function auth0DeleteUser(auth0UserId: string) {
  try {
    const response = await management.users.delete({ id: auth0UserId });
    return response;
  } catch (error) {
    console.error("Could not delete user from auth0 ", error);
  }
}

export async function auth0LinkUserAccount({
    primaryAccountUserId,
    secondaryAccountUserId,
    connection,
}: {
    primaryAccountUserId: string;
    secondaryAccountUserId: string;
    connection: unknown;
}) {
    try {
        const { strategy, id: connection_id } = connection as Connection;
        const token = await getAuth0AccessToken();
        if (!token) {
            return;
        }
        const response = await auth0Axios.post(
            `https://${auth0Domain}/api/v2/users/${primaryAccountUserId}/identities`,
            {
                provider: strategy,
                connection_id: connection_id,
                user_id: secondaryAccountUserId,
            }
        );
        return response;
    } catch (error) {
        // console.error("Error:", error?.response?.data);
        console.error("Could not delete user from auth0 ", error);
    }
}
