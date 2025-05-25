import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { EquipmentParserService } from './equipment-parser.service';
import { EquipmentModule } from '../equipment/equipment.module';
import { AiModule } from '../ai/ai.module';
import { ParserController } from './equipment-parser.controller';
import { EquipmentService } from '../equipment/equipment.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule, ConfigModule, EquipmentModule, AiModule],
  controllers: [ParserController],
  providers: [
    EquipmentParserService,
    EquipmentService,
    AiService,
    PrismaService,
  ],
  exports: [EquipmentParserService],
})
export class EquipmentParserModule {}
