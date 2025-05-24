import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import {
  ParseEquipmentCommand,
  QuickSeedCommand,
} from './equipment-parser.command';
import { EquipmentParserService } from '../equipment-parser/equipment-parser.service';
import { EquipmentService } from '../equipment/equipment.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    AiModule,
  ],
  providers: [
    PrismaService,
    EquipmentService,
    EquipmentParserService,
    ParseEquipmentCommand,
    QuickSeedCommand,
  ],
})
export class CliModule {}
