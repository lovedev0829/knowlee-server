import { User } from "../../../models/user.model";
import * as SibApiV3Sdk from "@getbrevo/brevo";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;

const emailCampaignsApiInstance = new SibApiV3Sdk.EmailCampaignsApi();
const transactionalEmailsApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// set API_KEY for brevo instances
emailCampaignsApiInstance.setApiKey(
    SibApiV3Sdk.EmailCampaignsApiApiKeys.apiKey,
    BREVO_API_KEY
);
transactionalEmailsApiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    BREVO_API_KEY
);

export async function brevoEmailCampaignsGetEmailCampaingnsFunction({
    user,
    type,
    status,
    statistics,
    startDate,
    endDate,
    limit,
    offset,
    sort,
    excludeHtmlContent,
}: {
    user: User;
    type?: "classic" | "trigger";
    status?: "suspended" | "archive" | "sent" | "queued" | "draft" | "inProcess";
    statistics?: "globalStats" | "linksStats" | "statsByDomain";
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
    excludeHtmlContent?: boolean;
}) {
    try {
        const data = await emailCampaignsApiInstance.getEmailCampaigns(
            type,
            status,
            statistics,
            startDate,
            endDate,
            limit,
            offset,
            sort,
            excludeHtmlContent
        );
        // console.log("data----->", data?.body);
        return data.body;
    } catch (error: any) {
        const errorMessage = error.response ? error?.response?.body : error.message;
        // console.log("Error gettting brevo email campaigns----->", errorMessage);
        return errorMessage;
    }
}

export async function brevoEmailCampaignsCreateEmailCampaignFunction({
    user,
    emailCampaigns,
}: {
    user: User;
    emailCampaigns: SibApiV3Sdk.CreateEmailCampaign;
}) {
    try {
        // console.log("emailCampaigns----->", emailCampaigns);
        const data = await emailCampaignsApiInstance.createEmailCampaign(
            emailCampaigns
        );
        // console.log("data----->", data?.body);
        return data.body;
    } catch (error: any) {
        const errorMessage = error.response ? error?.response?.body : error.message;
        // console.log("Error ----->", errorMessage);
        return errorMessage;
    }
}

export async function brevoEmailCampaignsSendEmailCampaignNowFunction({
    user,
    campaignId,
}: {
    user: User;
    campaignId: number;
}) {
    try {
        const data = await emailCampaignsApiInstance.sendEmailCampaignNow(
            campaignId
        );
        // console.log("data----->", data?.body);
        return data.body;
    } catch (error: any) {
        const errorMessage = error.response ? error?.response?.body : error.message;
        // console.log("Error ----->", errorMessage);
        return errorMessage;
    }
}

export async function brevoTransactionalEmailsSendTransacEmailFunction({
    user,
    sendSmtpEmail,
}: {
    user: User;
    sendSmtpEmail: SibApiV3Sdk.SendSmtpEmail;
}) {
    try {
        const data = await transactionalEmailsApiInstance.sendTransacEmail(
            sendSmtpEmail
        );
        // console.log("data----->", data?.body);
        return data.body;
    } catch (error: any) {
        const errorMessage = error.response ? error?.response?.body : error.message;
        // console.log("Error ----->", errorMessage);
        return errorMessage;
    }
}
