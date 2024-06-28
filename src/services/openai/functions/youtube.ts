import {
    uploadVideo
} from "../../../lib/youtube/youtube.services";

import {
    User
} from "../../../models/user.model";


interface youtubeParams{
    title: string,
    description: string,
    videoPath: string,
    tags: Array<string>,
}

export async function youtubeUploadVideoFunction({
    user,
    ...params
    } : {
        user: User;
    }&youtubeParams) {
        try {
            if (!user) return "please provide user";
            const { id: userId } = user;
            const { title, description, tags, videoPath } = params;
            const uploadYoutube = await uploadVideo({ userId, videoPath, title, description, tags });
            return uploadYoutube;
        } catch (error: any) {
            return error?.message;
        }
}