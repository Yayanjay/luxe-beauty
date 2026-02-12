import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { Multer } from 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      endpoint: config.get<string>('S3_ENDPOINT'),
      region: config.get<string>('S3_REGION', 'garage'),
      credentials: {
        accessKeyId: config.get<string>('S3_ACCESS_KEY_ID') ?? '',
        secretAccessKey: config.get<string>('S3_SECRET_ACCESS_KEY') ?? '',
      },
      forcePathStyle: true,
    });
    this.bucket = config.get<string>('S3_BUCKET_NAME') ?? 'luxe-beauty';
    this.publicUrl = config.get<string>('S3_PUBLIC_URL') ?? 'http://localhost:3900/luxe-beauty';
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const key = `products/${randomUUID()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    return { url: `${this.publicUrl}/${key}`, key };
  }
}
