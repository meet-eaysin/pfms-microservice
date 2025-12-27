import type {
  IUserRepository,
  IStorageService,
  ICacheService,
} from '@/domain/interfaces/repository.interface';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

interface IUploadAvatarOptions {
  userId: string;
  file: Buffer;
  mimetype: string;
}

export class UploadAvatarUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly storage: IStorageService,
    private readonly cache: ICacheService
  ) {}

  async execute(options: IUploadAvatarOptions): Promise<string> {
    // Get current profile to check for existing avatar
    const profile = await this.repository.findProfileByUserId(options.userId);

    // Process image: resize to 512x512
    const processedImage = await sharp(options.file)
      .resize(512, 512, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to S3
    const key = `avatars/${options.userId}/${uuidv4()}.jpg`;
    const url = await this.storage.uploadFile({
      key,
      buffer: processedImage,
      contentType: 'image/jpeg',
    });

    // Update profile with new avatar URL
    await this.repository.updateProfile(options.userId, { avatarUrl: url });

    // Delete old avatar if exists
    if (profile?.avatarUrl !== null && profile?.avatarUrl !== undefined) {
      try {
        const oldKey = this.extractKeyFromUrl(profile.avatarUrl);
        await this.storage.deleteFile(oldKey);
      } catch {
        // Ignore deletion errors for old avatars
      }
    }

    // Invalidate cache
    await this.cache.del(`profile:${options.userId}`);

    return url;
  }

  private extractKeyFromUrl(url: string): string {
    const parts = url.split('/');
    return parts.slice(-3).join('/'); // avatars/{userId}/{filename}
  }
}
