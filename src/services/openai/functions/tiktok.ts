import { getTiktokTokenOfUser, postVideo } from "../../../lib/tiktok/tiktok.services";
import {
    User
} from "../../../models/user.model";

interface tiktokParams{
    title: string,
}

export async function tiktokUploadVideoFunction({
    user,
    ...params
    } : {
        user: User;
    }&tiktokParams) {
        try {
            if (!user) return "please provide user";
            const { id: userId } = user;
            const { title } = params;
            const token = await getTiktokTokenOfUser({ userId: userId });
            const {  access_token } = token;
            const result = await postVideo(title, userId, access_token);
            
            return result;
        } catch (error: any) {
            return error?.message;
        }
}