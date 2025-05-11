import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/fileHandling/file.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  async getHello() {
    return this.aiService.getHello();
  }

  @Post('echo')
  async sendData(@Body() data: any) {
    return this.aiService.sendData(data);
  }

  @Get('stats')
  async getStats() {
    return this.aiService.getStats();
  }

  @Post('clear')
  async clearVectors() {
    return this.aiService.clearVectors();
  }

  @Post('upload-and-embed')
  @UseInterceptors(FileInterceptor('image'))
  async uploadAndEmbed(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: any,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No image file provided');
      }

      const uploadResult = await this.fileService.uploadFileToAWSWithOptions(
        file,
        { compress: false },
      );

      if (!uploadResult?.url) {
        throw new BadRequestException('File upload failed - no URL returned');
      }

      const s3KeyMatch = uploadResult.url.split('.com/');
      const s3Key = s3KeyMatch.length > 1 ? s3KeyMatch[1] : uploadResult.url;

      console.log('Creating embedding with S3 key:', s3Key);

      return this.aiService.createEmbedding({
        image_source: s3Key,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Upload and embed error:', error);
      throw error;
    }
  }

  @Post('embed')
  async createEmbedding(
    @Body() data: { image_source: string; metadata?: any },
  ) {
    try {
      if (!data.image_source) {
        throw new BadRequestException('No image source provided');
      }

      if (
        data.image_source.startsWith('http') ||
        data.image_source.startsWith('uploads/')
      ) {
        console.warn(
          'Warning: image_source should be an S3 key for optimal performance',
        );
      }

      console.log('Creating embedding with S3 key:', data.image_source);
      return this.aiService.createEmbedding(data);
    } catch (error) {
      console.error('Embedding error:', error);
      throw error;
    }
  }

  @Post('bulk-embed')
  async bulkEmbed(
    @Body()
    data: {
      images: Array<{
        image_source: string;
        metadata?: any;
        image_id?: string;
      }>;
    },
  ) {
    if (
      !data.images ||
      !Array.isArray(data.images) ||
      data.images.length === 0
    ) {
      throw new BadRequestException('Invalid images array');
    }

    for (const img of data.images) {
      if (!img.image_source) {
        throw new BadRequestException(
          'Each image must have an image_source (S3 key)',
        );
      }
    }

    return this.aiService.bulkEmbed(data);
  }

  @Post('search/image')
  @UseInterceptors(FileInterceptor('image'))
  async searchByImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('top_k') topK: string = '5',
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const uploadResult = await this.fileService.uploadFileToAWSWithOptions(
      file,
      { compress: false },
    );

    if (!uploadResult?.url) {
      throw new BadRequestException('File upload failed - no URL returned');
    }

    const s3KeyMatch = uploadResult.url.split('.com/');
    const s3Key = s3KeyMatch.length > 1 ? s3KeyMatch[1] : uploadResult.url;

    return this.aiService.searchBySimilarImage({
      image_source: s3Key,
      top_k: parseInt(topK, 10),
    });
  }

  @Post('search/text')
  async searchByText(
    @Body() data: { text_query: string },
    @Query('top_k') topK: string = '5',
  ) {
    if (!data.text_query) {
      throw new BadRequestException('Text query is required');
    }
    return this.aiService.searchByText({
      text_query: data.text_query,
      top_k: parseInt(topK, 10),
    });
  }
}
