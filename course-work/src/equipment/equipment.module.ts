import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [EquipmentService],
  controllers: [EquipmentController],
  imports: [PrismaModule, JwtModule],
})
export class EquipmentModule {}
