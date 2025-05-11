import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  constructor(private httpService: HttpService) {}

  private readonly pythonApiUrl = process.env.PYTHON_URL;

  async getHello(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.pythonApiUrl}/api/hello`),
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error getting to the python service', 500);
    }
  }

  async sendData(data: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonApiUrl}/api/echo`, data),
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(`Error with sending data to the python`, 500);
    }
  }
}
