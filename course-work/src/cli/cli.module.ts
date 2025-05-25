import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import {
  ParseEquipmentCommand,
  QuickSeedCommand,
} from './equipment-parser.command';
import { EquipmentParserService } from '../equipment-parser/equipment-parser.service';
import { AiModule } from '../ai/ai.module';
import { EquipmentService } from '../equipment/equipment.service';
import { FileService } from '../fileHandling/file.service';
import { FileModule } from '../fileHandling/file.module';
import { EquipmentModule } from '../equipment/equipment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    AiModule,
    FileModule,
    EquipmentModule,
  ],
  providers: [
    PrismaService,
    EquipmentService,
    EquipmentParserService,
    ParseEquipmentCommand,
    QuickSeedCommand,
    FileService,
  ],
})
export class CliModule {}
