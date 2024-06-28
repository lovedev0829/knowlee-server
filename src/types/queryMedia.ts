export interface CreateAudioResponse {
  status: string;
  transcriptionId: string;
  contentLength: number;
  wordCount: number;
}

export interface GetAudioResponse {
  voice: string;
  converted: boolean;
  audioDuration: number;
  audioUrl: string;
  message: string;
}

export interface CreateImageResponse {
  code: number;
  msg: string;
  data: {
    task_id: string;
  };
}

export interface GetImageResponse {
  code: number;
  msg: string;
  data: {
    status: number;
    progress: number;
    eta_relative: number;
    imgs: string[];
    info: string;
    failed_reason: string;
    current_images: null;
    submit_time: string;
    execution_time: string;
    txt2img_time: string;
    finish_time: string;
    debug_info: {
      submit_time_ms: number;
      execution_time_ms: number;
      txt2img_time_ms: number;
      finish_time_ms: number;
    };
  };
}

export interface CreateVideoResponse {
  jobId: string;
  success: boolean;
  data: {
    job_id: string;
  };
}

export interface GetVideoResponse {
  success: boolean;
  data: VideoData;
  job_id: string;
}


export interface VideoData {
  renderParams: VideoRenderParams;
  preview: string;
}
export interface VideoRenderParams {
  audio: Audio;
  output: Output;
  scenes: Scene[];
  next_generation_video: boolean;
  containsTextToImage: boolean;
}

interface RenderParams {
  audio: Audio;
  output: Output;
  scenes: Scene[];
  next_generation_video: boolean;
  containsTextToImage: boolean;
}

interface Audio {
  video_volume: number;
  audio_id: string;
  audio_library: string;
  src: string;
  track_volume: number;
  tts: string;
}

interface Output {
  name: string;
  description: string;
  format: string;
  title: string;
  height: number;
  width: number;
}

interface Scene {
  background: Background;
  time: number;
  keywords: any[];
  sub_scenes: SubScene[];
  music: boolean;
  tts: boolean;
  subtitle: boolean;
  subtitles: Subtitle[];
}

interface Background {
  src: Src[];
  color: string;
  bg_animation: BgAnimation;
}

interface BgAnimation {
  animation: string;
}

interface Src {
  url: string;
  asset_id: number;
  type: string;
  library: string;
  mode: string;
  frame: null;
  loop_video: boolean;
  mute: boolean;
  resource_id: number;
  sessionId: string;
}

interface SubScene {
  time: number;
  location: Location;
  displayItems: any[];
  text_lines: TextLine[];
  subtitle: string;
  showSceneNumber: string;
  font: Font;
}

interface Font {
  name: string;
  size: number;
  line_spacing: number;
  color: string;
  backcolor: string;
  keycolor: string;
  textShadowColor: string;
  textShadowWidthFr: number;
  line_height: number;
  case: null;
  decoration: any[];
  fullWidth: boolean;
}

interface Location {
  start_x: number;
  start_y: number;
}

interface TextLine {
  text: string;
  text_animation: TextAnimation[];
  text_bg_animation: TextAnimation[];
}

interface TextAnimation {
  animation: string;
  source: string;
  speed: number;
  type: string;
}

interface Subtitle {
  text: string;
  time: number;
}

export interface GetVideoRender {
  job_id: string;
  success: boolean;
  data: {
    preview: string;
    txtFile: string;
    audioURL: string;
    thumbnail: string;
    videoDuration: number;
    videoURL: string;
    vttFile: string;
    srtFile: string;
    shareVideoURL: string;
    status: string;
  };
}
