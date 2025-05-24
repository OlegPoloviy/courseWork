import { EquipmentDTO } from './DTO/EquipmentDTO';
import { Controller, Get, UseGuards, Post, Body, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { JWTGUard } from '../auth/guards/jwt.auth.guard';

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
    const newEquipment = await this.equipmentService.createEquipment(equipment);
    return {
      message: 'Equipment created successfully',
      equipment: newEquipment,
    };
  }

  @UseGuards(JWTGUard)
  @Get('/search')
  async search(@Query() params) {
    return this.equipmentService.findEquipment(params);
  }
}
