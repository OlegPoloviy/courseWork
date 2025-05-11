import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(zlib.gzip);

@Injectable()
export class FileService {
  private s3Client: S3Client;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;

    if (!accessKeyId || !secretAccessKey || !region) {
      throw new Error('Missing AWS configuration in environment variables');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFileToAWS(
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    const bucketName = process.env.AWS_S3_BUCKET;
    const key = `uploads/${Date.now()}-${this.generateRandomString(8)}`;

    const compressedBuffer = await gzipAsync(file.buffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: compressedBuffer,
      ContentType: file.mimetype,
      ContentEncoding: 'gzip',
    });

    await this.s3Client.send(command);
    console.log(`File compressed and uploaded successfully. ${key}`);

    return {
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      key: key,
    };
  }

  async uploadFileToAWSWithOptions(
    file: Express.Multer.File,
    options: { compress?: boolean } = {},
  ): Promise<{ url: string; key: string }> {
    const bucketName = process.env.AWS_S3_BUCKET;
    const key = `uploads/${Date.now()}-${this.generateRandomString(8)}`;

    let fileBuffer = file.buffer;
    let contentEncoding: string | undefined;

    if (options.compress) {
      fileBuffer = await gzipAsync(file.buffer);
      contentEncoding = 'gzip';
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: file.mimetype,
      ContentEncoding: contentEncoding,
    });

    await this.s3Client.send(command);
    console.log(
      `File ${options.compress ? 'compressed and ' : ''}uploaded successfully. ${key}`,
    );

    return {
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      key: key,
    };
  }

  // Helper method to generate a random string
  private generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    return result;
  }
}
