import { WebClient, MessageAttachment } from "@slack/web-api";
import { findOneThirdPartyConfig } from "../../thirdPartyConfig.services";
import { User } from "../../../models/user.model";

interface SlackGetChannelsOptions {
  limit?: number;
  cursor?: string;
  excludeArchived?: boolean;
}

interface FilteredChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_private: boolean;
  created: number;
  is_archived: boolean;
  is_general: boolean;
  num_members: number;
  purpose: string;
  topic: string;
}

async function getUserAccessToken(user: User): Promise<string> {
  if (!user) throw new Error("Please provide user");
  const { id: userId } = user;

  const thirdPartyConfig = await findOneThirdPartyConfig({ userId: userId });
  if (!thirdPartyConfig) {
    throw new Error("Not Authorized: No third party config found");
  }

  const user_access_token = thirdPartyConfig?.slack?.token?.authed_user?.access_token;
  if (!user_access_token) {
    throw new Error("Not Authorized: Slack access token not found");
  }

  return user_access_token;
}

function filterChannelData(channel: any): FilteredChannel {
  return {
    id: channel.id,
    name: channel.name,
    is_channel: channel.is_channel,
    is_private: channel.is_private,
    created: channel.created,
    is_archived: channel.is_archived,
    is_general: channel.is_general,
    num_members: channel.num_members,
    purpose: channel.purpose.value,
    topic: channel.topic.value
  };
}

export async function slackGetChannelsFunction({
  user,
  options = {},
}: {
  user: User;
  options?: SlackGetChannelsOptions;
}): Promise<FilteredChannel[]> {
  try {
    const user_access_token = await getUserAccessToken(user);
    const slackClient = new WebClient(user_access_token);

    const result = await slackClient.conversations.list(options);

    if (!result.ok || !result.channels) {
      throw new Error("Failed to retrieve channels");
    }

    const filteredChannels = result.channels.map(filterChannelData);
    return filteredChannels;
  } catch (error: any) {
    console.log("error----->", error);
    throw new Error(error?.message || "An unknown error occurred");
  }
}

export async function slackSendMessageFunction({
  user,
  channel,
  message,
}: {
  user: User;
  channel: string;
  message: string;
}) {
  try {
    if (!channel || !message) throw new Error("Channel and message are required");
    const user_access_token = await getUserAccessToken(user);
    const slackClient = new WebClient(user_access_token);

    const result = await slackClient.chat.postMessage({ channel, text: message });
    return result;
  } catch (error: any) {
    // console.log("error----->", error);
    throw new Error(error?.message || "An unknown error occurred");
  }
}

export async function slackScheduleMessageFunction({
  user,
  channelId,
  messageText,
  postAt,
}: {
  user: User;
  channelId: string;
  messageText: string;
  postAt: number;
}) {
  try {
    if (!channelId || !messageText || !postAt) throw new Error("ChannelId, messageText, and postAt are required");
    const user_access_token = await getUserAccessToken(user);
    const slackClient = new WebClient(user_access_token);

    const result = await slackClient.chat.scheduleMessage({
      channel: channelId,
      text: messageText,
      post_at: postAt,
    });

    return result;
  } catch (error: any) {
    console.log("error----->", error);
    throw new Error(error?.message || "An unknown error occurred");
  }
}

export async function slackGetConversationHistoryFunction({
  user,
  channel,
  cursor,
  include_all_metadata,
  inclusive,
  latest,
  limit,
  oldest,
}: {
  user: User;
  channel: string;
  cursor?: string;
  include_all_metadata?: boolean;
  inclusive?: boolean;
  latest?: string;
  limit?: number;
  oldest?: string;
}) {
  try {
    if (!channel) throw new Error("Channel is required");
    const user_access_token = await getUserAccessToken(user);
    const slackClient = new WebClient(user_access_token);

    const result = await slackClient.conversations.history({
      channel,
      cursor,
      include_all_metadata,
      inclusive,
      latest,
      limit,
      oldest,
    });

    return result;
  } catch (error: any) {
    console.log("error----->", error);
    throw new Error(error?.message || "An unknown error occurred");
  }
}

// Retrieve a thread of messages posted to a conversation
export async function slackRetrieveThreadOfMessagePostedToConversationFunction({
  user,
  channel,
  ts,
  cursor,
  include_all_metadata,
  inclusive,
  latest,
  limit,
  oldest,
}: {
  user: User;
  channel: string;
  ts: string;
  cursor?: string;
  include_all_metadata?: boolean;
  inclusive?: boolean;
  latest?: string;
  limit?: number;
  oldest?: string;
}) {
  try {
    if (!channel || !ts) throw new Error("Channel and ts are required");
    const user_access_token = await getUserAccessToken(user);
    const slackClient = new WebClient(user_access_token);

    const result = await slackClient.conversations.replies({
      channel,
      ts,
      cursor,
      include_all_metadata,
      inclusive,
      latest,
      limit,
      oldest,
    });
    return result;
  } catch (error: any) {
    console.log("error----->", error);
    throw new Error(error?.message || "An unknown error occurred");
  }
}

export async function slackEditMessageFunction({
  user,
  channel,
  ts,
  attachments = [],
  blocks,
  text,
  as_user,
  file_ids,
  link_names,
  metadata,
  parse,
  reply_broadcast,
}: {
  user: User;
  channel: string;
  ts: string;
  attachments?: MessageAttachment[];
  blocks?: any[];
  text?: string;
  as_user?: boolean;
  file_ids?: any[];
  link_names?: boolean;
  metadata?: any;
  parse?: any;
  reply_broadcast?: boolean;
}) {
  try {
    if (!channel || !ts) throw new Error("Channel and ts are required");
    const user_access_token = await getUserAccessToken(user);
    const slackClient = new WebClient(user_access_token);

    const result = await slackClient.chat.update({
      channel,
      ts,
      attachments: attachments || [],
      blocks,
      text,
      as_user,
      file_ids,
      link_names,
      metadata,
      parse,
      reply_broadcast,
    });
    return result;
  } catch (error: any) {
    console.log("error----->", error);
    throw new Error(error?.message || "An unknown error occurred");
  }
}

export async function slackDeleteMessageFunction({
  user,
  channel,
  ts,
  as_user,
}: {
  user: User;
  channel: string;
  ts: string;
  as_user?: boolean;
}) {
  try {
    if (!channel || !ts) throw new Error("Channel and ts are required");
    const user_access_token = await getUserAccessToken(user);
    const slackClient = new WebClient(user_access_token);

    const result = await slackClient.chat.delete({
      channel,
      ts,
      as_user,
    });

    return result;
  } catch (error: any) {
    console.log("error----->", error);
    throw new Error(error?.message || "An unknown error occurred");
  }
}
