import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EquipmentDTO } from './DTO/EquipmentDTO';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<EquipmentDTO[]> {
    const equipment = await this.prisma.militaryEquipment.findMany();

    if (!equipment) {
      throw new Error('No equipment available');
    }

    return equipment.map((e) => ({
      ...e,
      description: e.description ?? undefined,
      year: e.year ?? undefined,
      imageUrl: e.imageUrl ?? undefined,
    }));
  }

  async createEquipment(equipment: EquipmentDTO): Promise<EquipmentDTO> {
    try {
      const newEquipment = await this.prisma.militaryEquipment.create({
        data: {
          ...equipment,
        },
      });

      return {
        ...newEquipment,
        description: newEquipment.description ?? undefined,
        year: newEquipment.year ?? undefined,
        imageUrl: newEquipment.imageUrl ?? undefined,
      };
    } catch (err) {
      console.error('Failed to create equipment:', err);
      throw new Error('Could not create equipment');
    }
  }
}
