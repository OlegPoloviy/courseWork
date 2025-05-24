import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EquipmentParserService } from './equipment-parser.service';
import { ParserController } from './equipment-parser.controller';
import { EquipmentService } from '../equipment/equipment.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 секунд таймаут для парсингу
      maxRedirects: 5,
    }),
  ],
  controllers: [ParserController],
  providers: [
    EquipmentParserService,
    EquipmentService,
    AiService,
    PrismaService,
  ],
  exports: [EquipmentParserService],
})
export class ParserModule {}
