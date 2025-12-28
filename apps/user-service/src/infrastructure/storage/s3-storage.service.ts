import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IStorageService } from '@/domain/interfaces/repository.interface';
import type { StorageConfig } from '@/config';
import { createLogger } from '@pfms/config';

const logger = createLogger('S3Storage');

export class S3StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: StorageConfig) {
    this.client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY,
        secretAccessKey: config.S3_SECRET_KEY,
      },
      forcePathStyle: true, // Required for MinIO
      tls: config.S3_USE_SSL,
    });

    this.bucket = config.S3_BUCKET;
    logger.info('✅ S3 Storage initialized', {
      endpoint: config.S3_ENDPOINT,
      bucket: this.bucket,
    });
  }

  async uploadFile(options: { key: string; buffer: Buffer; contentType: string }): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: options.key,
        Body: options.buffer,
        ContentType: options.contentType,
      });

      await this.client.send(command);

      // Return the public URL
      const url = `${this.config.S3_ENDPOINT}/${this.bucket}/${options.key}`;
      logger.info('File uploaded', { key: options.key, url });
      return url;
    } catch (error) {
      logger.error('File upload failed', { error, key: options.key });
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      logger.info('File deleted', { key });
    } catch (error) {
      logger.error('File deletion failed', { error, key });
      throw new Error('Failed to delete file');
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 }); // 1 hour
      return url;
    } catch (error) {
      logger.error('Failed to generate signed URL', { error, key });
      throw new Error('Failed to generate signed URL');
    }
  }
}

export function createS3StorageService(config: StorageConfig): S3StorageService {
  return new S3StorageService(config);
}
