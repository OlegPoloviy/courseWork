import { EquipmentDTO } from './DTO/EquipmentDTO';
import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { JWTGUard } from 'src/auth/guards/jwt.auth.guard';

@Controller('equipment')
export class EquipmentController {
  constructor(private equipmentService: EquipmentService) {}

  @UseGuards(JWTGUard)
  @Get()
  async findAll() {
    return this.equipmentService.findAll();
  }

  @UseGuards(JWTGUard)
  @Post()
  async create(@Body() equipment: EquipmentDTO) {
    return this.equipmentService.createEquipment(equipment);
  }
}
