import {
  getMicrosoftTokenOfUser,
} from "../../../lib/microsoft/microsoft.services";

import {
  outlookMailUsersMessagesSend,
  outlookMailUsersMessagesSearch,
  outlookMailUsersHighMessagesGet,
  outlookMailUsersMessagesByAddressGet
} from "../../../lib/outlook/outlookmail.service";

import { User } from "../../../models/user.model";

interface OutlookMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  body?: { content: string; contentType: string }; // Optional field for the full body
  from?: {
      emailAddress: {
          name: string;
          address: string;
      };
  };
  toRecipients?: Array<{
      emailAddress: {
          name: string;
          address: string;
      };
  }>;
  ccRecipients?: Array<{
      emailAddress: {
          name: string;
          address: string;
      };
  }>;
  bccRecipients?: Array<{
      emailAddress: {
          name: string;
          address: string;
      };
  }>;
  receivedDateTime: string;
  sentDateTime?: string;
  importance: string;
  isRead: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
      id: string;
      name: string;
      contentType: string;
      size: number;
  }>;
  flag?: {
      flagStatus: string;
  };
  categories?: string[];
  conversationId?: string;
  conversationIndex?: string;
  internetMessageId?: string;
  webLink?: string;
  inferenceClassification?: string;
  [key: string]: any; // To allow additional properties
}

function trimOutlookData(data: OutlookMessage): OutlookMessage {
  const trimmedData: OutlookMessage = {
      id: data.id,
      subject: data.subject,
      bodyPreview: data.bodyPreview.length > 100 ? data.bodyPreview.substring(0, 100) + "..." : data.bodyPreview,
      from: data.from,
      toRecipients: data.toRecipients ? data.toRecipients.slice(0, 5) : undefined, // Limit to 5 recipients
      ccRecipients: data.ccRecipients ? data.ccRecipients.slice(0, 5) : undefined, // Limit to 5 recipients
      bccRecipients: data.bccRecipients ? data.bccRecipients.slice(0, 5) : undefined, // Limit to 5 recipients
      receivedDateTime: data.receivedDateTime,
      sentDateTime: data.sentDateTime,
      importance: data.importance,
      isRead: data.isRead,
      hasAttachments: data.hasAttachments,
      attachments: data.attachments ? data.attachments.slice(0, 3).map(attachment => ({
          id: attachment.id,
          name: attachment.name,
          contentType: attachment.contentType,
          size: attachment.size,
      })) : undefined,
      flag: data.flag,
      categories: data.categories ? data.categories.slice(0, 5) : undefined, // Limit to 5 categories
      conversationId: data.conversationId,
      conversationIndex: data.conversationIndex,
      internetMessageId: data.internetMessageId,
      webLink: data.webLink,
      inferenceClassification: data.inferenceClassification,
  };

  // Truncate the body content if needed
  if (data.body && data.body.content.length > 200) {
      trimmedData.body = {
          content: data.body.content.substring(0, 200) + "...",
          contentType: data.body.contentType,
      };
  }

  return trimmedData;
}

// send mail from outlook mail
export async function outlookMailUsersMessagesSendFunction({
  user,
  ...params
}: {
  user: User;
}) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
    const { access_token: token } = accessToken;
    const res = await outlookMailUsersMessagesSend({ token: token, ...params });

    return res;

  } catch (error: any) {

    //console.log("error----->", error);

    return error?.message;
  }
}

interface OutlookMailUsersMessagesSearchParams {
  search: string;
}

// search message from outlook mail
export async function outlookMailUsersMessagesSearchFunction({
  user,
  ...params
}: {
  user: User;
} & OutlookMailUsersMessagesSearchParams) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
    const { access_token: token } = accessToken;
    const res = await outlookMailUsersMessagesSearch({ token: token, keyword: params.search });

    // Trim each message in the response
    const trimmedData = res.map(trimOutlookData);

    return trimmedData;

  } catch (error: any) {
    //console.log("error----->", error);
    return error?.message;
  }
}

// get high important messages from outlook mail
export async function outlookMailUsersHighMessagesGetFunction({
  user,
}: {
  user: User;
}) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
    const { access_token: token } = accessToken;
    const res = await outlookMailUsersHighMessagesGet({ token: token });

    // Trim each message in the response
    const trimmedData = res.map(trimOutlookData);

    return trimmedData;

  } catch (error: any) {
    //console.log("error----->", error);
    return error?.message;
  }
}

interface OutlookMailUsersMessagesByAddressGetParams {
  usermail: string;
}

// get messages from an address in outlook mailbox
export async function outlookMailUsersMessagesByAddressGetFunction({
  user,
  ...params
}: {
  user: User;
} & OutlookMailUsersMessagesByAddressGetParams) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const accessToken = await getMicrosoftTokenOfUser({ userId: userId });
    const { access_token: token } = accessToken;
    const res = await outlookMailUsersMessagesByAddressGet({ token: token, email: params.usermail });

    // Trim each message in the response
    const trimmedData = res.map(trimOutlookData);

    return trimmedData;

  } catch (error: any) {
    //console.log("error----->", error);
    return error?.message;
  }
}
