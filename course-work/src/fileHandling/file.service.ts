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

  async uploadFileToAWS(file: Express.Multer.File): Promise<{ url: string }> {
    const bucketName = process.env.AWS_S3_BUCKET;
    const key = `uploads/${Date.now()}-search`;

    // Compress the file buffer using gzip
    const compressedBuffer = await gzipAsync(file.buffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: compressedBuffer,
      ContentType: file.mimetype,
      ContentEncoding: 'gzip', // Add this header to indicate the content is compressed
    });

    await this.s3Client.send(command);

    console.log(`File compressed and uploaded successfully. ${key}`);
    return {
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }

  // Optional: Method that allows choosing whether to compress or not
  async uploadFileToAWSWithOptions(
    file: Express.Multer.File,
    options: { compress?: boolean } = {},
  ): Promise<{ url: string }> {
    const bucketName = process.env.AWS_S3_BUCKET;
    const key = `uploads/${Date.now()}-search`;

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
    };
  }
}
