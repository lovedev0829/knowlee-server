export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    added_to_attachment_menu?: boolean;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
    can_connect_to_business?: boolean;
}

export interface TelegramChat {
    id: number;
    type: "private" | "group" | "supergroup" | "channel";
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_forum?: boolean;
}

export interface TelegramMessageEntity {
    type:
    | "mention"
    | "hashtag"
    | "cashtag"
    | "bot_command"
    | "url"
    | "email"
    | "phone_number"
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "spoiler"
    | "blockquote"
    | "expandable_blockquote"
    | "code"
    | "pre"
    | "text_link"
    | "text_mention"
    | "custom_emoji";
    offset: number;
    length: number;
    url?: string;
    user?: TelegramUser;
    language?: string;
    custom_emoji_id?: string;
}
export interface TelegramMessage {
    message_id: number;
    message_thread_id?: number;
    from?: TelegramUser;
    sender_chat?: TelegramChat;
    sender_boost_count?: number;
    sender_business_bot?: TelegramUser;
    date: number;
    business_connection_id?: string;
    chat: TelegramChat;
    forward_origin?: any;
    is_topic_message?: boolean;
    is_automatic_forward?: boolean;
    reply_to_message?: TelegramMessage;
    external_reply?: any;
    quote?: any;
    reply_to_story?: any;
    via_bot?: TelegramUser;
    edit_date?: number;
    has_protected_content?: boolean;
    is_from_offline?: boolean;
    media_group_id?: string;
    author_signature?: string;
    text?: string;
    entities?: TelegramMessageEntity[];
    link_preview_options?: any;
    effect_id?: string;
    animation?: any;
    audio?: any;
    document?: any;
    photo?: any[];
    sticker?: any;
    story?: any;
    video?: any;
    video_note?: any;
    voice?: any;
    caption?: string;
    caption_entities?: TelegramMessageEntity[];
    show_caption_above_media?: boolean;
    has_media_spoiler?: boolean;
    contact?: any;
    dice?: any;
    game?: any;
    poll?: any;
    venue?: any;
    location?: any;
    new_chat_members?: TelegramUser[];
    left_chat_member?: TelegramUser;
    new_chat_title?: string;
    new_chat_photo?: any[];
    delete_chat_photo?: boolean;
    group_chat_created?: boolean;
    supergroup_chat_created?: boolean;
    channel_chat_created?: boolean;
    message_auto_delete_timer_changed?: any;
    migrate_to_chat_id?: number;
    migrate_from_chat_id?: number;
    pinned_message?: any;
    invoice?: any;
    successful_payment?: any;
    users_shared?: any;
    chat_shared?: any;
    connected_website?: string;
    write_access_allowed?: any;
    passport_data?: any;
    proximity_alert_triggered?: any;
    boost_added?: any;
    chat_background_set?: any;
    forum_topic_created?: any;
    forum_topic_edited?: any;
    forum_topic_closed?: any;
    forum_topic_reopened?: any;
    general_forum_topic_hidden?: any;
    general_forum_topic_unhidden?: any;
    giveaway_created?: any;
    giveaway?: any;
    giveaway_winners?: any;
    giveaway_completed?: any;
    video_chat_scheduled?: any;
    video_chat_started?: any;
    video_chat_ended?: any;
    video_chat_participants_invited?: any;
    web_app_data?: any;
    reply_markup?: any;
}
