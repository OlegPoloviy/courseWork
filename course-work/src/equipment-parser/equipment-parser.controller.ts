import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { EquipmentParserService } from './equipment-parser.service';
import { ParseResult } from './equipment-parser.service';

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
  ): Promise<ParseResult> {
    this.logger.log('Starting equipment parsing...');

    try {
      const result = await this.parserService.startParsing(options);
      return result;
    } catch (error) {
      this.logger.error('Parsing failed:', error.message);
      throw error;
    }
  }

  @Post('parse-wikipedia')
  async parseWikipedia(
    @Body() body: { categoryUrl: string },
  ): Promise<ParseResult> {
    try {
      const result = await this.parserService.startParsing({
        sources: ['wikipedia'],
      });
      return result;
    } catch (error) {
      this.logger.error('Wikipedia parsing failed:', error.message);
      throw error;
    }
  }

  @Post('parse-military-today')
  async parseMilitaryToday(): Promise<ParseResult> {
    try {
      const result = await this.parserService.startParsing({
        sources: ['military-today'],
      });
      return result;
    } catch (error) {
      this.logger.error('Military Today parsing failed:', error.message);
      throw error;
    }
  }

  @Post('quick-populate')
  async quickPopulate(): Promise<ParseResult> {
    try {
      const result = await this.parserService.startParsing({
        maxItems: 10,
        sources: ['wikipedia'],
      });
      return result;
    } catch (error) {
      this.logger.error('Quick population failed:', error.message);
      throw error;
    }
  }

  @Get('status')
  getParserStatus() {
    return {
      status: 'ready',
      availableSources: ['wikipedia', 'army-technology'],
      message: 'Parser is ready to collect equipment data',
    };
  }
}
