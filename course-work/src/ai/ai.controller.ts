import { Controller, Get, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get()
  async getHello() {
    return this.aiService.getHello();
  }

  @Post('echo')
  async sendData(@Body() data: any) {
    return this.aiService.sendData(data);
  }
}
