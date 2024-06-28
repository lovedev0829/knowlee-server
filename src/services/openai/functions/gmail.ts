import { gmail_v1 } from "googleapis";
import {
  gmailUsersGetProfile,
  gmailUsersMessagesAttachmentsGet,
  gmailUsersMessagesGet,
  gmailUsersMessagesList,
  gmailUsersMessagesSend,
  gmailUsersMessagesTrash,
  gmailUsersMessagesUntrash,
  gmailUsersThreadsGet,
  gmailUsersThreadsList,
  gmailUsersThreadsTrash,
  gmailUsersThreadsUntrash,
} from "../../../lib/google/gmail.services";
import {
  getGoogleOAuth2ClientOfUser,
} from "../../../lib/google/google.services";
import { User } from "../../../models/user.model";

export async function gmailUsersGetProfileFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Getprofile) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersGetProfile({ userId: gmailUserId, auth: auth, ...params });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersMessagesAttachmentsGetFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Messages$Attachments$Get) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersMessagesAttachmentsGet({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersMessagesGetFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Messages$Get) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersMessagesGet({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersMessagesListFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Messages$List) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersMessagesList({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersMessagesSendFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Messages$Send) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersMessagesSend({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersMessagesTrashFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Messages$Trash) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersMessagesTrash({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersMessagesUntrashFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Messages$Untrash) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersMessagesUntrash({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersThreadsGetFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Threads$Get) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersThreadsGet({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersThreadsListFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Threads$List) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersThreadsList({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersThreadsTrashFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Threads$Trash) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersThreadsTrash({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}

export async function gmailUsersThreadsUntrashFunction({
  user,
  gmailUserId = "me",
  ...params
}: {
  user: User;
  gmailUserId?: string;
} & gmail_v1.Params$Resource$Users$Threads$Untrash) {
  try {
    if (!user) return "please provide user";
    const { id: userId } = user;
    const auth = await getGoogleOAuth2ClientOfUser({ userId: userId });
    const res = await gmailUsersThreadsUntrash({
      userId: gmailUserId,
      auth: auth,
      ...params,
    });
    return res;
  } catch (error: any) {
    // console.log("error----->", error);
    return error?.message;
  }
}
