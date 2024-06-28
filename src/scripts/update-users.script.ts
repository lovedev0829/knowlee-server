import { MongoClient } from "mongodb";
import { AuthenticationClient, Connection, ManagementClient } from "auth0";
import axios from "axios";
import dotenv from "dotenv";

// Remove values once added to Doppler
const auth0Domain = process.env.AUTH0_DOMAIN as string;
const auth0ClientId = process.env.AUTH0_CLIENT_ID as string;
const auth0ClientSecret = process.env.AUTH0_SECRET as string;
const auth0MTMClientId = process.env.AUTH0_MTM_CLIENT_ID as string;
const auth0MTMClientSecret = process.env.AUTH0_MTM_SECRET as string;
const mongoDbUri = process.env.MONGODB_URI as string;

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
    audience: `https://${auth0Domain}/api/v2/`
});

dotenv.config();

export async function getUsersByEmail(email: string) {
    try {
        const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InhOdkJJYTVzOFJLMGpxdVhBd0dlTiJ9.eyJpc3MiOiJodHRwczovL2tub3dsZWUuZXUuYXV0aDAuY29tLyIsInN1YiI6ImtPSExDYTlqT0I0eFdoMzB6TDMyMThhZmVEMEJtQ2psQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2tub3dsZWUuZXUuYXV0aDAuY29tL2FwaS92Mi8iLCJpYXQiOjE3MTkwNDIyNTUsImV4cCI6MTcxOTEyODY1NSwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSByZWFkOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl9jdXN0b21fYmxvY2tzIGRlbGV0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfdGlja2V0cyByZWFkOmNsaWVudHMgdXBkYXRlOmNsaWVudHMgZGVsZXRlOmNsaWVudHMgY3JlYXRlOmNsaWVudHMgcmVhZDpjbGllbnRfa2V5cyB1cGRhdGU6Y2xpZW50X2tleXMgZGVsZXRlOmNsaWVudF9rZXlzIGNyZWF0ZTpjbGllbnRfa2V5cyByZWFkOmNvbm5lY3Rpb25zIHVwZGF0ZTpjb25uZWN0aW9ucyBkZWxldGU6Y29ubmVjdGlvbnMgY3JlYXRlOmNvbm5lY3Rpb25zIHJlYWQ6cmVzb3VyY2Vfc2VydmVycyB1cGRhdGU6cmVzb3VyY2Vfc2VydmVycyBkZWxldGU6cmVzb3VyY2Vfc2VydmVycyBjcmVhdGU6cmVzb3VyY2Vfc2VydmVycyByZWFkOmRldmljZV9jcmVkZW50aWFscyB1cGRhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpkZXZpY2VfY3JlZGVudGlhbHMgY3JlYXRlOmRldmljZV9jcmVkZW50aWFscyByZWFkOnJ1bGVzIHVwZGF0ZTpydWxlcyBkZWxldGU6cnVsZXMgY3JlYXRlOnJ1bGVzIHJlYWQ6cnVsZXNfY29uZmlncyB1cGRhdGU6cnVsZXNfY29uZmlncyBkZWxldGU6cnVsZXNfY29uZmlncyByZWFkOmhvb2tzIHVwZGF0ZTpob29rcyBkZWxldGU6aG9va3MgY3JlYXRlOmhvb2tzIHJlYWQ6YWN0aW9ucyB1cGRhdGU6YWN0aW9ucyBkZWxldGU6YWN0aW9ucyBjcmVhdGU6YWN0aW9ucyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOmluc2lnaHRzIHJlYWQ6dGVuYW50X3NldHRpbmdzIHVwZGF0ZTp0ZW5hbnRfc2V0dGluZ3MgcmVhZDpsb2dzIHJlYWQ6bG9nc191c2VycyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgdXBkYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDphbm9tYWx5X2Jsb2NrcyBkZWxldGU6YW5vbWFseV9ibG9ja3MgdXBkYXRlOnRyaWdnZXJzIHJlYWQ6dHJpZ2dlcnMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyBjcmVhdGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiBkZWxldGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiByZWFkOmN1c3RvbV9kb21haW5zIGRlbGV0ZTpjdXN0b21fZG9tYWlucyBjcmVhdGU6Y3VzdG9tX2RvbWFpbnMgdXBkYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIGRlbGV0ZTpicmFuZGluZyByZWFkOmxvZ19zdHJlYW1zIGNyZWF0ZTpsb2dfc3RyZWFtcyBkZWxldGU6bG9nX3N0cmVhbXMgdXBkYXRlOmxvZ19zdHJlYW1zIGNyZWF0ZTpzaWduaW5nX2tleXMgcmVhZDpzaWduaW5nX2tleXMgdXBkYXRlOnNpZ25pbmdfa2V5cyByZWFkOmxpbWl0cyB1cGRhdGU6bGltaXRzIGNyZWF0ZTpyb2xlX21lbWJlcnMgcmVhZDpyb2xlX21lbWJlcnMgZGVsZXRlOnJvbGVfbWVtYmVycyByZWFkOmVudGl0bGVtZW50cyByZWFkOmF0dGFja19wcm90ZWN0aW9uIHVwZGF0ZTphdHRhY2tfcHJvdGVjdGlvbiByZWFkOm9yZ2FuaXphdGlvbnNfc3VtbWFyeSBjcmVhdGU6YXV0aGVudGljYXRpb25fbWV0aG9kcyByZWFkOmF1dGhlbnRpY2F0aW9uX21ldGhvZHMgdXBkYXRlOmF1dGhlbnRpY2F0aW9uX21ldGhvZHMgZGVsZXRlOmF1dGhlbnRpY2F0aW9uX21ldGhvZHMgcmVhZDpvcmdhbml6YXRpb25zIHVwZGF0ZTpvcmdhbml6YXRpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVycyByZWFkOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGRlbGV0ZTpvcmdhbml6YXRpb25fbWVtYmVycyBjcmVhdGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIHVwZGF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyByZWFkOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgY3JlYXRlOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyByZWFkOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpwaG9uZV9wcm92aWRlcnMgY3JlYXRlOnBob25lX3Byb3ZpZGVycyByZWFkOnBob25lX3Byb3ZpZGVycyB1cGRhdGU6cGhvbmVfcHJvdmlkZXJzIGRlbGV0ZTpwaG9uZV90ZW1wbGF0ZXMgY3JlYXRlOnBob25lX3RlbXBsYXRlcyByZWFkOnBob25lX3RlbXBsYXRlcyB1cGRhdGU6cGhvbmVfdGVtcGxhdGVzIGNyZWF0ZTplbmNyeXB0aW9uX2tleXMgcmVhZDplbmNyeXB0aW9uX2tleXMgdXBkYXRlOmVuY3J5cHRpb25fa2V5cyBkZWxldGU6ZW5jcnlwdGlvbl9rZXlzIHJlYWQ6c2Vzc2lvbnMgZGVsZXRlOnNlc3Npb25zIHJlYWQ6cmVmcmVzaF90b2tlbnMgZGVsZXRlOnJlZnJlc2hfdG9rZW5zIGNyZWF0ZTpzZWxmX3NlcnZpY2VfcHJvZmlsZXMgcmVhZDpzZWxmX3NlcnZpY2VfcHJvZmlsZXMgdXBkYXRlOnNlbGZfc2VydmljZV9wcm9maWxlcyBkZWxldGU6c2VsZl9zZXJ2aWNlX3Byb2ZpbGVzIGNyZWF0ZTpzc29fYWNjZXNzX3RpY2tldHMgcmVhZDpmb3JtcyB1cGRhdGU6Zm9ybXMgZGVsZXRlOmZvcm1zIGNyZWF0ZTpmb3JtcyByZWFkOmZsb3dzIHVwZGF0ZTpmbG93cyBkZWxldGU6Zmxvd3MgY3JlYXRlOmZsb3dzIHJlYWQ6Zmxvd3NfdmF1bHQgdXBkYXRlOmZsb3dzX3ZhdWx0IGRlbGV0ZTpmbG93c192YXVsdCBjcmVhdGU6Zmxvd3NfdmF1bHQgcmVhZDpjbGllbnRfY3JlZGVudGlhbHMgY3JlYXRlOmNsaWVudF9jcmVkZW50aWFscyB1cGRhdGU6Y2xpZW50X2NyZWRlbnRpYWxzIGRlbGV0ZTpjbGllbnRfY3JlZGVudGlhbHMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJrT0hMQ2E5ak9CNHhXaDMwekwzMjE4YWZlRDBCbUNqbCJ9.rhSm23jG1anIdkLszUfJiSeyy69UZTwyuZ0NuTwiyBRK46Myw6iwyTwiptEoZFzt1hW-kFoTCW-LL3vMJHpviZ_BfURNWD5TKk0K-SgEg3nMcQdOxuJuwbdGVtjlCgGc7Og0Ax2AI-zrgdJCuEIrqivhtM4OZMEa9PCqdk11KyEm0CPAoYKatmc0xEkIXyEu27eoIhel_zrrMPyvMssLmYYlsHz61zm6neHyzdZVufqGuLbLpk5dG3WaCyEVUQzx4h6kDXlpnOP8P2wQxL0NazxtNzqHRcAphtCkf-yZGtwH4gmTNaXAEPlGZL2GOOootj5FIRTdrEUQEGl0ltSieQ";
        const response = await axios.get(
            `https://${auth0Domain}/api/v2/users-by-email`,
            {
                params: { email: email },
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching users by email ${email}:`, error);
    }
}


async function updateMongoAuth0Id() {
    try {
        // Connect to MongoDB
        const client = new MongoClient(mongoDbUri);
        await client.connect();
        const database = client.db("knowledge");
        const usersCollection = database.collection("users");

        // Get all users
        const users = await usersCollection.find({}).toArray();
        console.log(`users Auth0 ID started`);

        for (const user of users) {
            const email = user.email;

            // Get Auth0 user by email
            const auth0Users = await getUsersByEmail(email);

            if (auth0Users && auth0Users.length > 0) {
                const auth0Id = auth0Users[0].user_id;

                // Update MongoDB if auth0id is different
                if (user.auth0Id !== auth0Id) {
                    await usersCollection.updateOne(
                        { email: email },
                        { $set: { auth0Id: auth0Id } }
                    );
                    console.log(`user.auth0Id ${user.auth0Id} with Auth0 ID ${auth0Id}`);
                    console.log(`Updated user ${email} with Auth0 ID ${auth0Id}`);
                }
            } else {
                console.log(`No Auth0 user found for email ${email}`);
            }
        }

        // Close MongoDB connection
        await client.close();
    } catch (error) {
        console.error("Error updating MongoDB with Auth0 IDs:", error);
    }
}

dotenv.config();
async function updateAuth0Id() {
    try {
        // Connect to MongoDB
        const client = new MongoClient(mongoDbUri);
        await client.connect();
        const database = client.db("knowledge");
        const usersCollection = database.collection("users");

        // Query to find users with auth0Id starting with "auth0|l"
        const query = { auth0Id: { $regex: "^auth0\\|oauth2\\|d" } };

        // Find users matching the query
        const users = await usersCollection.find(query).toArray();
        console.log(`Found ${users.length} users to update`);

        for (const user of users) {
            const oldAuth0Id = user.auth0Id;
            const newAuth0Id = oldAuth0Id.replace(/^auth0\|/, '');

            // Update the user's auth0Id
            const result = await usersCollection.updateOne(
                { _id: user._id },
                { $set: { auth0Id: newAuth0Id } }
            );

            console.log(`Updated user ${user._id}: ${oldAuth0Id} -> ${newAuth0Id}`);
        }

        // Close MongoDB connection
        await client.close();
    } catch (error) {
        console.error("Error updating MongoDB auth0 IDs:", error);
    }
}

async function deleteUsersWithZeroLogins() {
    try {
        const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InhOdkJJYTVzOFJLMGpxdVhBd0dlTiJ9.eyJpc3MiOiJodHRwczovL2tub3dsZWUuZXUuYXV0aDAuY29tLyIsInN1YiI6ImtPSExDYTlqT0I0eFdoMzB6TDMyMThhZmVEMEJtQ2psQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2tub3dsZWUuZXUuYXV0aDAuY29tL2FwaS92Mi8iLCJpYXQiOjE3MTkwNDIyNTUsImV4cCI6MTcxOTEyODY1NSwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSByZWFkOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl9jdXN0b21fYmxvY2tzIGRlbGV0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfdGlja2V0cyByZWFkOmNsaWVudHMgdXBkYXRlOmNsaWVudHMgZGVsZXRlOmNsaWVudHMgY3JlYXRlOmNsaWVudHMgcmVhZDpjbGllbnRfa2V5cyB1cGRhdGU6Y2xpZW50X2tleXMgZGVsZXRlOmNsaWVudF9rZXlzIGNyZWF0ZTpjbGllbnRfa2V5cyByZWFkOmNvbm5lY3Rpb25zIHVwZGF0ZTpjb25uZWN0aW9ucyBkZWxldGU6Y29ubmVjdGlvbnMgY3JlYXRlOmNvbm5lY3Rpb25zIHJlYWQ6cmVzb3VyY2Vfc2VydmVycyB1cGRhdGU6cmVzb3VyY2Vfc2VydmVycyBkZWxldGU6cmVzb3VyY2Vfc2VydmVycyBjcmVhdGU6cmVzb3VyY2Vfc2VydmVycyByZWFkOmRldmljZV9jcmVkZW50aWFscyB1cGRhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpkZXZpY2VfY3JlZGVudGlhbHMgY3JlYXRlOmRldmljZV9jcmVkZW50aWFscyByZWFkOnJ1bGVzIHVwZGF0ZTpydWxlcyBkZWxldGU6cnVsZXMgY3JlYXRlOnJ1bGVzIHJlYWQ6cnVsZXNfY29uZmlncyB1cGRhdGU6cnVsZXNfY29uZmlncyBkZWxldGU6cnVsZXNfY29uZmlncyByZWFkOmhvb2tzIHVwZGF0ZTpob29rcyBkZWxldGU6aG9va3MgY3JlYXRlOmhvb2tzIHJlYWQ6YWN0aW9ucyB1cGRhdGU6YWN0aW9ucyBkZWxldGU6YWN0aW9ucyBjcmVhdGU6YWN0aW9ucyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOmluc2lnaHRzIHJlYWQ6dGVuYW50X3NldHRpbmdzIHVwZGF0ZTp0ZW5hbnRfc2V0dGluZ3MgcmVhZDpsb2dzIHJlYWQ6bG9nc191c2VycyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgdXBkYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDphbm9tYWx5X2Jsb2NrcyBkZWxldGU6YW5vbWFseV9ibG9ja3MgdXBkYXRlOnRyaWdnZXJzIHJlYWQ6dHJpZ2dlcnMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyBjcmVhdGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiBkZWxldGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiByZWFkOmN1c3RvbV9kb21haW5zIGRlbGV0ZTpjdXN0b21fZG9tYWlucyBjcmVhdGU6Y3VzdG9tX2RvbWFpbnMgdXBkYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIGRlbGV0ZTpicmFuZGluZyByZWFkOmxvZ19zdHJlYW1zIGNyZWF0ZTpsb2dfc3RyZWFtcyBkZWxldGU6bG9nX3N0cmVhbXMgdXBkYXRlOmxvZ19zdHJlYW1zIGNyZWF0ZTpzaWduaW5nX2tleXMgcmVhZDpzaWduaW5nX2tleXMgdXBkYXRlOnNpZ25pbmdfa2V5cyByZWFkOmxpbWl0cyB1cGRhdGU6bGltaXRzIGNyZWF0ZTpyb2xlX21lbWJlcnMgcmVhZDpyb2xlX21lbWJlcnMgZGVsZXRlOnJvbGVfbWVtYmVycyByZWFkOmVudGl0bGVtZW50cyByZWFkOmF0dGFja19wcm90ZWN0aW9uIHVwZGF0ZTphdHRhY2tfcHJvdGVjdGlvbiByZWFkOm9yZ2FuaXphdGlvbnNfc3VtbWFyeSBjcmVhdGU6YXV0aGVudGljYXRpb25fbWV0aG9kcyByZWFkOmF1dGhlbnRpY2F0aW9uX21ldGhvZHMgdXBkYXRlOmF1dGhlbnRpY2F0aW9uX21ldGhvZHMgZGVsZXRlOmF1dGhlbnRpY2F0aW9uX21ldGhvZHMgcmVhZDpvcmdhbml6YXRpb25zIHVwZGF0ZTpvcmdhbml6YXRpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVycyByZWFkOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGRlbGV0ZTpvcmdhbml6YXRpb25fbWVtYmVycyBjcmVhdGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIHVwZGF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyByZWFkOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgY3JlYXRlOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyByZWFkOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpwaG9uZV9wcm92aWRlcnMgY3JlYXRlOnBob25lX3Byb3ZpZGVycyByZWFkOnBob25lX3Byb3ZpZGVycyB1cGRhdGU6cGhvbmVfcHJvdmlkZXJzIGRlbGV0ZTpwaG9uZV90ZW1wbGF0ZXMgY3JlYXRlOnBob25lX3RlbXBsYXRlcyByZWFkOnBob25lX3RlbXBsYXRlcyB1cGRhdGU6cGhvbmVfdGVtcGxhdGVzIGNyZWF0ZTplbmNyeXB0aW9uX2tleXMgcmVhZDplbmNyeXB0aW9uX2tleXMgdXBkYXRlOmVuY3J5cHRpb25fa2V5cyBkZWxldGU6ZW5jcnlwdGlvbl9rZXlzIHJlYWQ6c2Vzc2lvbnMgZGVsZXRlOnNlc3Npb25zIHJlYWQ6cmVmcmVzaF90b2tlbnMgZGVsZXRlOnJlZnJlc2hfdG9rZW5zIGNyZWF0ZTpzZWxmX3NlcnZpY2VfcHJvZmlsZXMgcmVhZDpzZWxmX3NlcnZpY2VfcHJvZmlsZXMgdXBkYXRlOnNlbGZfc2VydmljZV9wcm9maWxlcyBkZWxldGU6c2VsZl9zZXJ2aWNlX3Byb2ZpbGVzIGNyZWF0ZTpzc29fYWNjZXNzX3RpY2tldHMgcmVhZDpmb3JtcyB1cGRhdGU6Zm9ybXMgZGVsZXRlOmZvcm1zIGNyZWF0ZTpmb3JtcyByZWFkOmZsb3dzIHVwZGF0ZTpmbG93cyBkZWxldGU6Zmxvd3MgY3JlYXRlOmZsb3dzIHJlYWQ6Zmxvd3NfdmF1bHQgdXBkYXRlOmZsb3dzX3ZhdWx0IGRlbGV0ZTpmbG93c192YXVsdCBjcmVhdGU6Zmxvd3NfdmF1bHQgcmVhZDpjbGllbnRfY3JlZGVudGlhbHMgY3JlYXRlOmNsaWVudF9jcmVkZW50aWFscyB1cGRhdGU6Y2xpZW50X2NyZWRlbnRpYWxzIGRlbGV0ZTpjbGllbnRfY3JlZGVudGlhbHMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJrT0hMQ2E5ak9CNHhXaDMwekwzMjE4YWZlRDBCbUNqbCJ9.rhSm23jG1anIdkLszUfJiSeyy69UZTwyuZ0NuTwiyBRK46Myw6iwyTwiptEoZFzt1hW-kFoTCW-LL3vMJHpviZ_BfURNWD5TKk0K-SgEg3nMcQdOxuJuwbdGVtjlCgGc7Og0Ax2AI-zrgdJCuEIrqivhtM4OZMEa9PCqdk11KyEm0CPAoYKatmc0xEkIXyEu27eoIhel_zrrMPyvMssLmYYlsHz61zm6neHyzdZVufqGuLbLpk5dG3WaCyEVUQzx4h6kDXlpnOP8P2wQxL0NazxtNzqHRcAphtCkf-yZGtwH4gmTNaXAEPlGZL2GOOootj5FIRTdrEUQEGl0ltSieQ"
        if (!token) {
            throw new Error("Failed to retrieve access token");
        }
        let page = 0;
        const perPage = 50;
        let totalUsersDeleted = 0;

        while (true) {
            const options = {
                method: 'GET',
                url: `https://${auth0Domain}/api/v2/users`,
                params: { q: 'logins_count:0', search_engine: 'v3', page, per_page: perPage },
                headers: { authorization: `Bearer ${token}` }
            };

            const response = await axios.request(options);
            const users = response.data;
            if (users.length === 0) {
                break;
            }

            console.log(`Found ${users.length} users with 0 logins on page ${page}`);

            for (const user of users) {
                try {
                    const deleteOptions = {
                        method: 'DELETE',
                        url: `https://${auth0Domain}/api/v2/users/${user.user_id}`,
                        headers: { authorization: `Bearer ${token}` }
                    };
                    await axios.request(deleteOptions);
                    console.log(`Deleted user: ${user.user_id}`);
                    totalUsersDeleted++;
                } catch (error) {
                    console.error(`Failed to delete user ${user.user_id}:`, error);
                }
            }

            if (users.length < perPage) {
                break;
            }
            page++;
        }

        console.log(`Total users deleted: ${totalUsersDeleted}`);
    } catch (error) {
        console.error("Error fetching or deleting users:", error);
    }
}

// Run the function
// deleteUsersWithZeroLogins();
// updateAuth0Id();
// updateMongoAuth0Id();
