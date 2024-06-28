import { FunctionDefinition } from "openai/resources";

export const getCurrentWeatherFunctionDefinition: FunctionDefinition = {
    name: "get_weather",
    description: "Get the current weather in a given location",
    parameters: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
        },
        required: ["location"],
    },
};

export const getNicknameFunctionDefinition: FunctionDefinition = {
    name: "getNickname",
    description: "Get the nickname of a city",
    parameters: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "The city and state e.g. San Francisco, CA",
            },
        },
        required: ["location"],
    },
};

export const openAIGPT4VChatCompletionsCreateFunctionDefinition: FunctionDefinition =
{
    name: "openai_gpt4v_chat_completions_create",
    description: "Creates a model response for the given chat conversation.",
    parameters: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "The text content",
            },
            image_url: {
                type: "string",
                description: "A URL of the image.",
            },
        },
        required: ["prompt", "image_url"],
    },
};

export const getUserKnowledgeFunctionDefinition: FunctionDefinition = {
    name: "get_userKnowledge",
    description: "Getting user knowledge",
    parameters: {
        type: "object",
        properties: {
        },
        required: []
    }
};

export const getEntityFunctionDefinition: FunctionDefinition = {
    name: "get_entity",
    description: "Getting entities related to a source",
    parameters: {
        type: "object",
        properties: {
            queryObject: {
                type: "string",
                description: "Query object of the user making the request"
            }

        },
        required: ["queryObject"]
    }
};


export const getLocalEntityFunctionDefinition: FunctionDefinition = {
    name: "get_localEntity",
    description: "Getting local entity related user uploaded data",
    parameters: {
        type: "object",
        properties: {
            entityId: {
                type: "string",
                description: "The unique identifier of the local entity"
            }
        },
        required: ["entityId"]
    }
};

export const getScrapedDataFunctionDefinition: FunctionDefinition = {
    name: "get_scrapedData",
    description: "Retrieve and return scraped data related to entities",
    parameters: {
        type: "object",
        properties: {
            entityId: {
                type: "string",
                description: "The unique identifier of the local entity"
            }
        },
        required: ["entityId"]
    }
};

export const webBrowsingFunctionDefinition: FunctionDefinition = {
    name: "web_browsing",
    description:
        "executes search requests in real time returning clean, structured JSON, HTML or CSV results. You can achieve fine-grained control over your search query using the search parameters.",
    parameters: {
        type: "object",
        properties: {
            api_key: {
                type: "string",
                description: "The API key for your Scale SERP account.",
            },
            q: {
                type: "string",
                description: "your search query",
            },
            search_type: {
                type: "string",
                enum: [
                    "news",
                    "images",
                    "videos",
                    "scholar",
                    "autocomplete",
                    "places",
                    "place_details",
                    "place_photos",
                    "place_reviews",
                    "place_products",
                    "place_posts",
                    "shopping",
                    "product",
                ],
                description:
                    "The type of request to make.The value of the type parameter determines which additional parameters are available. For example, if you make a request with search_type = news then additional Google News Parameters, specific to news requests, are available.",
                valid_values: {
                    default:
                        "If the search_type parameter is omitted then a regular web search is performed",
                    news: "Perform a Google News request",
                    images: "Perform a Google Images request",
                    videos: "Perform a Google Videos request",
                    scholar: "Perform a Google Scholar request",
                    autocomplete: "Perform a Google Autocomplete request",
                    places: "Perform a Google Places request",
                    place_details:
                        "Perform a Google Place Details request to get further information on a given Place",
                    place_photos:
                        "Perform a Google Place Photos request to get Place Photos for a given Place",
                    place_reviews:
                        "Perform a Google Place Reviews request to get Place Reviews for a given Place.",
                    place_products:
                        "Perform a Google Place Products request to get Place Products for a given Place",
                    place_posts:
                        "Perform a Google Place Posts request to get Place Posts for a given Place",
                    shopping: "Perform a Google Shopping search results",
                    product:
                        "Perform a Google Product results for a single product. Note that when making a search_type=product request the product_type parameter determines the type of Product request, available values for product_type are: 'reviews'- Retrieve reviews for a given Product,'online_sellers'- Retrieve sellers for a given Product, 'specifications' - Retrieve data from the specifications page for a given Product",
                },
            },
            url: {
                type: "string",
                description:
                    "Specifies the URL to open(instead of specifying a query using the q parameter). Note To specify the type of parsing applied to the results from the url parameter, use the search_type parameter. Note The url parameter must be URL- encoded.The url parameter is not available for all search_type values.",
            },
            device: {
                type: "string",
                description:
                    "Determines the device to use to get results. Can be set to desktop(default ) to use a regular desktop web browser, tablet to use a tablet browser(use the tablet_type to choose the type of tablet device), or mobile to use a mobile browser(use the mobile_type to choose the type of mobile device). Note that not all search_type values are parsed for each device(for example, some results are parsed in desktop only).",
            },
            mobile_type: {
                type: "string",
                description:
                    "Applies when device=mobile and determines the type of mobile device used to get results. Can be set to iphone for an iPhone mobile device, or android for an Android mobile device.",
            },
            tablet_type: {
                type: "string",
                description:
                    "Applies when device=tablet and determines the type of tablet device used to get results. Can be set to ipad for an iPad device, or android for an Android tablet device.",
            },
            output: {
                type: "string",
                description:
                    "Determines the format in which results are returned.Can be set to json(default ) to get the results as structured JSON, html to get the raw html retrieved or csvto return the results in CSV format.When using csvyou can also use the csv_fields parameter to specify which fields to return in the CSV.",
            },
            csv_fields: {
                type: "string",
                description:
                    "Determines the fields that are returned when returning in csv mode(i.e.when the output parameter is set to csv).Should be specified as a comma seperated list of fields(in nested field, dot notation, format).For more information on the csv_fieldsparameter please see the CSV Fields Reference.",
            },
            include_html: {
                type: "string",
                description:
                    "Determines whether raw HTML is included in the response(this can increase the size of the response).Can be set to true or false(the default ). Note When adding searches with include_html = true to a Batch the maximum number of searches is lower(100) because including the HTML within the response makes the Batch Result Sets much larger.The limit is in place to ensure Result Set files are of a manageable size.If you have need to run a large number of searches all with include_html = true then simply split the searches across multiple 100-search Batches.",
            },
            skip_on_incident: {
                type: "string",
                description:
                    "Instructs the API to not serve requests when a parsing incident is detected.Valid values are all(where the API will not serve a response if a 'degraded' or 'major' parsing incident is live) and major_only(where the API will not serve a response is a 'major' parsing incident is live, but will if a 'degraded service' parsing incident is live). You can view service status via the status page. Using skip_on_incident can be desirable if your system is making unsupervised requests to the API that you would like to gracefully fail in the event of an incident.",
            },
            hide_base64_images: {
                type: "string",
                description:
                    "Instructs the API to not include Base64 images in the response.Base64 - encoded images from SERP pages can increase the size of the response considerably so sometimes it's desirable to have them excluded from the API response. Note that this parameter is set to hide_base64_images=true by default when using Batches(to minimise the size of the Batch Result Sets).",
            },
            cookie: {
                type: "string",
                description:
                    "The cookie string to send along with the request.Should be URL- encoded.Use this parameter to send custom cookies along with the request made.It will be sent in the cookie HTTP Header made by the platform.",
            },
            include_fields: {
                type: "string",
                description:
                    "A comma- seperated list JSON field names to include in the JSON object the API returns.You can specify the field names in dot notation - i.e.include_fields=pagination will only include the the pagination property in the response JSON.Use include_fields if you only want to include specific fields in the API's JSON response.",
            },
            exclude_fields: {
                type: "string",
                description:
                    "A comma - seperated list of JSON field names to exclude from the JSON object the API returns.You can specify the field names in dot notation - i.e.exclude_fields=pagination will remove the pagination property from the response JSON.Use exclude_fields if there are specific fields you wish to exclude from the API's JSON response.",
            },
        },
        required: ["q"],
    },
};

export const googleNewsSearchFunctionDefinition: FunctionDefinition = {
    name: "google_news_search",
    description:
        "to retrieve news results for a given search term. The search term is specified in the q parameter and the optional location parameter can be used to geo-locate the news request. You can use the time_period request parameter to refine your news search to specific time periods. If you wish to exclude news results where Google have modified the original query set exclude_if_modified=true in your request parameters.",
    parameters: {
        type: "object",
        properties: {
            api_key: {
                type: "string",
                description: "The API key for your Scale SERP account.",
            },
            search_type: {
                type: "string",
                description: "Should be set to search_type=news.",
            },
            q: {
                type: "string",
                description: "The keyword you want to use to perform the News search.",
            },
            location: {
                type: "string",
                description:
                    "Determines the geographic location in which the query is executed. You can enter any location as free-text, but if you choose one of the Scale SERP built-in locations then the google_domain, gland hlparameters are automatically updated to the domain, country and language that match the built-in location (note that this behaviour can be disabled via the location_autoparameter).",
            },
            location_auto: {
                type: "string",
                description:
                    "If the locationfield is set to a Scale SERP built-in location from the Locations API, and location_autois set to true (default) then the google_domain, gland hlparameters are automatically updated to the domain, country and language that match the built-in location. Valid values are true (default) to enable this behaviour or falseto disable.",
            },
            uule: {
                type: "string",
                description:
                    "The Google UULE parameter - use to pass through a custom uule parameter to Google. Scale SERP automatically generates the uule when you use the location parameter but we allow you to overwrite it directly by specifying a uule directly.",
            },
            google_domain: {
                type: "string",
                description:
                    "The Google domain to use to run the search query. View the full list of supported google_domainvalues here. Defaults to google.com.",
            },
            gl: {
                type: "string",
                description:
                    "The gl parameter determines the Google country to use for the query. View the full list of supported glvalues here. Defaults to us.",
            },
            hl: {
                type: "string",
                description:
                    "The hl parameter determines the Google UI language to return results. View the full list of supported hlvalues here. Defaults to en.",
            },
            lr: {
                type: "string",
                description:
                    "The lr parameter limits the results to websites containing the specified language. View the full list of supported lrvalues here.",
            },
            cr: {
                type: "string",
                description:
                    "The cr parameter instructs Google to limit the results to websites in the specified country. View the full list of supported crvalues here.",
            },
            time_period: {
                type: "string",
                description:
                    "Determines the time period of the results shown. It can be set to last_hour, last_day (for the last 24 hours), last_week (for the last 7 days), last_month, last_yearor custom. When using customyou must also specifiy one or both of the time_period_minor time_period_maxparameters to define the custom time period.",
            },
            time_period_min: {
                type: "string",
                description:
                    "Determines the minimum (i.e. 'from') time to use when time_periodis set to custom. Should be in the form MM/DD/YYYY, I.e. for 31st December 2018 time_period_minwould be 12/31/2018.",
            },
            time_period_max: {
                type: "string",
                description:
                    "Determines the maximum (i.e. 'to') time to use when time_periodis set to custom. Should be in the form MM/DD/YYYY, I.e. for 31st December 2018 time_period_maxwould be 12/31/2018.",
            },
            nfpr: {
                type: "string",
                description:
                    "Determines whether to exclude results from auto-corrected queries that were spelt wrong. Can be set to 1to exclude auto-corrected results, or 0 (default) to include them.",
            },
            filter: {
                type: "string",
                description:
                    "Determines if the filters for Similar Resultsand Omitted Resultsare on or off. Can be set to 1 (default) to enable these filters, or 0to disable these filters.",
            },
            safe: {
                type: "string",
                description:
                    "Determines whether Safe Searchis enabled for the results. Can be set to activeto enable Safe Search, or off to disable Safe Search.",
            },
            page: {
                type: "string",
                description:
                    "Determines the page of results to return, defaults to 1. Use in combination with the num parameter to implement pagination.",
            },
            max_page: {
                type: "string",
                description:
                    "Use the max_page parameter to get multiple pages of results in one request. The API will automatically paginate through pages and concatenate the results into one response.",
            },
            num: {
                type: "string",
                description:
                    "Determines the number of results to show per page. Use in combination with the page parameter to implement pagination. The maximum number of news results Google return per request is 100.",
            },
            tbs: {
                type: "string",
                description:
                    "Sets a specific string to be added to the Google tbs parameter in the underlying Google query. The tbs parameter is normally generated automatically by the API, but it can be set explicitly also.",
            },
            sort_by: {
                type: "string",
                description:
                    "Determines how results are sorted, valid values are relevance or date. Note that when sort_by=date the show_duplicates parameter can be used.",
            },
            show_duplicates: {
                type: "string",
                description:
                    "Determines whether duplicates are shown in the news results. Must be used in conjunction with the sort_by parameter where sort_by is set to date. Valid values are true or false. Defaults to false.",
            },
            exclude_if_modified: {
                type: "string",
                description:
                    "Determines whether the news_results returned when Google modifies the original query. Set to true to exclude news_results when Google modifies the original query or false (the default) to include news_results when Google modifies the original query.",
            },
        },
        required: ["q", "search_type"],
    },
};


export const gmailUsersGetProfileFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_get_profile",
    description: "Gets the current user's Gmail profile.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
        },
        required: ["gmailUserId"],
    },
};

export const gmailUsersMessagesAttachmentsGetFunctionDefinition: FunctionDefinition =
{
    name: "gmail_users_messages_attachments_get",
    description: "Gets the specified message attachment.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            messageId: {
                type: "string",
                description: "The ID of the message containing the attachment.",
            },
            id: {
                type: "string",
                description: "The ID of the attachment.",
            },
        },
        required: ["gmailUserId", "messageId", "id"],
    },
};

export const gmailUsersMessagesGetFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_messages_get",
    description: "Gets the specified message.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            format: {
                type: "string",
                description: "The format to return the message in.",
            },
            id: {
                type: "string",
                description:
                    "The ID of the message to retrieve. This ID is usually retrieved using `messages.list`. The ID is also contained in the result when a message is inserted (`messages.insert`) or imported (`messages.import`).",
            },
            metadataHeaders: {
                type: "array",
                items: {
                    type: "string",
                },
                description:
                    "When given and format is `METADATA`, only include headers specified.",
            },
        },
        required: ["gmailUserId", "id"],
    },
};

export const gmailUsersMessagesListFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_messages_list",
    description: "Lists the messages in the user's mailbox.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            includeSpamTrash: {
                type: "boolean",
                description: "Include messages from `SPAM` and `TRASH` in the results.",
            },
            labelIds: {
                type: "array",
                items: {
                    type: "string",
                },
                description:
                    "Only return messages with labels that match all of the specified label IDs. Messages in a thread might have labels that other messages in the same thread don't have. To learn more, see [Manage labels on messages and threads](https://developers.google.com/gmail/api/guides/labels#manage_labels_on_messages_threads).",
            },
            maxResults: {
                type: "number",
                description:
                    "Maximum number of messages to return. This field defaults to 100. The maximum allowed value for this field is 500.",
            },
            pageToken: {
                type: "string",
                description:
                    "Page token to retrieve a specific page of results in the list.",
            },
            q: {
                type: "string;",
                description:
                    "Only return messages matching the specified query. Supports the same query format as the Gmail search box. For example, `from: someuser@example.com rfc822msgid: is:unread`. Parameter cannot be used when accessing the api using the gmail.metadata scope.",
            },
        },
        required: ["gmailUserId"],
    },
};

export const gmailUsersMessagesSendFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_messages_send",
    description:
        "Sends the specified message to the recipients in the To, Cc, and Bcc headers.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            requestBody: {
                type: "object",
                properties: {
                    historyId: {
                        type: "string",
                        description:
                            "The ID of the last history record that modified this message.",
                    },
                    id: {
                        type: "string",
                        description: "The immutable ID of the message.",
                    },
                    internalDate: {
                        type: "string",
                        description:
                            "The internal message creation timestamp (epoch ms), which determines ordering in the inbox. For normal SMTP-received email, this represents the time the message was originally accepted by Google, which is more reliable than the `Date` header. However, for API-migrated mail, it can be configured by client to be based on the `Date` header.",
                    },
                    labelIds: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        description: "List of IDs of labels applied to this message.",
                    },
                    payload: {
                        type: "object",
                        properties: {
                            body: {
                                type: "object",
                                properties: {
                                    attachmentId: {
                                        type: "string",
                                        description:
                                            "When present, contains the ID of an external attachment that can be retrieved in a separate `messages.attachments.get` request. When not present, the entire content of the message part body is contained in the data field.",
                                    },
                                    data: {
                                        type: "string",
                                        description:
                                            "The body data of a MIME message part as a base64url encoded string. May be empty for MIME container types that have no message body or when the body data is sent as a separate attachment. An attachment ID is present if the body data is contained in a separate attachment.",
                                    },
                                    size: {
                                        type: "number",
                                        description:
                                            "Number of bytes for the message part data (encoding notwithstanding).",
                                    },
                                },
                                description:
                                    "The message part body for this part, which may be empty for container MIME message parts.",
                            },
                            filename: {
                                type: "string",
                                description:
                                    "The filename of the attachment. Only present if this message part represents an attachment.",
                            },
                            headers: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: {
                                            type: "string",
                                            description:
                                                "The name of the header before the `:` separator. For example, `To`.",
                                        },
                                        value: {
                                            type: "string",
                                            description:
                                                "The value of the header after the `:` separator. For example, `someuser@example.com`.",
                                        },
                                    },
                                },
                                description:
                                    "List of headers on this message part. For the top-level message part, representing the entire message payload, it will contain the standard RFC 2822 email headers such as `To`, `From`, and `Subject`.",
                            },
                            mimeType: {
                                type: "string",
                                description: "The MIME type of the message part.",
                            },
                            partId: {
                                type: "string",
                                description: "The immutable ID of the message part.",
                            },
                        },
                        description: "The parsed email structure in the message parts.",
                    },
                    raw: {
                        type: "string",
                        description:
                            "The entire email message in an RFC 2822 formatted and base64url encoded string. Returned in `messages.get` and `drafts.get` responses when the `format=RAW` parameter is supplied.",
                    },
                    sizeEstimate: {
                        type: "number",
                        description: "Estimated size in bytes of the message.",
                    },
                    snippet: {
                        type: "string",
                        description: "A short part of the message text.",
                    },
                    threadId: {
                        type: "string",
                        description:
                            "The ID of the thread the message belongs to. To add a message or draft to a thread, the following criteria must be met: 1. The requested `threadId` must be specified on the `Message` or `Draft.Message` you supply with your request. 2. The `References` and `In-Reply-To` headers must be set in compliance with the [RFC 2822](https://tools.ietf.org/html/rfc2822) standard. 3. The `Subject` headers must match.",
                    },
                },
                description: "Request body metadata",
            },
            media: {
                type: "object",
                properties: {
                    mimeType: {
                        type: "string",
                        description: "Media mime-type",
                    },
                    body: {
                        type: "string",
                        description: "Media body contents",
                    },
                },
            },
        },
        required: ["gmailUserId"],
    },
};

export const gmailUsersMessagesTrashFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_messages_trash",
    description: "Moves the specified message to the trash.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            id: {
                type: "string",
                description: "The ID of the message to Trash.",
            },
        },
        required: ["gmailUserId", "id"],
    },
};

export const gmailUsersMessagesUntrashFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_messages_untrash",
    description: "Removes the specified message from the trash.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            id: {
                type: "string",
                description: "The ID of the message to remove from Trash.",
            },
        },
        required: ["gmailUserId", "id"],
    },
};

export const gmailUsersThreadsGetFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_threads_get",
    description: "Gets the specified thread.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            id: {
                type: "string",
                description: "The ID of the thread to retrieve.",
            },
            format: {
                type: "string",
                description: "The format to return the messages in.",
            },
            metadataHeaders: {
                type: "array",
                items: {
                    type: "string",
                },
                description:
                    "When given and format is METADATA, only include headers specified.",
            },
        },
        required: ["gmailUserId", "id"],
    },
};

export const gmailUsersThreadsListFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_threads_list",
    description: "Lists the threads in the user's mailbox.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            includeSpamTrash: {
                type: "boolean",
                description: "Include threads from `SPAM` and `TRASH` in the results.",
            },
            labelIds: {
                type: "array",
                items: {
                    type: "string",
                },
                description:
                    "Only return threads with labels that match all of the specified label IDs.",
            },
            maxResults: {
                type: "number",
                description:
                    "Maximum number of threads to return. This field defaults to 100. The maximum allowed value for this field is 500.",
            },
            pageToken: {
                type: "string",
                description:
                    "Page token to retrieve a specific page of results in the list.",
            },
            q: {
                type: "string",
                description:
                    "Only return threads matching the specified query. Supports the same query format as the Gmail search box. For example, `from:someuser@example.com rfc822msgid: is:unread`. Parameter cannot be used when accessing the api using the gmail.metadata scope.",
            },
        },
        required: ["gmailUserId"],
    },
};

export const gmailUsersThreadsTrashFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_threads_trash",
    description:
        "Moves the specified thread to the trash. Any messages that belong to the thread are also moved to the trash.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            id: {
                type: "string",
                description: "The ID of the thread to Trash.",
            },
        },
        required: ["gmailUserId", "id"],
    },
};

export const gmailUsersThreadsUntrashFunctionDefinition: FunctionDefinition = {
    name: "gmail_users_threads_untrash",
    description:
        "Removes the specified thread from the trash. Any messages that belong to the thread are also removed from the trash.",
    parameters: {
        type: "object",
        properties: {
            gmailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            id: {
                type: "string",
                description: "The ID of the thread to remove from Trash.",
            },
        },
        required: ["gmailUserId", "id"],
    },
};

// Google Calendar
export const googleCalendarCalenderListListFunctionDefinition: FunctionDefinition = {
    name: "google_calendar_calenderlist_list",
    description:
        "Returns the calendars on the user's calendar list.",
    parameters: {
        type: "object",
        properties: {
            maxResults: {
                type: "number",
                description: "Maximum number of entries returned on one result page. By default the value is 100 entries. The page size can never be larger than 250 entries. Optional.",
            },
            minAccessRole: {
                type: "string",
                description: "The minimum access role for the user in the returned entries. Optional. The default is no restriction.",
            },
            pageToken: {
                type: "string",
                description: "Token specifying which result page to return. Optional.",
            },
            showDeleted: {
                type: "boolean",
                description: "Whether to include deleted calendar list entries in the result. Optional. The default is False.",
            },
            showHidden: {
                type: "boolean",
                description: "Whether to show hidden entries. Optional. The default is False.",
            },
            syncToken: {
                type: "string",
                description: "Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then. If only read-only fields such as calendar properties or ACLs have changed, the entry won't be returned. All entries deleted and hidden since the previous list request will always be in the result set and it is not allowed to set showDeleted neither showHidden to False. To ensure client state consistency minAccessRole query parameter cannot be specified together with nextSyncToken. If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken. Learn more about incremental synchronization. Optional. The default is to return all entries."
            },
        },
        required: [],
    },
};

export const googleCalendarEventsDeleteFunctionDefinition: FunctionDefinition = {
    name: "google_calendar_events_delete",
    description:
        "Deletes an event.",
    parameters: {
        type: "object",
        properties: {
            calendarId: {
                type: "string",
                description: "Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the 'primary' keyword."
            },
            eventId: {
                type: "string",
                description: "Event identifier."
            },
            sendUpdates: {
                type: "string",
                description: "Guests who should receive notifications about the deletion of the event."
            }

        },
        required: [],
    },
};

export const googleCalendarEventsGetFunctionDefinition: FunctionDefinition = {
    name: "google_calendar_events_get",
    description:
        "Returns an event based on its Google Calendar ID. To retrieve an event using its iCalendar ID, call the events.list method using the iCalUID parameter.",
    parameters: {
        type: "object",
        properties: {
            calendarId: {
                type: "string",
                description:
                    "Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the 'primary' keyword.",
            },
            eventId: {
                type: "string",
                description: "Event identifier.",
            },
            maxAttendees: {
                type: "number",
                description:
                    "The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.",
            },
            timeZone: {
                type: "string",
                description:
                    "Time zone used in the response. Optional. The default is the time zone of the calendar.",
            },
        },
        required: [],
    },
};

// NOTE: Generated using AI, all properties may not defined in the function definition
export const gCalEventsInsertFunctionDefinition: FunctionDefinition = {
    name: "google_calendar_events_insert",
    description:
        "Adds an event to a given calendar. This operation creates an event based on the parameters you provide, and returns the created event.",
    parameters: {
        type: "object",
        properties: {
            calendarId: {
                type: "string",
                description:
                    "Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the 'primary' keyword.",
            },
            resource: {
                type: "object",
                description: "Details about the event to insert.",
                properties: {
                    summary: {
                        type: "string",
                        description: "Title of the event.",
                    },
                    location: {
                        type: "string",
                        description: "Geographical location where the event is taking place.",
                    },
                    description: {
                        type: "string",
                        description: "More detailed description of the event.",
                    },
                    start: {
                        type: "object",
                        description: "The start time of the event.",
                        properties: {
                            dateTime: {
                                type: "string",
                                description: "The start time of the event, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
                            },
                            timeZone: {
                                type: "string",
                                description: "Time zone of the start date as per IANA Time Zone Database (e.g., 'America/Los_Angeles').",
                            },
                        },
                        required: ["dateTime", "timeZone"],
                    },
                    end: {
                        type: "object",
                        description: "The end time of the event.",
                        properties: {
                            dateTime: {
                                type: "string",
                                description: "The end time of the event, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
                            },
                            timeZone: {
                                type: "string",
                                description: "Time zone of the end date as per IANA Time Zone Database (e.g., 'America/Los_Angeles').",
                            },
                        },
                        required: ["dateTime", "timeZone"],
                    },
                    attendees: {
                        type: "array",
                        description: "The attendees of the event.",
                        items: {
                            type: "object",
                            properties: {
                                email: {
                                    type: "string",
                                    description: "Email address of the attendee.",
                                },
                                optional: {
                                    type: "boolean",
                                    description: "Whether this attendee is optional. Optional. The default is False.",
                                },
                                // other attendee properties here
                            },
                        },
                    },
                    // other event properties here
                },
                required: ["summary", "start", "end"],
            },
        },
        required: ["calendarId", "resource"],
    },
};

export const gCalEventsListFunctionDefinition: FunctionDefinition = {
    name: "google_calendar_events_list",
    description: "Returns events on the specified calendar.",
    parameters: {
        type: "object",
        properties: {
            calendarId: {
                type: "string",
                description:
                    "Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the 'primary' keyword.",
            },
            eventTypes: {
                type: "array",
                items: {
                    type: "string",
                },
                description:
                    "Event types to return. Optional. This parameter can be repeated multiple times to return events of different types. The default is ['default', 'focusTime', 'outOfOffice'].",
            },
            iCalUID: {
                type: "string",
                description:
                    "Specifies an event ID in the iCalendar format to be provided in the response. Optional. Use this if you want to search for an event by its iCalendar ID.",
            },
            maxAttendees: {
                type: "number",
                description:
                    "The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.",
            },
            maxResults: {
                type: "number",
                description:
                    "Maximum number of events returned on one result page. The number of events in the resulting page may be less than this value, or none at all, even if there are more events matching the query. Incomplete pages can be detected by a non-empty nextPageToken field in the response. By default the value is 250 events. The page size can never be larger than 2500 events. Optional.",
            },
            orderBy: {
                type: "string",
                description:
                    "The order of the events returned in the result. Optional. The default is an unspecified, stable order.",
            },
            pageToken: {
                type: "string",
                description: "Token specifying which result page to return. Optional.",
            },
            privateExtendedProperty: {
                type: "array",
                items: {
                    type: "string",
                },
                description:
                    "Extended properties constraint specified as propertyName=value. Matches only private properties. This parameter might be repeated multiple times to return events that match all given constraints.",
            },
            q: {
                type: "string",
                description: `Free text search terms to find events that match these terms in the following fields:
             - summary
             - description
             - location
             - attendee's displayName
             - attendee's email
             - organizer's displayName
             - organizer's email
             - workingLocationProperties.officeLocation.buildingId
             - workingLocationProperties.officeLocation.deskId
             - workingLocationProperties.officeLocation.label
             - workingLocationProperties.customLocation.label
             These search terms also match predefined keywords against all display title translations of working location, out-of-office, and focus-time events. For example, searching for "Office" or "Bureau" returns working location events of type officeLocation, whereas searching for "Out of office" or "Abwesend" returns out-of-office events. Optional.
        `,
            },
            sharedExtendedProperty: {
                type: "array",
                items: {
                    type: "string",
                },
                description:
                    "Extended properties constraint specified as propertyName=value. Matches only shared properties. This parameter might be repeated multiple times to return events that match all given constraints.",
            },
            showDeleted: {
                type: "boolean",
                description:
                    "Whether to include deleted events (with status equals 'cancelled') in the result. Cancelled instances of recurring events (but not the underlying recurring event) will still be included if showDeleted and singleEvents are both False. If showDeleted and singleEvents are both True, only single instances of deleted events (but not the underlying recurring events) are returned. Optional. The default is False.",
            },
            showHiddenInvitations: {
                type: "boolean",
                description:
                    "Whether to include hidden invitations in the result. Optional. The default is False.",
            },
            singleEvents: {
                type: "boolean",
                description:
                    "Whether to expand recurring events into instances and only return single one-off events and instances of recurring events, but not the underlying recurring events themselves. Optional. The default is False.",
            },

            syncToken: {
                type: "string",
                description: `Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then. All events deleted since the previous list request will always be in the result set and it is not allowed to set showDeleted to False. There are several query parameters that cannot be specified together with nextSyncToken to ensure consistency of the client state.These are:
             - iCalUID
             - orderBy
             - privateExtendedProperty
             - q
             - sharedExtendedProperty
             - timeMin
             - timeMax
             - updatedMin All other query parameters should be the same as for the initial synchronization to avoid undefined behavior. If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken.
             Learn more about incremental synchronization.
             Optional. The default is to return all entries.
        `,
            },
            timeMax: {
                type: "string",
                description:
                    "Upper bound (exclusive) for an event's start time to filter by. Optional. The default is not to filter by start time. Must be an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. Milliseconds may be provided but are ignored. If timeMin is set, timeMax must be greater than timeMin.",
            },
            timeMin: {
                type: "string",
                description:
                    "Lower bound (exclusive) for an event's end time to filter by. Optional. The default is not to filter by end time. Must be an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. Milliseconds may be provided but are ignored. If timeMax is set, timeMin must be smaller than timeMax.",
            },
            timeZone: {
                type: "string",
                description:
                    "Time zone used in the response. Optional. The default is the time zone of the calendar.",
            },
            updatedMin: {
                type: "string",
                description:
                    "Lower bound for an event's last modification time (as a RFC3339 timestamp) to filter by. When specified, entries deleted since this time will always be included regardless of showDeleted. Optional. The default is not to filter by last modification time.",
            },
        },
        required: [],
    },
};

// NOTE: Generated using AI, not all properties are defined in the function definition
export const googleCalendarEventsUpdateFunctionDefinition: FunctionDefinition = {
    name: "google_calendar_events_update",
    description:
        "Updates an event. This operation updates an event with the parameters you provide. Note: you must provide all the properties of the event.",
    parameters: {
        type: "object",
        properties: {
            calendarId: {
                type: "string",
                description:
                    "Calendar identifier. To retrieve calendar IDs, call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the 'primary' keyword."
            },
            eventId: {
                type: "string",
                description: "Event identifier."
            },
            resource: {
                type: "object",
                description: "Details about the event to update.",
                properties: {
                    summary: {
                        type: "string",
                        description: "Title of the event."
                    },
                    location: {
                        type: "string",
                        description: "Geographical location where the event is taking place."
                    },
                    description: {
                        type: "string",
                        description: "More detailed description of the event."
                    },
                    start: {
                        type: "object",
                        description: "The start time of the event."
                    },
                    end: {
                        type: "object",
                        description: "The end time of the event."
                    },
                    attendees: {
                        type: "array",
                        description: "The attendees of the event.",
                        items: {
                            type: "object",
                            properties: {
                                email: {
                                    type: "string",
                                    description: "Email address of the attendee."
                                },
                                responseStatus: {
                                    type: "string",
                                    description: "The attendance status of the attendee. The possible values are: 'needsAction', 'declined', 'tentative', or 'accepted'."
                                }
                            }
                        },
                    },
                    reminders: {
                        type: "object",
                        description: "The reminders for the event."
                    },
                    // other event properties here
                },
                required: ["summary", "start", "end"],
            },
            sendUpdates: {
                type: "string",
                description:
                    "Whether to send notifications about the event update (for example, email or push notifications). The possible values are: 'all', 'externalOnly', 'none'.",
            },
        },
        required: ["calendarId", "eventId", "resource"],
    },
};

export const openAIThreadsCreateFunctionDefinition: FunctionDefinition = {
    name: "openai_threads_create",
    description:
        "Creates a new thread for conversation. This operation allows users to start a new conversation thread, optionally including initial messages.",
    parameters: {
        type: "object",
        properties: {
            messages: {
                type: "array",
                description: "Optional list of messages to start the thread with.",
                items: {
                    type: "object",
                    properties: {
                        content: {
                            type: "string",
                            description: "The textual content of the message.",
                        },
                        role: {
                            type: "string",
                            description:
                                "The role of the entity creating the message. Currently, only 'user' is supported.",
                            enum: ["user"],
                        },
                        file_ids: {
                            type: "array",
                            description:
                                "List of File IDs that the message should include. A maximum of 10 files can be attached.",
                            items: {
                                type: "string",
                            },
                            optional: true,
                        },
                        metadata: {
                            type: "object",
                            description:
                                "Set of 16 key-value pairs for storing additional structured information. Keys up to 64 characters, values up to 512 characters.",
                            optional: true,
                        },
                    },
                    required: ["content", "role"],
                },
                optional: true,
            },
            metadata: {
                type: "object",
                description:
                    "Set of 16 key-value pairs for storing additional structured information. Keys up to 64 characters, values up to 512 characters.",
                optional: true,
            },
        },
        required: [],
    },
};

export const openAIThreadsMessagesCreateFunctionDefinition: FunctionDefinition =
{
    name: "openai_threads_messages_create",
    description:
        "Creates a new message within a specific thread. This operation allows users to add content to a conversation thread, potentially utilizing files for added context or functionality.",
    parameters: {
        type: "object",
        properties: {
            threadId: {
                type: "string",
                description:
                    "Identifier for the conversation thread where the message will be posted.",
            },
            body: {
                type: "object",
                description: "Parameters for creating the message.",
                properties: {
                    content: {
                        type: "string",
                        description: "The textual content of the message.",
                    },
                    role: {
                        type: "string",
                        description:
                            "The role of the entity creating the message. Currently, only 'user' is supported.",
                        enum: ["user"], // Assuming 'user' is the only supported role as per the example.
                    },
                    file_ids: {
                        type: "array",
                        description:
                            "List of File IDs that the message should include. A maximum of 10 files can be attached.",
                        items: {
                            type: "string",
                        },
                        optional: true,
                    },
                    metadata: {
                        type: "object",
                        description:
                            "Set of 16 key-value pairs for storing additional structured information. Keys up to 64 characters, values up to 512 characters.",
                        optional: true,
                    },
                },
                required: ["content", "role"],
            },
        },
        required: ["threadId", "body"],
    },
};

export const openAIThreadsRunsCreateFunctionDefinition: FunctionDefinition = {
    name: "openai_threads_runs_create",
    description:
        "Initiates a new run within a specific thread using an assistant. This allows for executing commands or processes based on the assistant's capabilities, potentially modifying behavior with additional instructions or models for the specific run.",
    parameters: {
        type: "object",
        properties: {
            threadId: {
                type: "string",
                description:
                    "Identifier for the thread where the run will be executed.",
            },
            body: {
                type: "object",
                description: "Parameters for creating the run.",
                properties: {
                    assistant_id: {
                        type: "string",
                        description:
                            "The ID of the assistant to use for executing this run.",
                    },
                    additional_instructions: {
                        type: "string",
                        description:
                            "Additional instructions to append at the end of the assistant’s instructions for this specific run.",
                        optional: true,
                    },
                    instructions: {
                        type: "string",
                        description:
                            "Overrides the default instructions of the assistant for this run.",
                        optional: true,
                    },
                    metadata: {
                        type: "object",
                        description:
                            "Set of 16 key-value pairs for storing additional, structured information about the run.",
                        optional: true,
                    },
                    model: {
                        type: "string",
                        description:
                            "ID of the Model to use for this run. Overrides the assistant’s default model if provided.",
                        optional: true,
                    },
                    tools: {
                        type: "array",
                        description:
                            "Overrides the tools the assistant can use for this run.",
                        items: {
                            type: "string", // Assuming tools are identified by strings. This might need adjusting based on the actual structure of `RunCreateParams.AssistantTools...`.
                        },
                        optional: true,
                    },
                },
                required: ["assistant_id"],
            },
        },
        required: ["threadId", "body"],
    },
};

export const openAIThreadRunRetrieveFunctionDefinition: FunctionDefinition = {
    name: "openai_threads_runs_retrieve",
    description:
        "Retrieves details of a specific run within a thread by using the run's identifier and the thread's identifier.",
    parameters: {
        type: "object",
        properties: {
            threadId: {
                type: "string",
                description:
                    "The unique identifier of the thread containing the target run.",
            },
            runId: {
                type: "string",
                description:
                    "The unique identifier of the run to retrieve details for.",
            },
        },
        required: ["threadId", "runId"],
    },
};

export const linkedInCreateShareFunctionDefinition: FunctionDefinition = {
    name: "linkedin_create_share",
    description: "Creates a share on LinkedIn using the UGC API.",
    parameters: {
        type: "object",
        properties: {
            shareCommentary: {
                type: "string",
                description: "The primary content for the share.",
            },
            shareMediaCategory: {
                type: "string",
                description: "Represents the media assets attached to the share.",
                enum: ["NONE", "ARTICLE", "IMAGE"],
            },
            originalUrl: {
                type: "string",
                description: "The URL of the article or image to be shared.",
            },
            title: {
                type: "string",
                description: "The title of the article or image.",
            },
            description: {
                type: "string",
                description: "A short description for the image or article.",
            },
            visibility: {
                type: "string",
                description: "Visibility restrictions for the share.",
                enum: ["CONNECTIONS", "PUBLIC"],
            },
        },
        required: ["shareCommentary", "shareMediaCategory", "visibility"],
    },
};

export const apifyAdvancedLinkedInJobScraperFunctionDefinition: FunctionDefinition =
{
    name: "apify_advanced_linkedin_job_scraper",
    description:
        "Scrapes job data from LinkedIn using advanced search parameters.",
    parameters: {
        type: "object",
        properties: {
            searchUrl: {
                type: "string",
                description:
                    "The URL of the LinkedIn jobs search page with filters applied.",
            },
            scrapeCompany: {
                type: "boolean",
                description:
                    "Whether to scrape the company page which posted the job.",
            },
            startPage: {
                type: "integer",
                description: "Page number to start scraping.",
            },
            count: {
                type: "integer",
                description:
                    "Total number of records required. Leave empty to scrape all items.",
            },
            cookies: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "LinkedIn cookies used for authorization.",
            },
            scrapeJobDetails: {
                type: "boolean",
                description: "Whether to scrape hiring team and salary info.",
            },
            scrapeSkills: {
                type: "boolean",
                description: "Whether to scrape skills requirements.",
            },
            minDelay: {
                type: "integer",
                description:
                    "Minimum duration in seconds to wait before scraping next page.",
            },
            maxDelay: {
                type: "integer",
                description:
                    "Maximum duration in seconds to wait before scraping next page.",
            },
        },
        required: ["searchUrl"],
    },
};

export const klapCreateVideo: FunctionDefinition = {
    name: "klap_create_video",
    description: "Turn videos into viral shorts. Get ready-to-publish TikToks, Reels, Shorts from YouTube videos in a click",
    parameters: {
        type: "object",
        properties: {
            source_video_url: {
                type: "string",
                description: "URL of the source video (Youtube link or video file URL)",
            },
            language: {
                type: "string",
                description: "Language code (e.g., 'en' for English)",
            },
            min_duration: {
                type: "number",
                description:
                    "Minimum duration of the shorts in seconds (1 to 120. Default to 1)",
                default: 1,
            },
            max_duration: {
                type: "number",
                description:
                    "Maximum duration of the shorts in seconds (1 to 120. Default to 120)",
                default: 120,
            },
            target_duration: {
                type: "number",
                description:
                    "Target duration of the shorts in seconds (between min and max. Default to 60)",
                default: 60,
            },
        },
        required: ["source_video_url", "language"],
    },
};

export const klapCreateVideoClipsFunctionDefinition: FunctionDefinition = {
    name: "klap_create_video_clips",
    description: "Turn text into viral clips using klap service",
    parameters: {
        type: "object",
        properties: {
            source_video_url: {
                type: "string",
                description: "URL of the source video (Youtube link or video file URL)",
            },
            language: {
                type: "string",
                description: "Language code (e.g., 'en' for English)",
            },
            min_duration: {
                type: "number",
                description:
                    "Minimum duration of the shorts in seconds (1 to 120. Default to 1)",
                default: 1,
            },
            max_duration: {
                type: "number",
                description:
                    "Maximum duration of the shorts in seconds (1 to 120. Default to 120)",
                default: 120,
            },
            target_duration: {
                type: "number",
                description:
                    "Target duration of the shorts in seconds (between min and max. Default to 60)",
                default: 60,
            },
        },
        required: ["source_video_url", "language"],
    },
};

export const klap_create_video_from_clip: FunctionDefinition = {
    name: "klap_create_video_from_clip",
    description: "Create a video from a clip.",
    parameters: {
        type: "object",
        properties: {
            clipId: {
                type: "string",
                description: "The ID of the clip to create the video from.",
            },
            videoId: {
                type: "string",
                description: "The ID of the video",
            },
        },
        required: ["clipId", "videoId"],
    },
};

export const brevo_email_campaigns_get_email_campaigns: FunctionDefinition = {
    name: "brevo_email_campaigns_get_email_campaigns",
    description:
        "Retrieve email campaigns from Brevo. Return all your created email campaigns",
    parameters: {
        type: "object",
        properties: {
            type: {
                type: "string",
                enum: ["classic", "trigger"],
                description: "Type of email campaign (classic or trigger).",
            },
            status: {
                type: "string",
                enum: ["suspended", "archive", "sent", "queued", "draft", "inProcess"],
                description: "Status of the email campaign.",
            },
            statistics: {
                type: "string",
                enum: ["globalStats", "linksStats", "statsByDomain"],
                description: "Type of statistics to include with the campaigns.",
            },
            startDate: {
                type: "string",
                description: "Start date for filtering campaigns by date.",
            },
            endDate: {
                type: "string",
                description: "End date for filtering campaigns by date.",
            },
            limit: {
                type: "number",
                description: "Maximum number of campaigns to retrieve.",
            },
            offset: {
                type: "number",
                description: "Offset for pagination.",
            },
            sort: {
                type: "string",
                enum: ["asc", "desc"],
                description: "Sorting order for the campaigns.",
            },
            excludeHtmlContent: {
                type: "boolean",
                description: "Whether to exclude HTML content from the response.",
            },
        },
    },
};

export const brevo_email_campaigns_create_email_campaign: FunctionDefinition = {
    name: "brevo_email_campaigns_create_email_campaign",
    description: "Create an email campaign",
    parameters: {
        type: "object",
        properties: {
            emailCampaigns: {
                type: "object",
                properties: {
                    tag: { type: "string" },
                    sender: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string" },
                        },
                        required: ["name", "email"],
                    },
                    name: { type: "string" },
                    htmlUrl: { type: "string" },
                    htmlContent: { type: "string" },
                    templateId: { type: "number" },
                    scheduledAt: { type: "string" },
                    subject: { type: "string" },
                    replyTo: { type: "string" },
                    toField: { type: "string" },
                    recipients: {
                        type: "object",
                        properties: {
                            exclusionListIds: { type: "array", items: { type: "number" } },
                            listIds: { type: "array", items: { type: "number" } },
                            segmentIds: { type: "array", items: { type: "number" } },
                        },
                    },
                    attachmentUrl: { type: "string" },
                    inlineImageActivation: { type: "boolean" },
                    mirrorActive: { type: "boolean" },
                    footer: { type: "string" },
                    header: { type: "string" },
                    utmCampaign: { type: "string" },
                    params: { type: "object" },
                },
                required: ["sender", "name"],
                anyOf: [
                    { required: ["htmlUrl"] },
                    { required: ["htmlContent"] },
                    { required: ["templateId"] },
                ],
            },
        },
        required: ["emailCampaigns"],
    },
};

export const brevo_email_campaigns_send_email_campaign_now: FunctionDefinition =
{
    name: "brevo_email_campaigns_send_email_campaign_now",
    description: "Send an email campaign immediately, based on campaignId",
    parameters: {
        type: "object",
        properties: {
            campaignId: {
                type: "number",
                description: "The ID of the email campaign to send immediately.",
            },
        },
        required: ["campaignId"],
    },
};
export const brevo_transactional_emails_send_transac_email: FunctionDefinition = {
    name: "brevo_transactional_emails_send_transac_email",
    description: "Send a transactional email.",
    parameters: {
        type: "object",
        properties: {
            sendSmtpEmail: {
                type: "object",
                properties: {
                    sender: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string" },
                            id: { type: "number" }
                        }
                    },
                    to: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                email: { type: "string" },
                                name: { type: "string" }
                            },
                            required: ["email"]
                        }
                    },
                    bcc: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                email: { type: "string" },
                                name: { type: "string" }
                            },
                            required: ["email"]
                        }
                    },
                    cc: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                email: { type: "string" },
                                name: { type: "string" }
                            },
                            required: ["email"]
                        }
                    },
                    htmlContent: { type: "string" },
                    textContent: { type: "string" },
                    subject: { type: "string" },
                    replyTo: {
                        type: "object",
                        properties: {
                            email: { type: "string" },
                            name: { type: "string" }
                        }
                    },
                    attachment: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                url: { type: "string" },
                                content: { type: "string" },
                                name: { type: "string" }
                            }
                        }
                    },
                    headers: { type: "object" },
                    templateId: { type: "number" },
                    params: { type: "object" },
                    messageVersions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                to: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            email: { type: "string" },
                                            name: { type: "string" }
                                        },
                                        required: ["email"]
                                    }
                                },
                                params: { type: "object" },
                                bcc: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            email: { type: "string" },
                                            name: { type: "string" }
                                        },
                                        required: ["email"]
                                    }
                                },
                                cc: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            email: { type: "string" },
                                            name: { type: "string" }
                                        },
                                        required: ["email"]
                                    }
                                },
                                replyTo: {
                                    type: "object",
                                    properties: {
                                        email: { type: "string" },
                                        name: { type: "string" }
                                    }
                                },
                                subject: { type: "string" },
                                htmlContent: { type: "string" },
                                textContent: { type: "string" }
                            }
                        }
                    },
                    tags: { type: "array", items: { type: "string" } },
                    scheduledAt: { type: "string" },
                    batchId: { type: "string" }
                },
                required: ["sender", "to", "subject"]
            }
        },
        required: ["sendSmtpEmail"],
    }
};

/**
 * @param mediumCreatePostFunctionDefinition type @FunctionDefinition
 * @function Create a new post with specified title, content, and optional parameters such as tags, publish status, and license.
 * @description The post can be in HTML or Markdown format.
 * @param title type @string - The title of the post. Note that this title is used for SEO and when rendering the post as a listing, but will not appear in the actual post—for that, the title must be specified in the content field as well. Titles longer than 100 characters will be ignored. In that case, a title will be synthesized from the first content in the post when it is published.
 * @param contentFormat type @string - The format of the 'content' field. There are two valid values, 'html', and 'markdown'.
 * @param content type @string - The body of the post, in a valid, semantic, HTML fragment, or Markdown. Further markups may be supported in the future. For a full list of accepted HTML tags, see here. If you want your title to appear on the post page, you must also include it as part of the post content.
 * @param tags type @array - Tags to classify the post. Only the first three will be used. Tags longer than 25 characters will be ignored.
 * @param canonicalUrl type @string - The original home of this content, if it was originally published elsewhere.
 * @param publishStatus type @string - The status of the post. Valid values are 'public', 'draft', or 'unlisted'. The default is 'public'.
 * @param license type @string - The license of the post. Valid values are 'all-rights-reserved', 'cc-40-by', 'cc-40-by-sa', 'cc-40-by-nd', 'cc-40-by-nc', 'cc-40-by-nc-nd', 'cc-40-by-nc-sa', 'cc-40-zero', 'public-domain'. The default is 'all-rights-reserved'.
 * @param notifyFollowers type @boolean - Whether to notify followers that the user has published.
 * @function Get High Important Messages from Mail box
 */
export const mediumCreatePostFunctionDefinition: FunctionDefinition = {
    name: "medium_create_share",
    description: "Create a new post with the specified title, content, and optional parameters such as tags, publish status, and license. The post can be in HTML or Markdown format.",
    parameters: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "The title of the post. Note that this title is used for SEO and when rendering the post as a listing, but will not appear in the actual post—for that, the title must be specified in the content field as well. Titles longer than 100 characters will be ignored. In that case, a title will be synthesized from the first content in the post when it is published."
            },
            contentFormat: {
                type: "string",
                description: "The format of the 'content' field. There are two valid values, 'html', and 'markdown'."
            },
            content: {
                type: "string",
                description: "The body of the post, in a valid, semantic, HTML fragment, or Markdown. Further markups may be supported in the future. For a full list of accepted HTML tags, see here. If you want your title to appear on the post page, you must also include it as part of the post content."
            },
            tags: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "Tags to classify the post. Only the first three will be used. Tags longer than 25 characters will be ignored."
            },
            canonicalUrl: {
                type: "string",
                description: "The original home of this content, if it was originally published elsewhere."
            },
            publishStatus: {
                type: "string",
                enum: ["public", "draft", "unlisted"],
                description: "The status of the post. Valid values are 'public', 'draft', or 'unlisted'. The default is 'public'."
            },
            license: {
                type: "string",
                enum: ["all-rights-reserved", "cc-40-by", "cc-40-by-sa", "cc-40-by-nd", "cc-40-by-nc", "cc-40-by-nc-nd", "cc-40-by-nc-sa", "cc-40-zero", "public-domain"],
                description: "The license of the post. Valid values are 'all-rights-reserved', 'cc-40-by', 'cc-40-by-sa', 'cc-40-by-nd', 'cc-40-by-nc', 'cc-40-by-nc-nd', 'cc-40-by-nc-sa', 'cc-40-zero', 'public-domain'. The default is 'all-rights-reserved'."
            },
            notifyFollowers: {
                type: "boolean",
                description: "Whether to notify followers that the user has published."
            }
        },
        required: ["title", "contentFormat", "content"]
    }
};


/**
 * @param outlookMailUserId type @string
 * @function Get High Important Messages from Mail box
 */

export const outlookMailUsersHighMessagesFunctionDefinition: FunctionDefinition = {
    name: "outlookmail_users_high_important_messages_get",
    description:
        "Get high important message from outlook mail box",
    parameters: {
        type: "object",
        properties: {
            outlookMailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            }
        },
        required: []
    }
};

/**
 * @param outlookMailUserId type @string
 * @function Get Owner Mails from an address
 */
export const outlookMailUsersMessagesFromAddressFunctionDefinition: FunctionDefinition = {
    name: "outlookmail_users_messages_byaddress_get",
    description:
        " Get messages received from other's mail.",
    parameters: {
        type: "object",
        properties: {
            usermail: {
                type: "string",
                description:
                    "The other's email address. Get messages received from other's mail.",
            }
        },
        required: []
    }
}

/**
 * @param outlookMailUserId type @string
 * @param search type @string
 * @function Search Messages thas has keyword
 */
export const outlookMailUsersMessageSearchFunctionDefinition: FunctionDefinition = {
    name: "outlookmail_users_messages_search",
    description:
        "Search message with the specific text",
    parameters: {
        type: "object",
        properties: {
            search: {
                type: "string",
                description:
                    "Search Query to get special messages containing the text",
            }
        },
        required: []
    }
}

/**
 * @param outlookMailUserId type @string
 * @param subject type @string
 * @param body type @string
 * @param toRecipients type @array
 * @param ccRecipients type @array
 * @param toRecipients type @array
 * @param attachment type   @byte
 * @function Send an message
 */
export const outlookMailUsersMessagesSendFunctionDefinition: FunctionDefinition = {
    name: "outlookmail_users_messages_send",
    description:
        "Sends the specified message to the recipients in the To, Cc, and Bcc headers.",
    parameters: {
        type: "object",
        properties: {
            outlookMailUserId: {
                type: "string",
                description:
                    "The user's email address. The special value me can be used to indicate the authenticated user.",
            },
            message: {
                type: "object",
                properties: {
                    subject: {
                        type: "string",
                        description: "The subject line of the email.",
                    },
                    body: {
                        type: "object",
                        properties: {
                            content: "string"
                        },
                        description:
                            "The content of the email body.  Use 'HTML' for HTML emails or 'Text' for plain text.",
                    },

                    toRecipients: {
                        type: "array",
                        properties: {
                            emailAddress: {
                                type: "object",
                                properties: {
                                    content:"string"
                                },
                                description:
                                    "The content of the email body.  Use 'HTML' for HTML emails or 'Text' for plain text.",
                            },
                           
                            toRecipients: {
                                type: "array",
                                properties: {
                                    emailAddress: {
                                            type: "object",
                                            properties:{
                                                address:{
                                                    type:"string",
                                                }
                                            },
                                    },
                                },
                                description:
                                    "Recipients: The recipient email objects to whom the email will be sent.",
                            },
                            ccRecipients: {
                                type: "array",
                                properties: {
                                    emailAddress: {
                                            type: "object",
                                            properties:{
                                                address:{
                                                    type:"string",
                                                }
                                            },
                                    },
                                    address: {
                                        type: "string",
                                    }
                                },
                            },
                        },
                        description:
                            "Recipients: addressThe recipient email objects to whom the email will be sent.",
                    },
                    ccRecipients: {
                        type: "array",
                        properties: {
                            emailAddress: {
                                type: "object",
                                properties: {
                                    address: {
                                        type: "string",
                                    }
                                },
                            },
                        },
                        description:
                            "The recipient email objects who will receive a carbon copy of the email.",
                    },
                    bccRecipients: {
                        type: "array",
                        properties: {
                            emailAddress: {
                                type: "object",
                                properties: {
                                    address: {
                                        type: "string",
                                    }
                                },
                            },
                        },
                        description:
                            "The recipient email objects who will receive a blind carbon copy of the email.",
                    },
                    attachments: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description:
                                    "The attachment file name"
                            },
                        },
                        description:
                            "The attachment objects that you want to include in your email.",
                    },
                    mimeType: {
                        type: "string",
                        description: "The MIME type of the message part.",
                    },
                },
                description: "The parsed email structure in the message parts.",
            },
            raw: {
                type: "string",
                description:
                    "The entire email message in an RFC 2822 formatted and base64url encoded string. Returned in `messages.get` and `drafts.get` responses when the `format=RAW` parameter is supplied.",
            },
            sizeEstimate: {
                type: "number",
                description: "Estimated size in bytes of the message.",
            },
            snippet: {
                type: "string",
                description: "A short part of the message text.",
            },
            threadId: {
                type: "string",
                description:
                    "The ID of the thread the message belongs to. To add a message or draft to a thread, the following criteria must be met: 1. The requested `threadId` must be specified on the `Message` or `Draft.Message` you supply with your request. 2. The `References` and `In-Reply-To` headers must be set in compliance with the [RFC 2822](https://tools.ietf.org/html/rfc2822) standard. 3. The `Subject` headers must match.",
            },
            description: "Request body metadata",
        },
        media: {
            type: "object",
            properties: {
                mimeType: {
                    type: "string",
                    description: "Media mime-type",
                },
                body: {
                    type: "string",
                    description: "Media body contents",
                },
            },
        },
        required: ["outlookMailUserId"],
    }
};

/**
 * @param direct_message_deep_link type @string - Tweets a link directly to a Direct Message conversation with an account.
 * @param for_super_followers_only type @boolean - Allows you to Tweet exclusively for Super Followers.
 * @param geo type @object - Place ID being attached to the Tweet for geo location.
 * @param media type @object - A list of Media IDs being attached to the Tweet and a list of User IDs being tagged in the Tweet with Media.
 * @param poll type @object - Duration of the poll in minutes for a Tweet with a poll and a list of poll options for a Tweet with a poll.
 * @param quote_tweet_id type @string - Link to the Tweet being quoted.
 * @param reply type @object - A list of User IDs to be excluded from the reply Tweet and Tweet ID of the Tweet being replied to.
 * @param reply_settings type @string - Settings to indicate who can reply to the Tweet.
 * @param text type @string - Text of the Tweet being created.
 * @function Create a tweet.
 */
export const twitterCreateTweetFunctionDefinition: FunctionDefinition = {
    name: "twitter_create_tweet",
    description: "Parameters for creating a tweet.",
    parameters: {
        type: "object",
        properties: {
            direct_message_deep_link: {
                type: "string",
                description: "Tweets a link directly to a Direct Message conversation with an account."
            },
            for_super_followers_only: {
                type: "boolean",
                description: "Allows you to Tweet exclusively for Super Followers."
            },
            geo: {
                type: "object",
                properties: {
                    place_id: {
                        type: "string",
                        description: "Place ID being attached to the Tweet for geo location."
                    }
                }
            },
            media: {
                type: "object",
                properties: {
                    media_ids: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        description: "A list of Media IDs being attached to the Tweet."
                    },
                    tagged_user_ids: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        description: "A list of User IDs being tagged in the Tweet with Media."
                    }
                }
            },
            poll: {
                type: "object",
                properties: {
                    duration_minutes: {
                        type: "number",
                        description: "Duration of the poll in minutes for a Tweet with a poll."
                    },
                    options: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        description: "A list of poll options for a Tweet with a poll."
                    }
                }
            },
            quote_tweet_id: {
                type: "string",
                description: "Link to the Tweet being quoted."
            },
            reply: {
                type: "object",
                properties: {
                    exclude_reply_user_ids: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        description: "A list of User IDs to be excluded from the reply Tweet."
                    },
                    in_reply_to_tweet_id: {
                        type: "string",
                        description: "Tweet ID of the Tweet being replied to."
                    }
                }
            },
            reply_settings: {
                type: "string",
                description: "Settings to indicate who can reply to the Tweet."
            },
            text: {
                type: "string",
                description: "Text of the Tweet being created."
            }
        }
    }
};



/**
 * @param startdatetime type @string
 * @param enddatetime type @string
 * @function my events for the next week
 * @method POST
 */
export const outlookMailUsersEventsNextWeekFunctionDefinition: FunctionDefinition = {
    name: "outlookcalendar_users_events_next_week_get",
    description:
        "Get events for next week",
    parameters: {
        type: "object",
        properties: {
            startdatetime:{
                type:"string",
                description: "The start time of the event, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
            },
            enddatetime:{
                type:"string",
                description: "The end time of the event, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
            }
        },
        required: ["startdatetime", "enddatetime"]
    }
}



/**
 * @function Get All Events in user's calendar
 * @method GET
 */
export const outlookCalendarUsersEventsFunctionDefinition: FunctionDefinition = {
    name: "outlookcalendar_users_events_get",
    description:
        " Get all events in users'calendar of outlook calendar",
    parameters: {
        type: "object",
        properties: {},
        required: []
    }
}


/**
 * @function Get All Calendar
 * @method GET
 */
export const outlookCalendarUsersCalendarsFunctionDefinition: FunctionDefinition = {
    name: "outlookcalendar_users_calendars_get",
    description:
        " Get all user's calenadars",
    parameters: {
        type: "object",
        properties: {},
        required: []
    }
}



/**
 * @function Find users meeting times
 * @method POST
 */
export const outlookCalendarUsersMeetingTimesFunctionDefinition: FunctionDefinition = {
    name: "outlookcalendar_users_meetingtimes_list",
    description:
        "Outlook Calendar Find Meeting Times",
    parameters: {
        type: "object",
        properties: {
            attendees: {
                type: "array",
                items:{
                    type:"object",
                    properties:{
                        emailAddress:{
                            type:"object",
                            properties:{
                                address:{
                                    type:"string",
                                    description: "Email address of the attendee.",
                                },
                                name:{
                                    type:"string",
                                    description: "User name of the attendee.",
                                }
                            }
                        },
                        type:{
                            type:"string",
                            default:"Required"
                        }
                    }
                },
                description: "A collection of attendees or resources for the meeting. Since findMeetingTimes assumes that any attendee who is a person is always required, specify required for a person and resource for a resource in the corresponding type property. An empty collection causes findMeetingTimes to look for free time slots for only the organizer. "
                
            },
            timeConstraint: {
                type: "object",
                properties:{
                    timeslots: {
                        type: "array",
                        items:{
                            type:"object",
                            properties:{
                                start: {
                                    type: "object",
                                    properties:{
                                        dateTime:{
                                            type: "string",
                                            description:
                                            "The start time of the meeting, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
                                        },
                                        timezone:{
                                            type:"string",
                                            description:
                                            "Time zone of the start date as per IANA Time Zone Database (e.g., 'America/Los_Angeles')."
                                        }
                                    },
                                    required: ["dateTime", "timeZone"],
                                },
                                end:{
                                    type:"object",
                                    properties:{
                                        dateTime:{
                                            type: "string",
                                            description:
                                            "The end time of the meeting, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
                                        },
                                        timezone:{
                                            type:"string",
                                            description:
                                            "Time zone of the end date as per IANA Time Zone Database (e.g., 'America/Los_Angeles')."
                                        }
                                    },
                                    required: ["dateTime", "timeZone"],
                                }
                            },
                            required: ["start", "end"],
                        }
                    }
                },
                description:
                "The time-related constraints for the meeting"
            },
            locationConstraint: {
                type: "object",
                properties:{
                    isRequired: {
                        type:"boolean",
                        default: "false"
                    },
                    suggestLocation: {
                        type: "boolean",
                        default:"true"
                    },
                    locations: {
                        type : "array",
                        items:{
                            type:"object",
                            properties:{
                                displayName: {
                                    type:"string"
                                },
                                locationEmailAddress:{
                                    type:"string"
                                }
                            }
                        }
                    }
                }
            },
            meetingDuration: {
                type:"string",
                description:"The length of the meeting, denoted in ISO8601 format. For example, 1 hour is denoted as 'PT1H', where 'P' is the duration designator, 'T' is the time designator, and 'H' is the hour designator. Use M to indicate minutes for the duration; for example, 2 hours and 30 minutes would be 'PT2H30M'. If no meeting duration is specified, findMeetingTimes uses the default of 30 minutes."
            }
        },
        required: []
    }
}


/**
 * @function Schedule meeting time
 * @method POST
 */
export const outlookCalendarUsersMeetingScheduleFunctionDefinition: FunctionDefinition = {
    name: "outlookcalendar_users_meeting_schedule",
    description:
        "Users schedule meeting",
    parameters: {
        type: "object",
        properties: {
                subject: {
                    type: "string",
                    description: 
                    "Schedule subject for meeting"
                },
                start: {
                    type: "object",
                    properties:{
                        dateTime:{
                            type: "string",
                            description: "The start time of the meeting, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
                        },
                        timezone:{
                            type:"string",
                            description: "Time zone of the start date as per IANA Time Zone Database (e.g., 'America/Los_Angeles').",

                        }
                    },
                    required:["dateTime", "timezone"]
                },
                end: {
                    type: "object",
                    properties:{
                        dateTime:{
                            type: "string",
                            description: "The end time of the meeting, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
                        },
                        timezone:{
                            type:"string",
                            description: "Time zone of the start date as per IANA Time Zone Database (e.g., 'America/Los_Angeles').",

                        }
                    },
                    required:["dateTime", "timezone"]
                },
        },
        required: ["subject","start", "end"]
    }
}

/**
 * @function Add Graph Community call
 * @method POST
 */
export const outlookCalendarUsersGraphCallAddFunctionDefinition: FunctionDefinition = {
    name: "outlookcalendar_users_graph_call_add",
    description:
        "Users Graph Community call Add",
    parameters: {
        type: "object",
        properties: {
                subject: {
                    type: "string",
                    description: 
                    "Schedule subject for meeting"
                },
                body: {
                    type: "object",
                    properties:{
                        content: {
                            type:"string",
                            description: "Schedule content for meeting"
                        },
                    },
                },
                start: {
                    type: "object",
                    properties:{
                        dateTime:{
                            type: "string",
                            description: "The start time of the meeting, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
                        },
                        timezone:{
                            type:"string",
                            description: "Time zone of the start date as per IANA Time Zone Database (e.g., 'America/Los_Angeles').",
                        }
                    },
                    required:["dateTime", "timezone"]
                },
                end: {
                    type: "object",
                    properties:{
                        dateTime:{
                            type: "string",
                            description: "The end time of the meeting, in the format: yyyy-mm-ddTHH:MM:SS-00:00."
                        },
                        timezone:{
                            type:"string",
                            description: "Time zone of the end date as per IANA Time Zone Database (e.g., 'America/Los_Angeles').",
                        }
                    },
                    required:["dateTime", "timezone"]
                },
                location: {
                    type: 'object',
                    properties:{
                        displayName:{
                            type:'string'
                        }
                    }
                },
                recurrence: {
                    type: 'object',
                    properties:{
                        pattern: {
                           type:'object',
                           properties:{
                                type: {
                                    type:"string",
                                    default:"relativeMonthly",
                                },
                                interval: {
                                    type: 'number',
                                    default:1
                                },
                                daysOfWeek: {
                                    type: "array",
                                    items:{
                                        type:"string"
                                    }
                                },
                                index: {
                                    type:"string",
                                }
                           },
                           required:["type", "interval", "daysOfWeek"]
                        },
                        range: {
                            type: 'object',
                            properties: {
                                type: {
                                    type:"string"
                                },
                                startDate: {
                                    type: "string"
                                }
                            }
                        }
                    },
                    required: ["pattern", "range"]
                }
        },
        required: ["subject", "body", "start", "end", "location", "recurrence"]
    }
}

/**
 * @function Track changes on users events for next week
 * @method GET
 */
export const outlookCalendarUsersEventsTrackGetFunctionDefinition: FunctionDefinition = {
    name: "outlookcalendar_users_events_track_get",
    description:
        "Track changes on users events for next week",
    parameters: {
        type: "object",
        properties: {
            startdatetime:{
                type:"string",
                description: "The start time of the track changes on events, in the format: yyyy-mm-ddTHH:MM:SS-00:00.",
            },
            enddatetime:{
                type:"string",
                description: "The end time of the track changes on events, in the format: yyyy-mm-ddTHH:MM:SS-00:00.",
            }
        },
        required: ["startdatetime", "enddatetime"]
    }
}

  export const typeframes_create_video: FunctionDefinition = {
    name: "typeframes_create_video",
    description: "Create a video from text using Typeframes API.",
    parameters: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description:
                    "The text to be broken down into slides for the video or The url to scrap to generate the video.",
            },
            speed: {
                type: "string",
                enum: ["fast", "medium", "slow"],
                description: "The speed of the video. Default is fast.",
            },
            audio: {
                type: "string",
                format: "url",
                description:
                    "The URL of an audio file. Should be in MP3 format. Default is 'dont-blink'.",
            },
            compression: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "The compression level of the video. Default is medium.",
            },
            frameDurationMultiplier: {
                type: "number",
                description:
                    "Increase this parameter to increase all the frame durations.",
            },
            resolution: {
                type: "string",
                description: "The resolution of the video. Default is '720p'.",
            },
            width: {
                type: "string",
                description: "The width of the video. Default is '1280'.",
            },
            height: {
                type: "string",
                description: "The height of the video. Default is '720'.",
            },
            frameRate: {
                type: "number",
                description: "The frame rate of the video. Default is '60'.",
            },
            hasToGenerateVoice: {
                type: "boolean",
                description:
                    "Whether to generate voice for the video. Default is true.",
            },
            hasToSearchMedia: {
                type: "boolean",
                description:
                    "Whether to search for media for the video. Default is true.",
            },
        },
        required: ["text"],
    },
};

export const typeframes_create_video_from_text: FunctionDefinition = {
    name: "typeframes_create_video_from_text",
    description: "Generates a video from provided text with customizable settings for speed, audio, and visual quality.",
    parameters: {
        type: "object",
        properties: {
            text: { 
                type: "string", 
                description: "The text content to be broken down into slides for the video." 
            },
            speed: { 
                type: "string", 
                enum: ["fast", "medium", "slow"], 
                description: "The speed of the video. Default is fast."
            },
            audio: { 
                type: "string", 
                format: "url", 
                description: "The URL of an audio file. Should be in MP3 format. Default is 'dont-blink'." 
            },
            compression: { 
                type: "string", 
                enum: ["low", "medium", "high"], 
                description: "The compression level of the video. Options include low, medium, or high compression. Default is medium."
            },
            frameDurationMultiplier: { 
                type: "number", 
                description: "Multiplier to adjust the duration each frame is displayed, affecting the overall length and pacing of the video."
            },
            resolution: { 
                type: "string", 
                description: "The resolution of the video. Default is '720p'."
            },
            width: { 
                type: "string", 
                description: "The width of the video. Default is '1280'."
            },
            height: { 
                type: "string", 
                description: "The height of the video. Default is '720'."
            },
            frameRate: { 
                type: "number", 
                description: "The frame rate of the video. Default is '60'."
            }
        },
        required: ["text"],
    },
};

export const typeframes_create_video_from_slides: FunctionDefinition = {
    name: "typeframes_create_video_from_slides",
    description: "Generates a video from provided slides with customizable settings for speed, audio, and visual quality.",
    parameters: {
        type: "object",
        properties: {
            slides: {
                type: "array",
                items: {
                    type: "object",
                    description: "Individual slide data for the video."
                },
                description: "An array of slides to be used in the video."
            },
            speed: { 
                type: "string", 
                enum: ["fast", "medium", "slow"], 
                description: "The speed of the video. Default is fast."
            },
            audio: { 
                type: "string", 
                format: "url", 
                description: "The URL of an audio file. Should be in MP3 format. Default is 'dont-blink'." 
            },
            compression: { 
                type: "string", 
                enum: ["low", "medium", "high"], 
                description: "The compression level of the video. Options include low, medium, or high compression. Default is medium."
            },
            frameDurationMultiplier: { 
                type: "number", 
                description: "Multiplier to adjust the duration each frame is displayed, affecting the overall length and pacing of the video."
            },
            resolution: { 
                type: "string", 
                description: "The resolution of the video. Default is '720p'."
            },
            width: { 
                type: "string", 
                description: "The width of the video. Default is '1280'."
            },
            height: { 
                type: "string", 
                description: "The height of the video. Default is '720'."
            },
            frameRate: { 
                type: "number", 
                description: "The frame rate of the video. Default is '60'."
            }
        },
        required: ["slides"],
    },
};

export const typeframes_gpt_get_videos: FunctionDefinition = {
    name: "typeframes_gpt_get_videos",
    description: "Get videos using GPT search on Typeframes.",
    parameters: {
        type: "object",
        properties: {
            query: { type: "string", description: "The query to search for videos." },
        },
        required: ["query"],
    },
};

export const typeframes_create_slides: FunctionDefinition = {
    name: "typeframes_create_slides",
    description: "Creates slides from the provided text, optionally with an audio file.",
    parameters: {
        type: "object",
        properties: {
            text: { 
                type: "string", 
                description: "The text content to be converted into slides." 
            },
            audio: { 
                type: "string", 
                format: "url", 
                description: "The URL of an optional audio file in MP3 format." 
            },
        },
        required: ["text"],
    },
};

export const clock_current_time: FunctionDefinition = {
    name: "clock_current_time",
    description: "Get the current time in the specified timezone.",
    parameters: {
        type: "object",
        properties: {
            timezone: {
                type: "string",
                description: "The timezone to get the current time for.",
            },
        },
        required: ["timezone"],
    },
};



/**
 * @function Get users note books
 * @method GET
 */
export const outlookOnenoteUsersNotebooksGetFunctionDefinition: FunctionDefinition = {
    name: "outlookOneNote_users_notebooks_get",
    description:
        "Get users one notebooks",
    parameters: {
        type: "object",
        properties: {},
        required: []
    }
}


/**
 * @function Get users onenote sections
 * @method GET
 */
export const outlookOnenoteUsersSectionsGetFunctionDefinition: FunctionDefinition = {
    name: "outlookOneNote_users_sections_get",
    description:
        "Get users onenote sections",
    parameters: {
        type: "object",
        properties: {},
        required: []
    }
}

/**
 * @function Get users onenote pages
 * @method GET
 */
export const outlookOnenoteUsersPagesGetFunctionDefinition: FunctionDefinition = {
    name: "outlookOneNote_users_pages_get",
    description:
        "Get users onenote pages",
    parameters: {
        type: "object",
        properties: {},
        required: []
    }
}


/**
 * @function Create users notebook
 * @method POST
 */
export const outlookOnenoteUsersNotebookCreateFunctionDefinition: FunctionDefinition = {
    name: "outlookOneNote_users_notebook_create",
    description:
        "Create users new notebook",
    parameters: {
        type: "object",
        properties: {
            displayName:{
                type:"string",
                description: "Users notebook display name"
            }
        },
        required: ["displayName"]
    }
}

/**
 * @function Create users notebook sections
 * @method POST
 */
export const outlookOnenoteUsersSectionsCreateFunctionDefinition: FunctionDefinition = {
    name: "outlookOneNote_users_sections_create",
    description:
        "Create users new notebook sections",
    parameters: {
        type: "object",
        properties: {
            notebookId:{
                type:"string",
                description: "Created Notebook id for section"
            },
            displayName:{
                type:"string",
                description: "Users notebook section's display name"
            }
        },
        required: ["notebookId", "displayName"]
    }
}

/**
 * @function Create users notebook pages
 * @method POST
 */
export const outlookOnenoteUsersPagesCreateFunctionDefinition: FunctionDefinition = {
    name: "outlookOneNote_users_pages_create",
    description:
        "Create users new notebook pages",
    parameters: {
        type: "object",
        properties: {
            sectionId:{
                type:"string",
                description: "Created Section Id for page"
            },
            page:{
                type:"string",
                description: "The page Html of notebook to create"
            }
        },
        required: ["sectionId", 'page']
    }
}

export const searchGoogleJobsFunctionDefinition: FunctionDefinition = {
  name: "serpapi_google_job",
  description: "Query the Google Jobs API to search for job listings.",
  parameters: {
    type: "object",
    properties: {
      q: {
        type: "string",
        description: "The search query you want to search.",
      },
      location: {
        type: "string",
        description:
          "The geographic location from where you want the search to originate.",
      },
      uule: {
        type: "string",
        description:
          "The Google encoded location you want to use for the search.",
      },
      google_domain: {
        type: "string",
        description: "The Google domain to use for the search.",
      },
      gl: {
        type: "string",
        description:
          "The country to use for the Google search. It's a two-letter country code.",
      },
      hl: {
        type: "string",
        description:
          "The language to use for the Google Jobs search. It's a two-letter language code.",
      },
      start: {
        type: "integer",
        description:
          "The result offset. It skips the given number of results. It's used for pagination.",
      },
      chips: {
        type: "string",
        description: "Additional query conditions extracted from search chips.",
      },
      lrad: {
        type: "number",
        description:
          "Search radius in kilometers. Does not strictly limit the radius.",
      },
      ltype: {
        type: "string",
        description: "Filter the results by work from home.",
      },
      engine: {
        type: "string",
        enum: ["google_jobs"],
        description:
          "Set parameter to google_jobs to use the Google Jobs API engine.",
      },
      no_cache: {
        type: "boolean",
        description:
          "Force SerpApi to fetch the Google Jobs results even if a cached version is already present.",
      },
      async: {
        type: "boolean",
        description:
          "Defines the way you want to submit your search to SerpApi.",
      },
      api_key: {
        type: "string",
        description: "The SerpApi private key to use.",
      },
      output: {
        type: "string",
        enum: ["json", "html"],
        description:
          "The final output format. It can be json (default) to get a structured JSON of the results, or html to get the raw HTML retrieved.",
      },
    },
    required: ["q", "engine", "api_key"],
    additionalProperties: false,
  },
};


export const trello_get_a_card: FunctionDefinition = {
    name: "trello_get_a_card",
    description: "Get a card by its ID from Trello.",
    parameters: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description: "Trello ID of the card.",
            },
            fields: {
                type: "string",
                description: "Specify all or a comma-separated list of fields.",
                default:
                    "badges,checkItemStates,closed,dateLastActivity,desc,descData,due,start,idBoard,idChecklists,idLabels,idList,idMembers,idShort,idAttachmentCover,manualCoverAttachment,labels,name,pos,shortUrl,url",
            },
            actions: {
                type: "string",
                description: "See the Actions Nested Resource.",
            },
            attachments: {
                oneOf: [{ type: "string" }, { type: "boolean" }],
                description: "true, false, or cover. Default: false",
            },
            attachment_fields: {
                type: "string",
                description:
                    "Specify all or a comma-separated list of attachment fields.",
                default: "all",
            },
            members: {
                type: "boolean",
                description:
                    "Whether to return member objects for members on the card.",
                default: false,
            },
            member_fields: {
                type: "string",
                description: "Specify all or a comma-separated list of member fields.",
                default: "avatarHash,fullName,initials,username",
            },
            membersVoted: {
                type: "boolean",
                description:
                    "Whether to return member objects for members who voted on the card.",
                default: false,
            },
            memberVoted_fields: {
                type: "string",
                description: "Specify all or a comma-separated list of member fields.",
                default: "avatarHash,fullName,initials,username",
            },
            checkItemStates: {
                type: "boolean",
                description: "Whether to include checkItemStates.",
                default: false,
            },
            checklists: {
                type: "string",
                description:
                    "Whether to return the checklists on the card. all or none. Default: none",
            },
            checklist_fields: {
                type: "string",
                description:
                    "Specify all or a comma-separated list of checklist fields.",
                default: "all",
            },
            board: {
                type: "boolean",
                description: "Whether to return the board object the card is on.",
                default: false,
            },
            board_fields: {
                type: "string",
                description: "Specify all or a comma-separated list of board fields.",
                default: "name,desc,descData,closed,idOrganization,pinned,url,prefs",
            },
            list: {
                type: "boolean",
                description: "See the Lists Nested Resource.",
                default: false,
            },
            pluginData: {
                type: "boolean",
                description:
                    "Whether to include pluginData on the card with the response.",
                default: false,
            },
            stickers: {
                type: "boolean",
                description: "Whether to include sticker models with the response.",
                default: false,
            },
            sticker_fields: {
                type: "string",
                description: "Specify all or a comma-separated list of sticker fields.",
                default: "all",
            },
            customFieldItems: {
                type: "boolean",
                description: "Whether to include the customFieldItems.",
                default: false,
            },
        },
        required: ["id"],
    },
};

export const trello_get_boards_that_member_belongs_to: FunctionDefinition = {
    name: "trello_get_boards_that_member_belongs_to",
    description: "Lists the boards that the user is a member of.",
    parameters: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description:
                    "The ID or username of the member. The special value me can be used to indicate the authenticated user. Pattern: ^[0-9a-fA-F]{24}$",
            },
            filter: {
                type: "string",
                description:
                    "Specify all or a comma-separated list of filters. Default: all",
                default: "all",
                enum: [
                    "all",
                    "closed",
                    "members",
                    "open",
                    "organization",
                    "public",
                    "starred",
                ],
            },
            fields: {
                type: "string",
                description: "Specify all or a comma-separated list of board fields.",
            },
            lists: {
                type: "string",
                description:
                    "Which lists to include with the boards. Valid values: all, closed, none, open",
                default: "none",
                enum: ["all", "closed", "none", "open"],
            },
            organization: {
                type: "boolean",
                description:
                    "Whether to include the Organization object with the Boards",
                default: false,
            },
            organization_fields: {
                type: "string",
                description:
                    "Specify all or a comma-separated list of organization fields.",
                enum: ["id", "name"],
            },
        },
        required: ["id"],
        additionalProperties: false,
    },
};

export const trello_get_cards_in_a_list: FunctionDefinition = {
    name: "trello_get_cards_in_a_list",
    description: "Get Cards in a List from Trello.",
    parameters: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description: "Trello ID of the board.",
            },
        },
        required: ["id"],
    },
};

export const trello_get_lists_on_a_board: FunctionDefinition = {
    name: "trello_get_lists_on_a_board",
    description: "Get the lists on a board from Trello.",
    parameters: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description: "Trello ID of the board.",
            },
            cards: {
                type: "string",
                description: "Filter to apply to Cards.",
                enum: ["all", "closed", "none", "open"],
            },
            card_fields: {
                type: "string",
                description: "Specify all or a comma-separated list of card fields.",
                default: "all",
            },
            filter: {
                type: "string",
                description: "Filter to apply to Lists.",
                enum: ["all", "closed", "none", "open"],
            },
            fields: {
                type: "string",
                description: "Specify all or a comma-separated list of list fields.",
                default: "all",
            },
        },
        required: ["id"],
    },
};

export const slack_get_channels: FunctionDefinition = {
    name: "slack_get_channels",
    description: "Get Channels from Slack.",
    parameters: {
        type: "object",
        properties: {
            options: {
                type: "object",
                properties: {
                    includePrivateChannels: {
                        type: "boolean",
                        description: "Determines whether to include private channels. Defaults to 'false'.",
                        default: false,
                    },
                    limit: {
                        type: "number",
                        description: "The maximum number of channels to return. Defaults to '200'.",
                        default: 200,
                    },
                    cursor: {
                        type: "string",
                        description: "A pagination cursor returned by a previous call to 'conversations.list' to fetch the next page of results.",
                        default: null,
                    },
                    excludeArchived: {
                        type: "boolean",
                        description: "If set to 'true', archived channels will be excluded from the list.",
                        default: false,
                    },
                    types: {
                        type: "array",
                        items: {
                            type: "string",
                            enum: ["public_channel", "private_channel"],
                        },
                        description: "An array specifying the types of channels to return. Defaults to '['public_channel']'.",
                        default: ["public_channel"],
                    },
                },
                required: [],
            },
        },
        required: [],
    },
};

export const slack_send_message: FunctionDefinition = {
    name: "slack_send_message",
    description: "Send a message in Slack.",
    parameters: {
        type: "object",
        properties: {
            channel: {
                type: "string",
                description: "The ID of the channel to send the message to.",
            },
            message: {
                type: "string",
                description: "The message content to send.",
            },
        },
        required: ["channel", "message"],
    },
};

export const slack_schedule_message: FunctionDefinition = {
    name: "slack_schedule_message",
    description: "Schedule a message to be sent in a Slack channel at a specified time.",
    parameters: {
        type: "object",
        properties: {
            channelId: {
                type: "string",
                description: "The ID of the Slack channel where the message will be scheduled.",
            },
            messageText: {
                type: "string",
                description: "The text content of the message to be scheduled.",
            },
            postAt: {
                type: "number",
                description: "The Unix Epoch timestamp representing the time at which the message should be posted.",
            },
        },
        required: ["channelId", "messageText", "postAt"],
    },
};

export const slack_get_conversation_history: FunctionDefinition = {
    name: "slack_get_conversation_history",
    description: "Get conversation history from a Slack channel.",
    parameters: {
        type: "object",
        properties: {
            channel: {
                type: "string",
                description: "Conversation ID to fetch history for.",
            },
            cursor: {
                type: "string",
                description: "Paginate through collections of data by setting the cursor parameter.",
                default: "",
            },
            include_all_metadata: {
                type: "boolean",
                description: "Return all metadata associated with this message.",
                default: false,
            },
            inclusive: {
                type: "boolean",
                description: "Include messages with oldest or latest timestamps in results.",
                default: false,
            },
            latest: {
                type: "string",
                description: "Only messages before this Unix timestamp will be included in results.",
                default: "",
            },
            limit: {
                type: "number",
                description: "The maximum number of items to return.",
                default: 100,
            },
            oldest: {
                type: "string",
                description: "Only messages after this Unix timestamp will be included in results.",
                default: "",
            },
        },
        required: ["channel"],
    },
};

// Retrieve a thread of messages posted to a conversation
export const slack_get_threads: FunctionDefinition = {
    name: "slack_get_threads",
    description: "Retrieve threads (conversation replies) in Slack. This function requires an authentication token with necessary scopes and the conversation ID from which to fetch the thread. You also need to provide the unique identifier of either a thread’s parent message or a message in the thread. Optionally, you can paginate through results with a cursor, return all metadata associated with messages, include messages with oldest or latest timestamps, and specify the maximum number of items to return.",
    parameters: {
        type: "object",
        properties: {
            channel: {
                type: "string",
                description: "Conversation ID to fetch thread from.",
            },
            ts: {
                type: "string",
                description: "Unique identifier of either a thread’s parent message or a message in the thread.",
            },
            cursor: {
                type: "string",
                description: "Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata.",
            },
            include_all_metadata: {
                type: "boolean",
                description: "Return all metadata associated with this message.",
                default: false,
            },
            inclusive: {
                type: "boolean",
                description: "Include messages with oldest or latest timestamps in results.",
                default: false,
            },
            latest: {
                type: "string",
                description: "Only messages before this Unix timestamp will be included in results.",
                default: "now",
            },
            limit: {
                type: "number",
                description: "The maximum number of items to return.",
                default: 1000,
            },
            oldest: {
                type: "string",
                description: "Only messages after this Unix timestamp will be included in results.",
                default: "0",
            },
        },
        required: ["channel", "ts"],
    },
};

export const slack_update_message: FunctionDefinition = {
    name: "slack_update_message",
    description: "Update a message in Slack channel.",
    parameters: {
        type: "object",
        properties: {
            channel: {
                type: "string",
                description: "Channel containing the message to be updated.",
            },
            ts: {
                type: "string",
                description: "Timestamp of the message to be updated.",
            },
            attachments: {
                type: "string",
                description: "A JSON-based array of structured attachments, presented as a URL-encoded string.",
            },
            blocks: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "A JSON-based array of structured blocks, presented as a URL-encoded string.",
            },
            text: {
                type: "string",
                description: "How this field works and whether it is required depends on other fields you use in your API call.",
            },
            as_user: {
                type: "boolean",
                description: "Pass true to update the message as the authed user. Bot users in this context are considered authed users.",
            },
            file_ids: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "Array of new file ids that will be sent with this message.",
            },
            link_names: {
                type: "boolean",
                description: "Find and link channel names and usernames. Defaults to none.",
            },
            metadata: {
                type: "string",
                description: "JSON object with event_type and event_payload fields, presented as a URL-encoded string.",
            },
            parse: {
                type: "string",
                description: "Change how messages are treated. Defaults to client, unlike chat.postMessage. Accepts either none or full.",
            },
            reply_broadcast: {
                type: "boolean",
                description: "Broadcast an existing thread reply to make it visible to everyone in the channel or conversation.",
            },
        },
        required: ["channel", "ts"],
    },
};

export const slack_delete_message: FunctionDefinition = {
    name: "slack_delete_message",
    description: "Delete a message in Slack.",
    parameters: {
        type: "object",
        properties: {
            channel: {
                type: "string",
                description: "Channel containing the message to be deleted.",
            },
            ts: {
                type: "string",
                description: "Timestamp of the message to be deleted.",
            },
            as_user: {
                type: "boolean",
                description: "Pass true to delete the message as the authed user with chat:write:user scope.",
                default: false,
            },
        },
        required: ["channel", "ts"],
    },
};


export const googleKeepCreateNoteFunctionDefinition: FunctionDefinition = {
    name: "google_keep_create_note",
    description:
        "Create a new note on Google Keep",
    parameters: {
        type: "object",
        properties: {
            title:{
                type:"string",
                description: "The title of the note"
            },
            body:{
                type:"object",
                properties: {
                    text:{
                        type:"string",
                        description: "The text content of the note"
                    },
                    list:{
                        type:"array",
                        items:{
                            type:"string"
                        },
                        description: "The list items of the note"
                    }
                },
                description: "The body of the note"
            }
        },
        required: ["title", 'body']
    }
}

export const googleKeepDeleteNoteFunctionDefinition: FunctionDefinition = {
    name: "google_keep_delete_note",
    description: "Delete a note on Google Keep",
    parameters: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description: "Name of the note to delete (required)"
            }
        },
        required: ["name"]
    }
};

export const googleKeepGetNoteFunctionDefinition: FunctionDefinition = {
    name: "google_keep_get_note",
    description: "Get a note from Google Keep by name",
    parameters: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description: "Name of the note to get (required)"
            }
        },
        required: ["name"]
    }
};

export const googleKeepListNotesFunctionDefinition: FunctionDefinition = {
    name: "google_keep_list_notes",
    description: "List notes from Google Keep",
    parameters: {
        type: "object",
        properties: {
            pageSize: {
                type: "integer",
                description: "The maximum number of results to return"
            }, 
            pageToken: {
                type: "string",
                description: "The nextPageToken from the previous page"
            },
            filter: {
                type: "string",
                description: "Filter for list results"
            }
        }
    }
};

// Retrieve a database
export const notionRetrieveDatabaseGetFunctionDefinition: FunctionDefinition = {
    name: "notion_retrieve_database_get",
    description: "Retrieve Database in Notion",
    parameters: {
        type: "object",
        properties: {
            databaseId: {
                type: "string",
                description: "A database Id to retrive"
            }
        },
        required: ["databaseId"],
    }
}

// Query a database
export const notionQueryDatabasePostFunctionDefinition: FunctionDefinition = {
    name: "notion_query_database_post",
    description: "Query Database in Notion",
    parameters: {
        type: "object",
        properties: {
            databaseId: {
                type: "string",
                description: "A database Id to retrive"
            },
            filter: {
                type: "object",
                properties: {},
                description: "This object represents the filtering criteria to be applied to the database."
            },
            sorts: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        property: {
                            type: "string",
                            description: "This specifies the name of the property (column) in the Notion database that you want to sort on. In this case, it's the 'Name' property."
                        },
                        direction: {
                            type: "string",
                            description: "This specifies the sorting direction, which can be either 'ascending' or 'descending'."
                        }
                    }
                },
                description:"This array represents the sorting criteria to be applied to the database query."
            }
        },
        required: ["databaseId", "filter"],
    }
}

// Create a page
export const notionCreatePagesPostFunctionDefinition: FunctionDefinition = {
    name: "notion_create_pages_post",
    description: "Create Pages in Notion",
    parameters: {
        type: "object",
        properties: {
            parent: {
                type: "object",
                properties: {
                    database_id: {
                        type: "string",
                        description: "This is the ID of the Notion database where the new page will be created."
                    }
                },
                required: ["database_id"]
            },
            properties: {
                type: "object",
                properties: {},
                required: [],
            }
        },
        required: ["parent", "properties"],
    }
}

// Create a page with content
export const notionCreatePagesByContentPostFunctionDefinition: FunctionDefinition = {
    name: "notion_create_pages_by_content_post",
    description: "Create Pages with content in Notion",
    parameters: {
        type: "object",
        properties: {
            parent: {
                type: "object",
                properties: {
                    database_id: {
                        type: "string",
                        description: "This is the ID of the Notion database where the new page will be created."
                    }
                },
                required: ["database_id"]
            },
            "properties": {
                type: "object",
                properties: {},
                required: [],
            },
            children: {
                type: "array",
                items: {
                    type:"object",
                    properties: {},
                    description: " This array contains the blocks that you want to append as children to an existing Notion page or block."
                }
            }
        },
        required: ["parent", "properties", "children"],
    }
}

// Retrieve a page
export const notionRetrievePagesGetFunctionDefinition: FunctionDefinition = {
    name: "notion_retrieve_pages_get",
    description: "Retrieve Pages in notion",
    parameters: {
        type: "object",
        properties: {
            pageId: {
                type: "string"
            }
        },
        required: ["pageId"],
    }
}

// Retrieve a block children
export const notionRetrieveBlockChildrenGetFunctionDefinition: FunctionDefinition = {
    name: "notion_retrieve_block_children_get",
    description: "Retrieve block children in blocks of notion",
    parameters: {
        type: "object",
        properties: {
            blockId: {
                type: "string"
            }
        },
        required: ["blockId"],
    }
}

// Append Block children
export const notionAppendBlockChildrenPatchFunctionDefinition: FunctionDefinition = {
    name: "notion_append_block_children_patch",
    description: "Append Block children in Blocks of notion",
    parameters: {
        type: "object",
        properties: {
            blockId: {
                type: "string",
                description: "The Block Id which has been already created"
            },
            children: {
                type: "array",
                items: {
                    type: "object",
                    properties: {},
                    description: " This array contains the blocks that you want to append as children to an existing Notion page or block."
                }
            }
        },
        required: ["blockId", "children"],
    }
}
//Update a block
export const notionUpdateBlockPatchFunctionDefinition: FunctionDefinition = {
    name: "notion_update_block_patch",
    description: "Update block",
    parameters: {
        type: "object",
        properties: {
            pageId: {
                type: "string",
                description: "A page id Id to upddate a block"
            },
            "properties": {
                type: "object",
                properties: {},
            },
        },
        required: ["pageId"],
    }
}
//Retrieve a block
export const notionRetriveBlockGetFunctionDefinition: FunctionDefinition = {
    name: "notion_retrive_block_get",
    description: "Retrieve a block in Blocks",
    parameters: {
        type: "object",
        properties: {
            blockId: {
                type: "string",
                description: "The Block Id which has been created in blocks"
            }
        },
        required: ["blockId"],
    }
}
//Delete a block
export const notionRemoveBlockDeleteFunctionDefinition: FunctionDefinition = {
    name: "notion_remove_block_get",
    description: "Remove a block in Blocks",
    parameters: {
        type: "object",
        properties: {
            blockId: {
                type: "string",
                description: "The Block Id to remove block"
            }
        },
        required: ["blockId"],
    }
}

// Search
export const notionSearchPostFunctionDefinition: FunctionDefinition = {
    name: "notion_search_post",
    description: "Search notion",
    parameters: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "This field specifies the search term used to filter the results. "
            },
            sort: {
                type: "object",
                properties:{
                    direction: {
                        type:"string",
                        description: "Specifies the ordering direction. It can be either 'ascending' or 'descending'. 'ascending' will order results from the oldest or smallest up to the most recent or largest depending on the field you're sorting by."
                    },
                    timestamp: {
                        type: "string",
                        description : 'This specifies which timestamp to use for sorting purposes.'
                    }
                },
                description: "This is an array of sorting criteria. Each sort criterion is an object that determines how the search results are ordered.",
            }
        },
        required: ["query", "sort"],
    }
}

export const notionRetriveCommentsGetFunctionDefinition: FunctionDefinition = {
    name: "notion_retrive_comments_get",
    description: "Retrive comments in block",
    parameters: {
        type: "object",
        properties: {
            blockId: {
                type: "string",
                description: "The Block Id which has been created in blocks"
            }
        },
        required: ["blockId"],
    }
}

export const notionAddCommentToPagePostFunctionDefinition: FunctionDefinition = {
    name: "notion_add_comments_to_page_post",
    description: "Add comments to page in block",
    parameters: {
        type: "object",
        properties: {
            parent: {
                type: 'object',
                properties:{
                    page_id: {
                        type: "string",
                        description: "A placeholder indicating that you need to supply the correct ID of the page."
                    }
                },
                required: ["page_id"],
                description: 'Indicates which entity will act as the container for the new block. In most systems that use blocks to organize content, a parent entity defines the scope or the hierarchy in which a block resides.'
            },
            rich_text: {
                type: "array",
                items:{
                    type: "object",
                    properties:{
                        text: {
                            type: "object",
                            properties: {
                                content: {
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            }
            
        },
        required: ["parent", "rich_text"],
    }
}

export const notionAddCommentToDiscussionPostFunctionDefinition: FunctionDefinition = {
    name: "notion_add_comments_to_discussion_post",
    description: "Add comments to discussion in block",
    parameters: {
        type: "object",
        properties: {
            discussionId: {
                type: "string",
                description: 'This field is meant to contain the unique identifier of the discussion to which you want to add the comment.'
            },
            rich_text: {
                type: "array",
                items:{
                    type: "object",
                    properties:{
                        text: {
                            type: "object",
                            properties: {
                                content: {
                                    type: "string"
                                },
                                link: {
                                    type: "object",
                                    properties: {
                                        type:{
                                            type: "string",
                                            default: "url"
                                        },
                                        url: {
                                            type: "string"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
        },
        required: ["discussionId", "rich_text"],
    }
}

export const pubMedEsearchGetFunctionDefinition: FunctionDefinition = {
    name: "pubMed_Esearch_get",
    description: "Search a text query in a single Entrez database.",
    parameters: {
        type: "object",
        properties: {
            db:{
                type: "string",
                default: "pubmed",
                description: "Database to search. Value must be a valid Entrez database name (default = pubmed)."
            },
            term:{
                type: "string",
                description: "Entrez text query."
            },
            usehistory:{
                type: "string",
                description: "When usehistory is set to 'y', ESearch will post the UIDs resulting from the search operation onto the History server so that they can be used directly in a subsequent E-utility call. Also, usehistory must be set to 'y' for ESearch to interpret query key values included in term or to accept a WebEnv as input."
            },
            retmode:{
                type: "string",
                default: "xml",
                description: "Retrieval type. Determines the format of the returned output. The default value is ‘xml’ for EInfo XML, but ‘json’ is also supported to return output in JSON format."
            },
            retstart:{
                type: "string",
                description: "Sequential index of the first UID in the retrieved set to be shown in the XML output (default=0, corresponding to the first record of the entire set). This parameter can be used in conjunction with retmax to download an arbitrary subset of UIDs retrieved from a search."
            },
            retmax: {
                type: "number",
                default:10,
                description: "Total number of UIDs from the retrieved set to be shown in the XML output (default=20). By default, ESearch only includes the first 20 UIDs retrieved in the XML output. If usehistory is set to 'y', the remainder of the retrieved set will be stored on the History server; otherwise these UIDs are lost. Increasing retmax allows more of the retrieved UIDs to be included in the XML output, up to a maximum of 10,000 records."
            },
            rettype: {
                type: "string",
                description: "Retrieval type. There are two allowed values for ESearch: 'uilist' (default), which displays the standard XML output, and 'count', which displays only the <Count> tag."
            },
            field:{
                type: "string",
                description: "Search field. If used, the entire search term will be limited to the specified Entrez field. The following two URLs are equivalent:"
            },
            reldate:{
                type: "string",
                description: "When reldate is set to an integer n, the search returns only those items that have a date specified by datetype within the last n days."
            },
            datetype:{
                type: "string",
                description: "Type of date used to limit a search. The allowed values vary between Entrez databases, but common values are 'mdat' (modification date), 'pdat' (publication date) and 'edat' (Entrez date). Generally an Entrez database will have only two allowed values for datetype."
            },
            mindate:{
                type: "string",
                description: "Date range used to limit a search result by the date specified by datetype. The general date format is YYYY/MM/DD, and these variants are also allowed: YYYY, YYYY/MM."
            },
            maxdate:{
                type: "string",
                description: "Date range used to limit a search result by the date specified by datetype. The general date format is YYYY/MM/DD, and these variants are also allowed: YYYY, YYYY/MM."
            }

        },
        required: ["db", "term"]
    }
}

export const pubMedESummaryGetFunctionDefinition: FunctionDefinition = {
    name: "pubMed_ESummary_get",
    description: "Responds to a list of UIDs from a given database with the corresponding document summaries.",
    parameters: {
        type: "object",
        properties: {
            db:{
                type: "string",
                default: "pubmed",
                description: "Database to search. Value must be a valid Entrez database name (default = pubmed)."
            },
            id: {
                type: "array",
                items: {
                  type: "string",
                  properties: {}
                },
                description: "UID list. Either a single UID or a comma-delimited list of UIDs may be provided. All of the UIDs must be from the database specified by db. "
            },
            retmode:{
                type: "string",
                default: "xml",
                description: "Retrieval type. Determines the format of the returned output. The default value is ‘xml’ for EInfo XML, but ‘json’ is also supported to return output in JSON format."
            },
            retstart:{
                type: "string",
                description: "Sequential index of the first UID in the retrieved set to be shown in the XML output (default=0, corresponding to the first record of the entire set). This parameter can be used in conjunction with retmax to download an arbitrary subset of UIDs retrieved from a search."
            },
            retmax: {
                type: "string",
                description: "Total number of UIDs from the retrieved set to be shown in the XML output (default=20). By default, ESearch only includes the first 20 UIDs retrieved in the XML output. If usehistory is set to 'y', the remainder of the retrieved set will be stored on the History server; otherwise these UIDs are lost. Increasing retmax allows more of the retrieved UIDs to be included in the XML output, up to a maximum of 10,000 records."
            },
            version: {
                type: "string",
                description: "Used to specify version 2.0 ESummary XML. The only supported value is ‘2.0’. When present, ESummary will return version 2.0 DocSum XML that is unique to each Entrez database and that often contains more data than the default DocSum XML."
            },

        },
        required: ["db", "id"]
    }
}

export const pubMedEFetchGetFunctionDefinition: FunctionDefinition = {
    name: "pubMed_EFetch_get",
    description: "Responds to a list of UIDs in a given database with the corresponding data records in a specified format.",
    parameters: {
        type: "object",
        properties: {
            db:{
                type: "string",
                default: "pubmed",
                description: "Database to search. Value must be a valid Entrez database name (default = pubmed)."
            },
            id: {
                type: "array",
                items: {
                  type: "string",
                  properties: {}
                },
                description: "UID list. Either a single UID or a comma-delimited list of UIDs may be provided. All of the UIDs must be from the database specified by db. "
            },
            retmode:{
                type: "string",
                default: "xml",
                description: "Retrieval type. Determines the format of the returned output. The default value is ‘xml’ for EInfo XML, but ‘json’ is also supported to return output in JSON format."
            },
            retstart:{
                type: "string",
                description: "Sequential index of the first UID in the retrieved set to be shown in the XML output (default=0, corresponding to the first record of the entire set). This parameter can be used in conjunction with retmax to download an arbitrary subset of UIDs retrieved from a search."
            },
            retmax: {
                type: "string",
                description: "Total number of UIDs from the retrieved set to be shown in the XML output (default=20). By default, ESearch only includes the first 20 UIDs retrieved in the XML output. If usehistory is set to 'y', the remainder of the retrieved set will be stored on the History server; otherwise these UIDs are lost. Increasing retmax allows more of the retrieved UIDs to be included in the XML output, up to a maximum of 10,000 records."
            }

        },
        required: ["db", "id"]
    }
}

export const pubMedELinkGetFunctionDefinition: FunctionDefinition = {
    name: "pubMed_ELink_get",
    description: "Responds to a list of UIDs in a given database with either a list of related UIDs (and relevancy scores) in the same database or a list of linked UIDs in another Entrez database; checks for the existence of a specified link from a list of one or more UIDs; creates a hyperlink to the primary LinkOut provider for a specific UID and database, or lists LinkOut URLs and attributes for multiple UIDs.",
    parameters: {
        type: "object",
        properties: {
            db:{
                type: "string",
                default: "pubmed",
                description: "Database to search. Value must be a valid Entrez database name (default = pubmed)."
            },
            dbfrom:{
                type: "string",
                default: "pubmed",
                description: "Database containing the input UIDs. The value must be a valid Entrez database name (default = pubmed)"
            },
            cmd:{
                type: "string",
                default: "neighbor",
                description: "This specifies the “command mode” to use with ELink, and determines what type of links or information will be output. Some command modes help identify similar or related records in the same database, others identify linked records in a different Entrez database, and still others identify LinkOut information. The default value for cmd is neighbor, but the other options include: neighbor: Returns a set of UIDs in the db database linked to the input UIDs in the dbfrom database. neighbor_score: Returns a set of UIDs in a database that are similar or related to the input UIDs, along with the the computed similarity scores. Note that neighbor_score returns UIDs from the same database as the input UIDs, and assumes that the db and dbfrom databases are the same. neighbor_history: Functions similarly to neighbor, but stores the results to the NCBI History server and returns a Web environment string and query keys for each set of resulting UIDs, so you can use them in future queries. For more information about using the History server to store and combine query results sets, see our “E-utilities and the History server” page. acheck: Returns a list of all of the available links for the input UIDs. If you specify a db parameter, only links to that database will be shown. Otherwise, links to all databases will be shown. ncheck: Checks for the existence of links between your input UIDs and other UIDs in the same database. lcheck: Checks for the existence of external links (LinkOuts) for your set of input UIDs. llinks: Checks for the existence of external links (LinkOuts) for your set of input UIDs, and returns LinkOut URLs and provider attributes for all non-library providers. llinkslib: Checks for the existence of external links (LinkOuts) for your set of input UIDs, and returns LinkOut URLs and provider attributes for all providers (including library providers). prlinks: Returns the primary LinkOut provider for each input UID. If you input a single UID and use set the retmode parameter to ref, an ELink URL using the prlinks command mode will also redirect to the primary LinkOut provider’s website (using the LinkOut URL)."
            },
            id: {
                type: "array",
                items: {
                  type: "string",
                  properties: {}
                },
                description: "UID list. Either a single UID or a comma-delimited list of UIDs may be provided. All of the UIDs must be from the database specified by db. "
            },
            retmode:{
                type: "string",
                default: "xml",
                description: "Retrieval type. Determines the format of the returned output. The default value is ‘xml’ for EInfo XML, but ‘json’ is also supported to return output in JSON format."
            },
            linkname:{
                type: "string",
                description: "Sequential index of the first UID in the retrieved set to be shown in the XML output (default=0, corresponding to the first record of the entire set). This parameter can be used in conjunction with retmax to download an arbitrary subset of UIDs retrieved from a search."
            },
            term: {
                type: "string",
                description: "Entrez query used to limit the output set of linked UIDs. The query in the term parameter will be applied after the link operation, and only those UIDs matching the query will be returned by ELink. The term parameter only functions when db and dbfrom are set to the same database value."
            },
            holding:{
                type: "string",
                description: "Name of LinkOut provider. Only URLs for the LinkOut provider specified by holding will be returned. The value provided to holding should be the abbreviation of the LinkOut provider's name found in the <NameAbbr> tag of the ELink XML output when cmd is set to llinks or llinkslib. The holding parameter only functions when cmd is set to llinks or llinkslib."
            },
            datetype:{
                type: "string",
                description: "Type of date used to limit a link operation. The allowed values vary between Entrez databases, but common values are 'mdat' (modification date), 'pdat' (publication date) and 'edat' (Entrez date). Generally an Entrez database will have only two allowed values for datetype."
            },
            reldate:{
                type: "string",
                description: "When reldate is set to an integer n, ELink returns only those items that have a date specified by datetype within the last n days."
            },
            mindate:{
                type: "string",
                description: "Date range used to limit a search result by the date specified by datetype. The general date format is YYYY/MM/DD, and these variants are also allowed: YYYY, YYYY/MM."
            },
            maxdate:{
                type: "string",
                description: "Date range used to limit a search result by the date specified by datetype. The general date format is YYYY/MM/DD, and these variants are also allowed: YYYY, YYYY/MM."
            }

        },
        required: ["db", "cmd", "id", "dbfrom"]
    }
}

export const youtubeUploadVideoFunctionDefinition: FunctionDefinition = {
    name: "youtube_upload_video_post",
    description: "Uploading a YouTube video",
    parameters: {
        type: "object",
        properties: {
            userId: {
                type: "string",
                description: "User ID"
            },
            videoPath: {
                type: "string",
                description: "Path to the video file"
            },
            title: {
                type: "string",
                description: "Video title"
            },
            description: {
                type: "string",
                description: "Video description"
            },
            tags: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "Video tags"
            }
        },
        required: ["userId", "videoPath", "title", "description", "tags"]
    }
}

export const telegram_send_message: FunctionDefinition = {
  name: "telegram_send_message",
  description: "Send a message to a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user to send the chat response.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat to send the message to.",
      },
      text: {
        type: "string",
        description: "The text of the message to send.",
      },
    },
    required: ["userId", "chatId", "content"],
  },
};

export const telegram_send_photo: FunctionDefinition = {
  name: "telegram_send_photo",
  description: "Send a photo to a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat to send the photo to.",
      },
      photo: {
        type: "string",
        description: "The file_id, URL, or path to the photo to send.",
      },
      caption: {
        type: "string",
        description: "Photo caption, 0-1024 characters after entities parsing.",
      },
    },
    required: ["userId", "chatId", "photo"],
  },
};

export const telegram_get_all_chat_ids: FunctionDefinition = {
  name: "telegram_get_all_chat_ids",
  description: "Get all chat IDs from bot updates",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user to get chat IDs for.",
      },
    },
    required: ["userId"],
  },
};

export const telegram_delete_message: FunctionDefinition = {
  name: "telegram_delete_message",
  description: "Delete a message in a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat.",
      },
      messageId: {
        type: "number",
        description: "The ID of the message to delete.",
      },
    },
    required: ["userId", "chatId", "messageId"],
  },
};

export const telegram_delete_messages: FunctionDefinition = {
  name: "telegram_delete_messages",
  description: "Delete multiple messages in a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat.",
      },
      messageIds: {
        type: "array",
        items: {
          type: "number",
        },
        description: "The IDs of the messages to delete.",
      },
    },
    required: ["userId", "chatId", "messageIds"],
  },
};

export const telegram_edit_message_text: FunctionDefinition = {
  name: "telegram_edit_message_text",
  description: "Edit the text of a message in a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat.",
      },
      messageId: {
        type: "number",
        description: "The ID of the message to edit.",
      },
      inlineMessageId: {
        type: "string",
        description: "The ID of the inline message.",
      },
      text: {
        type: "string",
        description: "The new text of the message.",
      },
      parseMode: {
        type: "string",
        description: "Mode for parsing entities in the message text.",
      },
      entities: {
        type: "array",
        items: {
          type: "object",
        },
        description:
          "A JSON-serialized list of special entities that appear in message text.",
      },
      replyMarkup: {
        type: "object",
        description: "A JSON-serialized object for an inline keyboard.",
      },
    },
    required: ["userId", "text"],
  },
};

export const telegram_edit_message_media: FunctionDefinition = {
  name: "telegram_edit_message_media",
  description: "Edit the media of a message in a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat.",
      },
      messageId: {
        type: "number",
        description: "The ID of the message to edit.",
      },
      inlineMessageId: {
        type: "string",
        description: "The ID of the inline message.",
      },
      media: {
        type: "object",
        description:
          "A JSON-serialized object for a new media content of the message.",
      },
      replyMarkup: {
        type: "object",
        description: "A JSON-serialized object for an inline keyboard.",
      },
    },
    required: ["userId", "media"],
  },
};

export const telegram_get_chat: FunctionDefinition = {
  name: "telegram_get_chat",
  description: "Get up-to-date information about the chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat.",
      },
    },
    required: ["userId", "chatId"],
  },
};

export const telegram_send_audio: FunctionDefinition = {
  name: "telegram_send_audio",
  description: "Send an audio file to a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat to send the audio to.",
      },
      audio: {
        type: "string",
        description: "The file_id, URL, or path to the audio file to send.",
      },
      caption: {
        type: "string",
        description: "Audio caption, 0-1024 characters after entities parsing.",
      },
      performer: {
        type: "string",
        description: "Performer.",
      },
      title: {
        type: "string",
        description: "Track name.",
      },
      duration: {
        type: "number",
        description: "Duration of the audio in seconds.",
      },
    },
    required: ["userId", "chatId", "audio"],
  },
};

export const telegram_send_document: FunctionDefinition = {
  name: "telegram_send_document",
  description: "Send a document to a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat to send the document to.",
      },
      document: {
        type: "string",
        description: "The file_id, URL, or path to the document to send.",
      },
      caption: {
        type: "string",
        description:
          "Document caption, 0-1024 characters after entities parsing.",
      },
    },
    required: ["userId", "chatId", "document"],
  },
};

export const telegram_send_video: FunctionDefinition = {
  name: "telegram_send_video",
  description: "Send a video to a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat to send the video to.",
      },
      video: {
        type: "string",
        description: "The file_id, URL, or path to the video to send.",
      },
      caption: {
        type: "string",
        description: "Video caption, 0-1024 characters after entities parsing.",
      },
      duration: {
        type: "number",
        description: "Duration of the video in seconds.",
      },
      width: {
        type: "number",
        description: "Video width.",
      },
      height: {
        type: "number",
        description: "Video height.",
      },
    },
    required: ["userId", "chatId", "video"],
  },
};

export const telegram_send_poll: FunctionDefinition = {
  name: "telegram_send_poll",
  description: "Send a poll to a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat to send the poll to.",
      },
      question: {
        type: "string",
        description: "Poll question, 1-300 characters.",
      },
      options: {
        type: "array",
        items: {
          type: "string",
        },
        description: "A JSON-serialized list of 2-10 answer options.",
      },
      isAnonymous: {
        type: "boolean",
        description:
          "True, if the poll needs to be anonymous, defaults to True.",
      },
      type: {
        type: "string",
        description: "Poll type, “quiz” or “regular”, defaults to “regular”.",
      },
      allowsMultipleAnswers: {
        type: "boolean",
        description:
          "True, if the poll allows multiple answers, ignored for polls in quiz mode, defaults to False.",
      },
      correctOptionId: {
        type: "number",
        description:
          "0-based identifier of the correct answer option, required for polls in quiz mode.",
      },
      explanation: {
        type: "string",
        description:
          "Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll, 0-200 characters with at most 2 line feeds after entities parsing.",
      },
      openPeriod: {
        type: "number",
        description:
          "Amount of time in seconds the poll will be active after creation, 5-600.",
      },
      closeDate: {
        type: "number",
        description:
          "Point in time (Unix timestamp) when the poll will be automatically closed. Must be at least 5 and no more than 600 seconds in the future.",
      },
      isClosed: {
        type: "boolean",
        description: "Pass True if the poll needs to be immediately closed.",
      },
    },
    required: ["userId", "chatId", "question", "options"],
  },
};

export const telegram_send_chat_action: FunctionDefinition = {
  name: "telegram_send_chat_action",
  description: "Send a chat action to a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat to send the chat action to.",
      },
      action: {
        type: "string",
        description:
          "Type of action to broadcast. Choose one of 'typing', 'upload_photo', 'record_video', 'upload_video', 'record_voice', 'upload_voice', 'upload_document', 'choose_sticker', 'find_location', 'record_video_note', or 'upload_video_note'.",
      },
    },
    required: ["userId", "chatId", "action"],
  },
};

export const telegram_set_message_reaction: FunctionDefinition = {
  name: "telegram_set_message_reaction",
  description: "Set a reaction on a message in a Telegram chat",
  parameters: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user initiating the request.",
      },
      chatId: {
        type: "string",
        description: "The ID of the Telegram chat.",
      },
      messageId: {
        type: "number",
        description: "The ID of the message to react to.",
      },
      reaction: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "A JSON-serialized list of reactions to set on the message.",
      },
      isBig: {
        type: "boolean",
        description: "Pass True to set the reaction with a big animation.",
      },
    },
    required: ["userId", "chatId", "messageId", "reaction"],
  },
};

export const tiktokUploadVideoFunctionDefinition: FunctionDefinition = {
    name: "tiktok_upload_video_post",
    description: "Upload a Tiktok video",
    parameters: {
        type: "object",
        properties: {
            userId: {
                type: "string",
                description: "User ID"
            },
            title: {
                type: "string",
                description: "The video caption. Hashtags (#) and mentions (@) will be matched, or deliminated by spaces or new lines."
            },
        },
        required: ["userId", "title"]
    }
}
