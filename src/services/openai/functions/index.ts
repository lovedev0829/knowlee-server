import { ChatCompletionContentPart } from "openai/resources";
import {
    openAIGPT4VChatCompletionsCreate,
    openAIImagesGenerate,
} from "../../openAI.services";
import { User } from "../../../models/user.model";
import { findOneAndUpdateUserUsageStatDocument } from "../../userUsageStat.services";
import { createImage, getImage } from "../../queryMedia.services";
import { imageInterpreterFunction } from "./imageInterpreter";
import { videoInterpreterFunction } from "./videoInterpreter";
import { userKnowledgeFunction } from "./userKnowledge";
import { getEntityFunction, getLocalEntityFunction, getScrapedDataFunction } from "./entities";
import { webBrowsingFunction } from "./webBrowsing";
import {
  gmailUsersGetProfileFunction,
  gmailUsersMessagesAttachmentsGetFunction,
  gmailUsersMessagesGetFunction,
  gmailUsersMessagesListFunction,
  gmailUsersMessagesSendFunction,
  gmailUsersMessagesTrashFunction,
  gmailUsersMessagesUntrashFunction,
  gmailUsersThreadsGetFunction,
  gmailUsersThreadsListFunction,
  gmailUsersThreadsTrashFunction,
  gmailUsersThreadsUntrashFunction,
} from "./gmail";

import {
    outlookMailUsersMessagesSendFunction,
    outlookMailUsersMessagesSearchFunction,
    outlookMailUsersHighMessagesGetFunction,
    outlookMailUsersMessagesByAddressGetFunction
} from "./outlookmail"

import {
    outlookOneNoteUsersNotebooksGetFunction,
    outlookOneNoteUsersSectionsGetFunction,
    outlookOneNoteUsersPagesGetFunction,
    outlookOneNoteUsersNotebookCreateFunction,
    outlookOneNoteUsersSectionCreateFunction,
    outlookOneNoteUsersPageCreateFunction
} from "./outlookonenote"

import {
    outlookCalendarUsersEventsNextWeekGetFunction,
    outlookCalendarUsersEventsGetFunction,
    outlookCalendarUsersCalendarsGetFunction,
    outlookCalendarUsersMeetingTimesGetFunction,
    outlookCalendarUsersMeetingScheduleInsertFunction,
    outlookCalendarUsersGraphCallAddFunction,
    outlookCalendarUsersEventsTrackGetFunction
} from "./outlookcalendar";

import {
    outlookTeamsUsersJoinedTeamsGet,
    outlookTeamsUsersMemebersGet,
    outlookTeamsUsersChannelsGet,
    outlookTeamsUsersChannelInfoGet,
    outlookTeamsUsersItemsGet,
    outlookTeamsUsersChatCreate,
    outlookTeamsUsersChannelMsgSend
} from "./outlookteams";

import {
  gCalCalenderListListFunction,
  gCalEventsDeleteFunction,
  gCalEventsGetFunction,
  gCalEventsInsertFunction,
  gCalEventsListFunction,
  gCalEventsUpdateFunction,
} from "./googleCalendar";

import {
    notionRetreiveDatabaseGetFunction,
    notionQueryDatabasePostFunction,
    notionCreatePagesPostFunction,
    notionCreatePagesByContentPostFunction,
    notionRetrievePagesGetFunction,
    notionRetrieveBlockChildrenGetFunction,
    notionAppendBlockChildrenPatchFunction,
    notionUpdateBlockPatchFunction,
    notionRetriveBlockGetFunction,
    notionRemoveBlockDeleteFunction,
    notionSearchPostFunction,
    notionRetriveCommentsGetFunction,
    notionAddCommentToPagePostFunction,
    notionAddCommentToDiscussionPostFunction
} from "./notion";

import {
    pubMedEsearchGetFunction,
    pubMedESummaryGetFunction,
    pubMedEFetchGetFunction,
    pubMedELinkGetFunction
} from "./pubmed";

import {
    youtubeUploadVideoFunction
} from "./youtube"

import {
    tiktokUploadVideoFunction
} from  './tiktok'

import {
    openAIThreadsCreateFunction,
    openAIThreadsMessagesCreateFunction,
    openAIThreadsRunsCreateFunction,
    openAIThreadsRunsRetrieveFunction,
} from "./openai";
import { linkedInCreateShareFunction } from "./linkedIn";
import { apifyAdvancedLinkedInJobScraperFunction } from "./apify";
import {
    klapCreateVideoClipsFunction,
    klapCreateVideoFromClipFunction,
    klapCreatevideoFunction,
} from "./klap";
import {
    brevoEmailCampaignsCreateEmailCampaignFunction,
    brevoEmailCampaignsGetEmailCampaingnsFunction,
    brevoEmailCampaignsSendEmailCampaignNowFunction,
    brevoTransactionalEmailsSendTransacEmailFunction,
} from "./brevo";
import { mediumCreateShareFunction } from "./medium";
import { twitterCreateTweetFunction } from "./twitter";
import {
    typeframesCreateVideoFunction,
    typeframesGPTGetVideosFunction,
    typeframesCreateSlidesFunction,
    typeframesCreateVideoFromTextFunction,
    typeframesCreateVideoFromSlidesFunction,
    typeframesCreateVideoFromUrlFunction,
} from "./typeframes";
import { clockCurrentTimeFunction } from "./clock";
import { serpapiGoogleJobFunction } from "./serp_googleJob";
import {
    trelloGetACardFunction,
    trelloGetBoardsThatMemberBelongsToFunction,
    trelloGetCardsInAListFunction,
    trelloGetListsOnABoardFunction,
} from "./trello";
import { gKeepCreateNoteFunction, gKeepDeleteNoteFunction, gKeepGetNoteFunction, gKeepListNotesFunction } from "./googleKeep";
import { slackDeleteMessageFunction, slackEditMessageFunction, slackGetChannelsFunction, slackGetConversationHistoryFunction, slackRetrieveThreadOfMessagePostedToConversationFunction, slackScheduleMessageFunction, slackSendMessageFunction } from "./slack";
import {  getChannels, getMessages, discordSendMessage } from "./discord";
// import { deleteMessage, discordSendMessage, getChannels, getGuilds, getMessages, getUserDetails, reactToMessage, sendMessageWithAttachment } from "./discord";
// import { telegramSendMessage, sendPhoto, getChatMembers, initializeBot, getAllChatIds } from "./telegram";
import { deleteMessage as telegramDeleteMessage, deleteMessages, editMessageMedia, editMessageText, getAllChatIds, getChat, sendAudio, sendChatAction, sendDocument, sendMessage, sendPhoto, sendPoll, sendVideo, setMessageReaction } from "./telegram";

export async function openAIGPT4VChatCompletionsCreateFunction({
    user,
    prompt,
    image_url,
}: {
        user: User;
        prompt: string;
        image_url: string;
}) {
    try {
        if (!user) return "please provide user";
        if (!prompt) return "please provide prompt";
        if (!image_url) return "please provide image_url";
    const content: ChatCompletionContentPart[] = [
        { type: "text", text: prompt },
        {
            type: "image_url",
            image_url: {
                url: image_url,
                detail: "auto",
            },
        },
    ];
    const completion = await openAIGPT4VChatCompletionsCreate(content);
    return completion;
    } catch (error: any) {
        return error?.message;
    }
}

export async function textToImageFunction({
    user,
    prompt,
    negative_prompt,
    textToImageModel,
}: {
    user: User;
    prompt: string;
    negative_prompt: string;
    textToImageModel: string;
}) {
    try {
        if (!user) return "please provide user";
        if (!prompt) return "please provide prompt";
        const { id: userId } = user;

        if (textToImageModel === "DALLE") {
            const image = await openAIImagesGenerate({ prompt });

            // increment textToImage dalle3 usage count
            const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
                { userId: userId },
                { $inc: { "textToImage.dalle3Count": 1 } },
                { upsert: true, new: true }
            );
            const imageUrl = image.data[0]?.url;
            return imageUrl;

        } else if (textToImageModel === "SDXL") {
            const imageId = await createImage({ negative_prompt, prompt });

            // Waiting for image exists in the server
            await new Promise((resolve) => setTimeout(resolve, 10000));

            const imageUrl = await getImage(imageId);

            // increment textToImage sdxl usage count
            const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
                { userId: userId },
                { $inc: { "textToImage.sdxlCount": 1 } },
                { upsert: true, new: true }
            );

            return imageUrl;
        }
        return "could not generate image";
    } catch (error: any) {
        return error?.message;
    }
}



// define all openAI supported functions here
export const availableOpenAIFunctions: { [key: string]: any } = {
    // get_weather: getCurrentWeather,
    //openai_gpt4v_chat_completions_create: openAIGPT4VChatCompletionsCreateFunction,
    apify_advanced_linkedin_job_scraper: apifyAdvancedLinkedInJobScraperFunction,
    brevo_email_campaigns_get_email_campaigns: brevoEmailCampaignsGetEmailCampaingnsFunction,
    brevo_email_campaigns_create_email_campaign: brevoEmailCampaignsCreateEmailCampaignFunction,
    brevo_email_campaigns_send_email_campaign_now: brevoEmailCampaignsSendEmailCampaignNowFunction,
    brevo_transactional_emails_send_transac_email: brevoTransactionalEmailsSendTransacEmailFunction,
    clock_current_time: clockCurrentTimeFunction,
    text_to_image: textToImageFunction,
    discord_get_channel: getChannels,
    discord_send_message: discordSendMessage,
    // discord_get_server: getGuilds,
    discord_get_messages: getMessages,
    // discord_react_to_message: reactToMessage,
    // discord_send_message_with_attachment: sendMessageWithAttachment,
    // discord_delete_message: deleteMessage,
    telegram_send_message: sendMessage,
    telegram_send_photo: sendPhoto,
    telegram_get_all_chat_ids: getAllChatIds,
    telegram_delete_message: telegramDeleteMessage,
    telegram_delete_messages: deleteMessages,
    telegram_edit_message_text: editMessageText,
    telegram_edit_message_media: editMessageMedia,
    telegram_get_chat: getChat,
    telegram_send_audio: sendAudio,
    telegram_send_document: sendDocument,
    telegram_send_video: sendVideo,
    telegram_send_poll: sendPoll,
    telegram_send_chat_action: sendChatAction,
    telegram_set_message_reaction: setMessageReaction,
    gmail_users_get_profile: gmailUsersGetProfileFunction,
    gmail_users_messages_attachments_get: gmailUsersMessagesAttachmentsGetFunction,
    gmail_users_messages_get: gmailUsersMessagesGetFunction,
    gmail_users_messages_list: gmailUsersMessagesListFunction,
    gmail_users_messages_send: gmailUsersMessagesSendFunction,
    gmail_users_messages_trash: gmailUsersMessagesTrashFunction,
    gmail_users_messages_untrash: gmailUsersMessagesUntrashFunction,
    gmail_users_threads_get: gmailUsersThreadsGetFunction,
    gmail_users_threads_list: gmailUsersThreadsListFunction,
    gmail_users_threads_trash: gmailUsersThreadsTrashFunction,
    gmail_users_threads_untrash: gmailUsersThreadsUntrashFunction,
    outlookmail_users_messages_send:outlookMailUsersMessagesSendFunction,
    outlookmail_users_messages_search:outlookMailUsersMessagesSearchFunction,
    outlookmail_users_high_important_messages_get:outlookMailUsersHighMessagesGetFunction,
    outlookmail_users_messages_byaddress_get:outlookMailUsersMessagesByAddressGetFunction,
    outlookcalendar_users_events_next_week_get: outlookCalendarUsersEventsNextWeekGetFunction,
    outlookcalendar_users_events_get: outlookCalendarUsersEventsGetFunction,
    outlookcalendar_users_calendars_get: outlookCalendarUsersCalendarsGetFunction,
    outlookcalendar_users_meetingtimes_list: outlookCalendarUsersMeetingTimesGetFunction,
    outlookcalendar_users_meeting_schedule: outlookCalendarUsersMeetingScheduleInsertFunction,
    outlookcalendar_users_graph_call_add: outlookCalendarUsersGraphCallAddFunction,
    outlookcalendar_users_events_track_get: outlookCalendarUsersEventsTrackGetFunction,
    outlookOneNote_users_notebooks_get: outlookOneNoteUsersNotebooksGetFunction,
    outlookOneNote_users_sections_get: outlookOneNoteUsersSectionsGetFunction,
    outlookOneNote_users_pages_get: outlookOneNoteUsersPagesGetFunction,
    outlookOneNote_users_notebook_create: outlookOneNoteUsersNotebookCreateFunction,
    outlookOneNote_users_sections_create: outlookOneNoteUsersSectionCreateFunction,
    outlookOneNote_users_pages_create: outlookOneNoteUsersPageCreateFunction,
    outlookteams_users_joinedteams_get: outlookTeamsUsersJoinedTeamsGet,
    outlookteams_users_memebers_get: outlookTeamsUsersMemebersGet,
    outlookteams_users_team_channels_get: outlookTeamsUsersChannelsGet,
    outlookteams_users_channelinfo_get: outlookTeamsUsersChannelInfoGet,
    outlookteams_users_items_get: outlookTeamsUsersItemsGet,
    outlookteams_users_chat_create: outlookTeamsUsersChatCreate,
    outlookteams_users_channelmsg_send: outlookTeamsUsersChannelMsgSend,
    google_calendar_calenderlist_list: gCalCalenderListListFunction,
    google_calendar_events_delete: gCalEventsDeleteFunction,
    google_calendar_events_get: gCalEventsGetFunction,
    google_calendar_events_insert: gCalEventsInsertFunction,
    google_calendar_events_list: gCalEventsListFunction,
    google_calendar_events_update: gCalEventsUpdateFunction,
    google_news_search: webBrowsingFunction,
    google_keep_create_note: gKeepCreateNoteFunction,
    google_keep_delete_note: gKeepDeleteNoteFunction,
    google_keep_get_note: gKeepGetNoteFunction,
    google_keep_list_notes: gKeepListNotesFunction,
    notion_retrieve_database_get: notionRetreiveDatabaseGetFunction,
    notion_query_database_post: notionQueryDatabasePostFunction,
    notion_create_pages_post: notionCreatePagesPostFunction,
    notion_create_pages_by_content_post: notionCreatePagesByContentPostFunction,
    notion_retrieve_pages_get: notionRetrievePagesGetFunction,
    notion_retrieve_block_children_get: notionRetrieveBlockChildrenGetFunction,
    notion_append_block_children_patch: notionAppendBlockChildrenPatchFunction,
    notion_update_block_patch: notionUpdateBlockPatchFunction,
    notion_retrive_block_get: notionRetriveBlockGetFunction,
    notion_remove_block_get: notionRemoveBlockDeleteFunction,
    notion_search_post: notionSearchPostFunction,
    notion_retrive_comments_get: notionRetriveCommentsGetFunction,
    notion_add_comments_to_page_post: notionAddCommentToPagePostFunction,
    notion_add_comments_to_discussion_post: notionAddCommentToDiscussionPostFunction,
    pubMed_Esearch_get: pubMedEsearchGetFunction,
    pubMed_ESummary_get: pubMedESummaryGetFunction,
    pubMed_EFetch_get: pubMedEFetchGetFunction,
    pubMed_ELink_get: pubMedELinkGetFunction,
    youtube_upload_video_post: youtubeUploadVideoFunction,
    tiktok_upload_video_post: tiktokUploadVideoFunction,
    image_interpreter: imageInterpreterFunction,
    klap_create_video: klapCreatevideoFunction,
    klap_create_video_clips: klapCreateVideoClipsFunction,
    klap_create_video_from_clip: klapCreateVideoFromClipFunction,
    linkedin_create_share: linkedInCreateShareFunction,
    medium_create_share: mediumCreateShareFunction,
    openai_threads_create: openAIThreadsCreateFunction,
    openai_threads_messages_create: openAIThreadsMessagesCreateFunction,
    openai_threads_runs_create: openAIThreadsRunsCreateFunction,
    openai_threads_runs_retrieve: openAIThreadsRunsRetrieveFunction,
    slack_get_channels: slackGetChannelsFunction,
    slack_send_message: slackSendMessageFunction,
    slack_schedule_message: slackScheduleMessageFunction,
    slack_get_conversation_history: slackGetConversationHistoryFunction,
    slack_get_threads: slackRetrieveThreadOfMessagePostedToConversationFunction,
    slack_update_message: slackEditMessageFunction,
    slack_delete_message: slackDeleteMessageFunction,
    trello_get_a_card: trelloGetACardFunction,
    trello_get_boards_that_member_belongs_to: trelloGetBoardsThatMemberBelongsToFunction,
    trello_get_cards_in_a_list: trelloGetCardsInAListFunction,
    trello_get_lists_on_a_board: trelloGetListsOnABoardFunction,
    twitter_create_tweet: twitterCreateTweetFunction,
    typeframes_create_video: typeframesCreateVideoFunction,
    typeframes_create_video_from_text: typeframesCreateVideoFromTextFunction,
    typeframes_create_video_from_slides: typeframesCreateVideoFromSlidesFunction,
    typeframes_create_video_from_url: typeframesCreateVideoFromUrlFunction,
    typeframes_gpt_get_videos: typeframesGPTGetVideosFunction,
    typeframes_create_slides: typeframesCreateSlidesFunction,
    serpapi_google_job: serpapiGoogleJobFunction,
    video_interpreter: videoInterpreterFunction,
    web_browsing: webBrowsingFunction,
    get_userKnowledge: userKnowledgeFunction,
    get_entity: getEntityFunction,
    get_localEntity: getLocalEntityFunction,
    get_scrapedData: getScrapedDataFunction
};
