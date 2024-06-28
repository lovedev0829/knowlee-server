const ffmpeg = require('fluent-ffmpeg');
import ytdl from 'ytdl-core';
import ffm from "@ffmpeg-installer/ffmpeg";
const ffmpegPath = ffm.path;
ffmpeg.setFfmpegPath(ffmpegPath);

export function extractFrames(
  videoPath: string,
  outputPath: string,
  frameRate = 1
) {
  return new Promise((resolve, reject) => {
    const stream = ytdl(videoPath, { quality: 'highestvideo' });

    ffmpeg(stream)
      .outputOptions([`-vf fps=${frameRate}`])
      .output(`${outputPath}/frame-%03d.jpeg`)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
