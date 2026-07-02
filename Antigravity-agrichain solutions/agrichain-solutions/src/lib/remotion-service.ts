import { logger } from '@/lib/logger';
import { spawn } from 'child_process';
import { S3 } from 'aws-sdk';
import path from 'path';

/**
 * Remotion video rendering service
 * Uses `npx remotion render` to generate a video and optionally uploads it to S3.
 */
export class RemotionService {
  /** Render a Remotion composition to a file */
  async render(options: {
    compositionId: string;
    entryPoint: string; // path to the entry file (e.g., src/remotion/Video.tsx)
    outputName: string; // without extension
    codec?: 'h264' | 'vp8' | 'vp9';
    width?: number;
    height?: number;
    fps?: number;
    durationInFrames?: number;
  }) {
    const {
      compositionId,
      entryPoint,
      outputName,
      codec = 'h264',
      width = 1080,
      height = 1920,
      fps = 30,
      durationInFrames,
    } = options;

    const outputPath = path.resolve('public', `${outputName}.mp4`);
    const args = [
      'remotion',
      'render',
      entryPoint,
      compositionId,
      '--codec',
      codec,
      '--width',
      String(width),
      '--height',
      String(height),
      '--fps',
      String(fps),
      '--output',
      outputPath,
    ];
    if (durationInFrames) {
      args.push('--frames', `${0}-${durationInFrames - 1}`);
    }

    logger.info('[Remotion] Starting render', { compositionId, outputPath });
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('npx', args, { stdio: 'inherit', shell: true });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`Remotion render exited with code ${code}`));
      });
    });

    logger.info('[Remotion] Render completed', { outputPath });
    return outputPath;
  }

  /** Upload rendered video to S3 (or Vercel Blob) */
  async uploadToS3(filePath: string, bucket: string, key: string) {
    const s3 = new S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const fileStream = require('fs').createReadStream(filePath);
    const params = {
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: 'video/mp4',
    };
    logger.info('[Remotion] Uploading video to S3', { bucket, key });
    await s3.upload(params).promise();
    logger.info('[Remotion] Upload successful');
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
}

export const remotionService = new RemotionService();
