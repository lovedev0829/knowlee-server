import { ReadStream } from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { User } from "../../../models/user.model";
import { RequestError } from "../../../utils/globalErrorHandler";
import { getUserAccessToken } from "../../../lib/telegram/telegram.services";

interface GetAllChatIdsParams {
  user: User;
  userId: string;
}
interface ChatDetails {
  chatId: string;
  messages: Array<{
    messageId: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username: string;
      language_code: string;
    };
    date: number;
    text: string;
    entities?: Array<{
      offset: number;
      length: number;
      type: string;
    }>;
  }>;
}

export async function getAllChatIds({ user, userId }: GetAllChatIdsParams): Promise<ChatDetails[]> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to retrieve chat IDs: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const updates = await bot.getUpdates();
    const chatDetailsMap: Map<string, ChatDetails> = new Map();

    updates.forEach((update: any) => {
      if (update.message && update.message.chat && update.message.chat.id) {
        const chatId = update.message.chat.id.toString();

        if (!chatDetailsMap.has(chatId)) {
          chatDetailsMap.set(chatId, {
            chatId,
            messages: []
          });
        }

        const chatDetails = chatDetailsMap.get(chatId);
        if (chatDetails) {
          chatDetails.messages.push({
            messageId: update.message.message_id,
            from: update.message.from,
            date: update.message.date,
            text: update.message.text,
            entities: update.message.entities,
          });
        }
      }
    });

    const chatDetailsArray = Array.from(chatDetailsMap.values());
    console.log("Retrieved chat details:", chatDetailsArray);
    return chatDetailsArray;
  } catch (error: any) {
    console.error("Error retrieving chat details:", error.message);
    throw new RequestError(error.message || "Failed to retrieve chat details");
  }
}


interface SendMessageParams {
  user: User,
  userId: string;
  chatId: string;
  text: string;
}

export async function sendMessage({ user, userId, chatId, text }: SendMessageParams) {
  try {
    if (!text || text.trim().length === 0) {
      console.error("Failed to send message: Text is empty");
      throw new RequestError("Bad Request: Text is empty");
    }
    if(!userId) {
      userId = user.id;
    }
    const token = await getUserAccessToken({ userId });
    // set your token here to test
    const bot = new TelegramBot(token, { polling: false });

    if (!token) {
      console.error("Failed to send message: No bot token found");
      // throw new RequestError("Not Authorized: No bot token found");
      // await bot.sendMessage(chatId, "OUR CUSTOM MESSAGE HERE LIKE SOMETHING WENT WRONG");
      return "Not Authorized: No bot token found";
    }


    const response = await bot.sendMessage(chatId, text);
    return response;
  } catch (error: any) {
    // console.error("Error sending message:", error.message);
    // throw new RequestError(error.message || "Failed to send message");

    const errorMessage = error.response ? error.response.data : error.message;
    //console.log("Error creating share:----->", errorMessage);
    // await bot.sendMessage(chatId, "OUR CUSTOM MESSAGE HERE LIKE SOMETHING WENT WRONG");
    return errorMessage;
  }
}

interface SendPhotoParams {
  user: User,
  userId: string;
  chatId: string;
  photo: string; // file_id, URL, or path to the photo
  caption?: string;
}

export async function sendPhoto({ user, userId, chatId, photo, caption }: SendPhotoParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to send photo: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.sendPhoto(chatId, photo, { caption });
    console.log("Photo sent:", response);
  } catch (error: any) {
    console.error("Error sending photo:", error.message);
    throw new RequestError(error.message || "Failed to send photo");
  }
}

interface SendAudioParams {
  user: User,
  userId: string;
  chatId: string;
  audio: string; // file_id, URL, or path to the audio file
  caption?: string;
  performer?: string;
  title?: string;
  duration?: number;
}

export async function sendAudio({ user, userId, chatId, audio, caption, performer, title, duration }: SendAudioParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to send audio: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.sendAudio(chatId, audio, { caption, performer, title, duration });
    console.log("Audio sent:", response);
  } catch (error: any) {
    console.error("Error sending audio:", error.message);
    throw new RequestError(error.message || "Failed to send audio");
  }
}

interface SendDocumentParams {
  user: User,
  userId: string;
  chatId: string;
  document: string; // file_id, URL, or path to the document
  caption?: string;
}

export async function sendDocument({ user, userId, chatId, document, caption }: SendDocumentParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to send document: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.sendDocument(chatId, document, { caption });
    console.log("Document sent:", response);
  } catch (error: any) {
    console.error("Error sending document:", error.message);
    throw new RequestError(error.message || "Failed to send document");
  }
}

interface SendVideoParams {
  user: User,
  userId: string;
  chatId: string;
  video: string; // file_id, URL, or path to the video
  caption?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export async function sendVideo({ user, userId, chatId, video, caption, duration, width, height }: SendVideoParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to send video: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.sendVideo(chatId, video, { caption, duration, width, height });
    console.log("Video sent:", response);
  } catch (error: any) {
    console.error("Error sending video:", error.message);
    throw new RequestError(error.message || "Failed to send video");
  }
}

interface SendPollParams {
  user: User,
  userId: string;
  chatId: string;
  question: string;
  options: string[];
  isAnonymous?: boolean;
  type?: 'regular' | 'quiz';
  allowsMultipleAnswers?: boolean;
  correctOptionId?: number;
  explanation?: string;
  openPeriod?: number;
  closeDate?: number;
  isClosed?: boolean;
}

export async function sendPoll({
  user,
  userId,
  chatId,
  question,
  options,
  isAnonymous = true,
  type = 'regular',
  allowsMultipleAnswers = false,
  correctOptionId,
  explanation,
  openPeriod,
  closeDate,
  isClosed = false,
}: SendPollParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to send poll: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.sendPoll(chatId, question, options, {
      is_anonymous: isAnonymous,
      type,
      allows_multiple_answers: allowsMultipleAnswers,
      correct_option_id: correctOptionId,
      explanation,
      open_period: openPeriod,
      close_date: closeDate,
      is_closed: isClosed,
    });
    console.log("Poll sent:", response);
  } catch (error: any) {
    console.error("Error sending poll:", error.message);
    throw new RequestError(error.message || "Failed to send poll");
  }
}

interface SendChatActionParams {
  user: User,
  userId: string;
  chatId: string;
  action: TelegramBot.ChatAction;
}

export async function sendChatAction({ user, userId, chatId, action }: SendChatActionParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to send chat action: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.sendChatAction(chatId, action);
    console.log("Chat action sent:", response);
  } catch (error: any) {
    console.error("Error sending chat action:", error.message);
    throw new RequestError(error.message || "Failed to send chat action");
  }
}

interface SetMessageReactionParams {
  user: User,
  userId: string;
  chatId: number | string;
  messageId: number;
  reaction: string[];
  isBig?: boolean;
}

export async function setMessageReaction({ user, userId, chatId, messageId, reaction, isBig = false }: SetMessageReactionParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to set message reaction: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    // Implement the setMessageReaction functionality or use sendMessage to notify about the reaction
    const response = await bot.sendMessage(chatId, `Reacted to message ${messageId} with ${reaction}`);
    console.log("Message reaction set:", response);
  } catch (error: any) {
    console.error("Error setting message reaction:", error.message);
    throw new RequestError(error.message || "Failed to set message reaction");
  }
}

interface ApproveChatJoinRequestParams {
  user: User,
  userId: string;
  chatId: number | string;
  userIdToApprove: number;
}

export async function approveChatJoinRequest({ user, userId, chatId, userIdToApprove }: ApproveChatJoinRequestParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to approve chat join request: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.approveChatJoinRequest(chatId, userIdToApprove);
    console.log("Chat join request approved:", response);
  } catch (error: any) {
    console.error("Error approving chat join request:", error.message);
    throw new RequestError(error.message || "Failed to approve chat join request");
  }
}

interface DeclineChatJoinRequestParams {
  user: User,
  userId: string;
  chatId: number | string;
  userIdToDecline: number;
}

export async function declineChatJoinRequest({ user, userId, chatId, userIdToDecline }: DeclineChatJoinRequestParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to decline chat join request: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.declineChatJoinRequest(chatId, userIdToDecline);
    console.log("Chat join request declined:", response);
  } catch (error: any) {
    console.error("Error declining chat join request:", error.message);
    throw new RequestError(error.message || "Failed to decline chat join request");
  }
}

interface SetChatPhotoParams {
  user: User,
  userId: string;
  chatId: number | string;
  photo: string | Buffer | ReadStream; // Correct type for the photo parameter
}

export async function setChatPhoto({ user, userId, chatId, photo }: SetChatPhotoParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to set chat photo: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.setChatPhoto(chatId, photo);
    console.log("Chat photo set:", response);
  } catch (error: any) {
    console.error("Error setting chat photo:", error.message);
    throw new RequestError(error.message || "Failed to set chat photo");
  }
}

interface DeleteChatPhotoParams {
  user: User,
  userId: string;
  chatId: number | string;
}

export async function deleteChatPhoto({ user, userId, chatId }: DeleteChatPhotoParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to delete chat photo: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.deleteChatPhoto(chatId);
    console.log("Chat photo deleted:", response);
  } catch (error: any) {
    console.error("Error deleting chat photo:", error.message);
    throw new RequestError(error.message || "Failed to delete chat photo");
  }
}

interface SetChatTitleParams {
  user: User,
  userId: string;
  chatId: number | string;
  title: string;
}

export async function setChatTitle({ user, userId, chatId, title }: SetChatTitleParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to set chat title: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.setChatTitle(chatId, title);
    console.log("Chat title set:", response);
  } catch (error: any) {
    console.error("Error setting chat title:", error.message);
    throw new RequestError(error.message || "Failed to set chat title");
  }
}

interface SetChatDescriptionParams {
  user: User,
  userId: string;
  chatId: number | string;
  description: string;
}

export async function setChatDescription({ user, userId, chatId, description }: SetChatDescriptionParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to set chat description: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.setChatDescription(chatId, description);
    console.log("Chat description set:", response);
  } catch (error: any) {
    console.error("Error setting chat description:", error.message);
    throw new RequestError(error.message || "Failed to set chat description");
  }
}

interface PinChatMessageParams {
  user: User,
  userId: string;
  chatId: number | string;
  messageId: number;
  disableNotification?: boolean;
}

export async function pinChatMessage({ user, userId, chatId, messageId, disableNotification }: PinChatMessageParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to pin chat message: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.pinChatMessage(chatId, messageId, { disable_notification: disableNotification });
    console.log("Chat message pinned:", response);
  } catch (error: any) {
    console.error("Error pinning chat message:", error.message);
    throw new RequestError(error.message || "Failed to pin chat message");
  }
}

interface UnpinChatMessageParams {
  user: User,
  userId: string;
  chatId: number | string;
  messageId?: number;
}

export async function unpinChatMessage({ user, userId, chatId, messageId }: UnpinChatMessageParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to unpin chat message: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    let response;
    if (messageId !== undefined) {
      response = await bot.unpinChatMessage(chatId, { message_id: messageId });
    } else {
      response = await bot.unpinChatMessage(chatId);
    }
    console.log("Chat message unpinned:", response);
  } catch (error: any) {
    console.error("Error unpinning chat message:", error.message);
    throw new RequestError(error.message || "Failed to unpin chat message");
  }
}

interface GetChatParams {
  user: User,
  userId: string;
  chatId: number | string;
}

export async function getChat({ user, userId, chatId }: GetChatParams): Promise<TelegramBot.Chat> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to get chat: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.getChat(chatId);
    console.log("Chat retrieved:", response);
    return response;
  } catch (error: any) {
    console.error("Error getting chat:", error.message);
    throw new RequestError(error.message || "Failed to get chat");
  }
}

interface GetChatAdministratorsParams {
  user: User,
  userId: string;
  chatId: number | string;
}

export async function getChatAdministrators({ user, userId, chatId }: GetChatAdministratorsParams): Promise<TelegramBot.ChatMember[]> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to get chat administrators: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.getChatAdministrators(chatId);
    console.log("Chat administrators retrieved:", response);
    return response;
  } catch (error: any) {
    console.error("Error getting chat administrators:", error.message);
    throw new RequestError(error.message || "Failed to get chat administrators");
  }
}

interface GetChatMemberCountParams {
  user: User,
  userId: string;
  chatId: number | string;
}

export async function getChatMemberCount({ user, userId, chatId }: GetChatMemberCountParams): Promise<number> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to get chat member count: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.getChatMemberCount(chatId);
    console.log("Chat member count retrieved:", response);
    return response;
  } catch (error: any) {
    console.error("Error getting chat member count:", error.message);
    throw new RequestError(error.message || "Failed to get chat member count");
  }
}

interface GetChatMemberParams {
  user: User,
  userId: string;
  chatId: number | string;
  userIdToGet: number;
}

export async function getChatMember({ user, userId, chatId, userIdToGet }: GetChatMemberParams): Promise<TelegramBot.ChatMember> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to get chat member: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.getChatMember(chatId, userIdToGet);
    console.log("Chat member retrieved:", response);
    return response;
  } catch (error: any) {
    console.error("Error getting chat member:", error.message);
    throw new RequestError(error.message || "Failed to get chat member");
  }
}

interface SetMyCommandsParams {
  user: User,
  userId: string;
  commands: TelegramBot.BotCommand[];
  scope?: TelegramBot.BotCommandScope;
  languageCode?: string;
}

export async function setMyCommands({ user, userId, commands, scope, languageCode }: SetMyCommandsParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to set my commands: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.setMyCommands(commands, { scope, language_code: languageCode });
    console.log("Commands set:", response);
  } catch (error: any) {
    console.error("Error setting commands:", error.message);
    throw new RequestError(error.message || "Failed to set commands");
  }
}

interface DeleteMyCommandsParams {
  user: User,
  userId: string;
  scope?: TelegramBot.BotCommandScope;
  languageCode?: string;
}

export async function deleteMyCommands({ user, userId, scope, languageCode }: DeleteMyCommandsParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to delete my commands: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.setMyCommands([], { scope, language_code: languageCode });
    console.log("Commands deleted:", response);
  } catch (error: any) {
    console.error("Error deleting commands:", error.message);
    throw new RequestError(error.message || "Failed to delete commands");
  }
}

interface GetMyCommandsParams {
  user: User,
  userId: string;
  scope?: TelegramBot.BotCommandScope;
  languageCode?: string;
}

export async function getMyCommands({ user, userId, scope, languageCode }: GetMyCommandsParams): Promise<TelegramBot.BotCommand[]> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to get my commands: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.getMyCommands(scope, languageCode);
    console.log("Commands retrieved:", response);
    return response;
  } catch (error: any) {
    console.error("Error getting commands:", error.message);
    throw new RequestError(error.message || "Failed to get commands");
  }
}

interface EditMessageTextParams {
  user: User,
  userId: string;
  chatId?: number | string;
  messageId?: number;
  inlineMessageId?: string;
  text: string;
  parseMode?: TelegramBot.ParseMode;
  entities?: TelegramBot.MessageEntity[];
  replyMarkup?: TelegramBot.InlineKeyboardMarkup;
}

export async function editMessageText({
  user,
  userId,
  chatId,
  messageId,
  inlineMessageId,
  text,
  parseMode,
  entities,
  replyMarkup,
}: EditMessageTextParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to edit message text: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      parse_mode: parseMode,
      reply_markup: replyMarkup,
    });
    console.log("Message text edited:", response);
  } catch (error: any) {
    console.error("Error editing message text:", error.message);
    throw new RequestError(error.message || "Failed to edit message text");
  }
}

interface EditMessageMediaParams {
  user: User,
  userId: string;
  chatId?: number | string;
  messageId?: number;
  inlineMessageId?: string;
  media: TelegramBot.InputMedia;
  replyMarkup?: TelegramBot.InlineKeyboardMarkup;
}

export async function editMessageMedia({
  user,
  userId,
  chatId,
  messageId,
  inlineMessageId,
  media,
  replyMarkup,
}: EditMessageMediaParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to edit message media: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const response = await bot.editMessageMedia(media, {
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      reply_markup: replyMarkup,
    });
    console.log("Message media edited:", response);
  } catch (error: any) {
    console.error("Error editing message media:", error.message);
    throw new RequestError(error.message || "Failed to edit message media");
  }
}
interface DeleteMessageParams {
  user: User,
  userId: string;
  chatId: number | string;
  messageId: number;
}

export async function deleteMessage({ user, userId, chatId, messageId }: DeleteMessageParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to delete message: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  if (!chatId) {
    console.error("Failed to delete message: chatId is undefined");
    throw new RequestError("chatId is not specified");
  }

  if (!messageId && messageId !== 0) {
    console.error("Failed to delete message: messageId is undefined");
    throw new RequestError("messageId is not specified");
  }

  const bot = new TelegramBot(token, { polling: false });

  console.log(`Attempting to delete message with chatId: ${chatId}, messageId: ${messageId}`);

  try {
    const response = await bot.deleteMessage(chatId, messageId);
    console.log("Message deleted:", response);
  } catch (error: any) {
    console.error("Error deleting message:", error);
    console.error("Error response:", error.response && error.response.body);
    throw new RequestError(error.message || "Failed to delete message");
  }
}

interface DeleteMessagesParams {
  user: User,
  userId: string;
  chatId: number | string;
  messageIds: number[];
}

export async function deleteMessages({ user, userId, chatId, messageIds }: DeleteMessagesParams): Promise<void> {
  if(!userId) {
    userId = user.id;
  }
  const token = await getUserAccessToken({ userId });

  if (!token) {
    console.error("Failed to delete messages: No bot token found");
    throw new RequestError("Not Authorized: No bot token found");
  }

  if (!chatId) {
    console.error("Failed to delete messages: chatId is undefined");
    throw new RequestError("chatId is not specified");
  }

  const bot = new TelegramBot(token, { polling: false });

  try {
    const deleteMessagePromises = messageIds.map(messageId => bot.deleteMessage(chatId, messageId));
    await Promise.all(deleteMessagePromises);
    console.log("Messages deleted");
  } catch (error: any) {
    console.error("Error deleting messages:", error.message);
    throw new RequestError(error.message || "Failed to delete messages");
  }
}
