import axios from 'axios';

// const GTM_ENDPOINT = process.env.GTM_ENDPOINT as string; // Make sure to set this in your environment variables
const GTM_ENDPOINT = 'https://server-side-tagging-vedso37oea-uc.a.run.app'; // Replace with your GTM server container endpoint URL

// Interface for SignUpData
interface SignUpData {
    userId: string;
    email: string;
    [key: string]: any;
}

// Function to send sign-up event to GTM
export const sendSignUpEventToGTM = async (signUpData: SignUpData): Promise<any> => {
    try {
        const response = await axios.post(GTM_ENDPOINT, {
            event_name: 'signupEvent',
            user_data: signUpData,
        });
        return response.data;
    } catch (error) {
        console.error('Error sending event to GTM:', error);
        return null;
    }
};

export default sendSignUpEventToGTM;
