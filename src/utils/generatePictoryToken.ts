const PICTORY_CLIENT_ID = process.env.PICTORY_CLIENT_ID;
const PICTORY_CLIENT_SECRET = process.env.PICTORY_CLIENT_SECRET;

export async function generatePictoryToken() {
    const URL = "https://api.pictory.ai/pictoryapis/v1/oauth2/token"
    const raw = JSON.stringify({
        "client_id": `${PICTORY_CLIENT_ID}`,
        "client_secret": `${PICTORY_CLIENT_SECRET}`
    });

    const requestOptions: RequestInit = {
        headers: {
            "Content-Type": "application/json",
        },
        method: 'POST',
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch(URL, requestOptions);
        const data = await response.json();

        return data.access_token;
    } catch (error) {
        //console.log('error', error);
    }
}