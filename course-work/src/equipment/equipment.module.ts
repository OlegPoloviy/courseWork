import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AiModule } from '../ai/ai.module';

@Module({
  providers: [EquipmentService],
  controllers: [EquipmentController],
  imports: [PrismaModule, JwtModule, AiModule],
})
export class EquipmentModule {}
