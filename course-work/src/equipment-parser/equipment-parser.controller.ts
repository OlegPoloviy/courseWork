import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import {
  EquipmentParserService,
  ParsedEquipmentData,
} from './equipment-parser.service';

@Controller('parser')
export class ParserController {
  private readonly logger = new Logger(ParserController.name);

  constructor(private readonly parserService: EquipmentParserService) {}

  @Post('start')
  async startParsing(
    @Body()
    options?: {
      sources?: string[];
      maxItems?: number;
      categories?: string[];
    },
  ) {
    this.logger.log('Starting equipment parsing...');

    try {
      const result = await this.parserService.startParsing(options);
      return result;
    } catch (error) {
      this.logger.error('Parsing failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('parse-wikipedia')
  async parseWikipedia(@Body() body: { categoryUrl: string }): Promise<{
    success: boolean;
    count: number;
    data: ParsedEquipmentData[];
    error?: string;
  }> {
    try {
      const result = await this.parserService.startParsing({
        sources: ['wikipedia'],
      });
      return {
        success: true,
        count: result.processed,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        data: [],
        error: error.message,
      };
    }
  }

  @Post('parse-military-today')
  async parseMilitaryToday(): Promise<{
    success: boolean;
    count: number;
    data: ParsedEquipmentData[];
    error?: string;
  }> {
    try {
      const result = await this.parserService.startParsing({
        sources: ['army-recognition'],
      });
      return {
        success: true,
        count: result.processed,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        data: [],
        error: error.message,
      };
    }
  }

  @Post('quick-populate')
  async quickPopulate(): Promise<{
    success: boolean;
    message: string;
    count: number;
    data: ParsedEquipmentData[];
    error?: string;
  }> {
    try {
      const result = await this.parserService.startParsing({
        maxItems: 10,
        sources: ['wikipedia'],
      });
      return {
        success: true,
        message: 'Quick population completed',
        count: result.processed,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Quick population failed',
        count: 0,
        data: [],
        error: error.message,
      };
    }
  }

  @Get('status')
  getParserStatus() {
    return {
      status: 'ready',
      availableSources: ['wikipedia', 'military-today', 'open-apis'],
      message: 'Parser is ready to collect equipment data',
    };
  }
}
