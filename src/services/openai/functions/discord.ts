import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { User } from "../../../models/user.model";
import { RequestError } from '../../../utils/globalErrorHandler';
import { getUserAccessToken, getUserServerId } from '../../../lib/discord/discord.services';

interface GetChannelsParams {
  user: User;
  userId: string;
}

interface GetMessagesParams {
  user: User,
  userId: string;
  channelId: string;
  limit?: number;
  before?: string;
  after?: string;
  around?: string;
}

interface MessageAttachment {
  id: string;
  url: string;
  name: string;
  size: number;
}

interface MessageReaction {
  emoji: string;
  count: number;
}

interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
  };
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
}

interface SendMessageParams {
  user: User,
  userId: string;
  channelId: string;
  content?: string;
  tts?: boolean;
  embeds?: Array<{
    title: string;
    description: string;
    [key: string]: any;
  }>;
  allowed_mentions?: {
    parse?: Array<'roles' | 'users' | 'everyone'>;
    roles?: string[];
    users?: string[];
    replied_user?: boolean;
  };
  message_reference?: {
    message_id: string;
    channel_id?: string;
    guild_id?: string;
  };
}

async function getAccessToken(userId: string): Promise<string> {
  const accessToken = await getUserAccessToken({ userId });
  if (!accessToken) {
    throw new RequestError('Not Authorized: No access token found');
  }
  return accessToken;
}

export async function getChannels({ user, userId }: GetChannelsParams): Promise<any> {
  try {
    if (!userId) {
      userId = user.id;
    }
    const accessToken = await getUserAccessToken({ userId });
    const serverId = await getUserServerId({ userId });
    const rest = new REST({ version: '10' }).setToken(accessToken);

    const channels = await rest.get(Routes.guildChannels(serverId)) as any[];
    console.log('Retrieved channels:', channels);

    return channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
    }));
  } catch (error: any) {
    console.error('Error retrieving channels:', error.message);
    throw new RequestError(error.message || 'Failed to retrieve channels');
  }
}

export async function getMessages({
  user,
  userId,
  channelId,
  limit = 50,
  before,
  after,
  around
}: GetMessagesParams): Promise<Message[]> {
  try {
    if (!userId) {
      userId = user.id;
    }
    const accessToken = await getUserAccessToken({ userId });
    const rest = new REST({ version: '10' }).setToken(accessToken);

    // Validate that only one of 'before', 'after', or 'around' is provided
    const paramsCount = [before, after, around].filter(param => param !== undefined).length;
    if (paramsCount > 1) {
      throw new RequestError('Only one of "before", "after", or "around" can be provided at a time');
    }

    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (before) queryParams.append('before', before);
    if (after) queryParams.append('after', after);
    if (around) queryParams.append('around', around);

    const response = await rest.get(`${Routes.channelMessages(channelId)}?${queryParams.toString()}`);
    const messages = response as any[];

    if (!messages) {
      throw new RequestError('Failed to retrieve messages');
    }

    console.log(`Retrieved ${messages.length} messages from channel ${channelId}`);
    console.log('Raw messages response:', response);

    // Reverse the messages array to order them from oldest to newest
    const reversedMessages = messages.reverse();

    return reversedMessages.map(message => ({
      id: message.id,
      content: message.content,
      author: {
        id: message.author.id,
        username: message.author.username,
        discriminator: message.author.discriminator,
        avatar: message.author.avatar
      },
      attachments: (message.attachments || []).map((attachment: any) => ({
        id: attachment.id,
        url: attachment.url,
        name: attachment.name,
        size: attachment.size
      })),
      reactions: (message.reactions || []).map((reaction: any) => ({
        emoji: reaction.emoji.name,
        count: reaction.count
      }))
    }));
  } catch (error: any) {
    console.error(`Error retrieving messages from channel ${channelId}:`, error.message);
    throw new RequestError(error.message || `Failed to retrieve messages from channel ${channelId}`);
  }
}

export async function discordSendMessage({
  user,
  userId,
  channelId,
  content,
  tts = false,
  embeds,
  allowed_mentions,
  message_reference
}: SendMessageParams): Promise<any> {
  try {
    if (!userId) {
      userId = user.id;
    }
    const accessToken = await getUserAccessToken({ userId });
    const rest = new REST({ version: '10' }).setToken(accessToken);

    const body: any = {
      content,
      tts,
      embeds,
      allowed_mentions,
      message_reference,
    };

    // Remove undefined fields
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

    const response = await rest.post(Routes.channelMessages(channelId), { body });

    console.log(`Message sent to channel ${channelId}`);
    console.log('Response:', response);

    return response;
  } catch (error: any) {
    console.error(`Error sending message to channel ${channelId}:`, error.message);
    throw new RequestError(error.message || `Failed to send message to channel ${channelId}`);
  }
}
