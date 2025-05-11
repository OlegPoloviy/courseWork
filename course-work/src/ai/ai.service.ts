import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly pythonServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pythonServiceUrl =
      this.configService.get<string>('PYTHON_SERVICE_URL') ||
      'http://127.0.0.1:8080';
  }

  async getHello() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.pythonServiceUrl}/api/hello`),
      );
      return response.data;
    } catch (error) {
      console.error('Error communicating with Python service:', error);
      throw this.handleHttpError(error);
    }
  }

  async sendData(data: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonServiceUrl}/api/echo`, data),
      );
      return response.data;
    } catch (error) {
      console.error('Error communicating with Python service:', error);
      throw this.handleHttpError(error);
    }
  }

  async getStats() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.pythonServiceUrl}/api/stats`),
      );
      return response.data;
    } catch (error) {
      console.error('Error communicating with Python service:', error);
      throw this.handleHttpError(error);
    }
  }

  async clearVectors() {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonServiceUrl}/api/clear`),
      );
      return response.data;
    } catch (error) {
      console.error('Error communicating with Python service:', error);
      throw this.handleHttpError(error);
    }
  }

  async createEmbedding(data: { image_source: string; metadata?: any }) {
    try {
      // Валідація даних
      if (!data.image_source) {
        throw new HttpException(
          'image_source is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(
        'Sending embedding request to Python service with S3 key:',
        data,
      );
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonServiceUrl}/api/embed`, data),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error creating embedding:',
        error.response?.data || error.message,
      );
      throw this.handleHttpError(error);
    }
  }

  async bulkEmbed(data: {
    images: Array<{ image_source: string; metadata?: any; image_id?: string }>;
  }) {
    try {
      // Валідація даних
      if (
        !data.images ||
        !Array.isArray(data.images) ||
        data.images.length === 0
      ) {
        throw new HttpException(
          'Valid images array is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(
        `Sending bulk embed request for ${data.images.length} images`,
      );
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonServiceUrl}/api/bulk-embed`, data),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error in bulk embedding:',
        error.response?.data || error.message,
      );
      throw this.handleHttpError(error);
    }
  }

  async searchBySimilarImage(data: { image_source: string; top_k?: number }) {
    try {
      // Валідація даних
      if (!data.image_source) {
        throw new HttpException(
          'image_source is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const searchData = {
        query_type: 'image',
        image_source: data.image_source,
        top_k: data.top_k || 5,
      };

      console.log('Searching by image with S3 key:', data.image_source);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.pythonServiceUrl}/api/search`,
          searchData,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error searching by image:',
        error.response?.data || error.message,
      );
      throw this.handleHttpError(error);
    }
  }

  async searchByText(data: { text_query: string; top_k?: number }) {
    try {
      // Валідація даних
      if (!data.text_query) {
        throw new HttpException(
          'text_query is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const searchData = {
        query_type: 'text',
        text_query: data.text_query,
        top_k: data.top_k || 5,
      };

      console.log('Searching by text query:', data.text_query);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.pythonServiceUrl}/api/search`,
          searchData,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error searching by text:',
        error.response?.data || error.message,
      );
      throw this.handleHttpError(error);
    }
  }

  // Utility method for handling HTTP errors
  private handleHttpError(error: any) {
    if (error.response?.data) {
      return new HttpException(
        error.response.data,
        error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return new HttpException(
      'Failed to communicate with AI service',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
