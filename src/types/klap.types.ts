export type KlapVideo = {
    id: string;
    created_at: string;
    youtube_vid: string;
    status: string;
    title: string;
    description: string;
    error_code: null | string;
    duration: number;
    detected_language: string;
    translate_to: null | string;
    src_url: string;
    src_frame_count: number;
    src_fps: number;
    src_width: number;
    src_height: number;
    lowres_src_url: string;
    lowres_src_fps: number;
    lowres_src_frame_count: number;
    lowres_src_width: number;
    lowres_src_height: number;
};

export type KlapVideoClip = {
    id: string;
    created_at: string;
    name: string;
    video_id: string;
    virality_score: number;
    virality_score_explanation: string;
    preset_id: string;
    dimensions_width: number;
    dimensions_height: number;
    duration_seconds: number;
};

export type KlapExportedClip = {
    id: string;
    created_at: string;
    clip_id: string;
    video_id: string;
    author_id: string;
    name: string;
    src_url: string;
    progress: number;
    status: string;
};