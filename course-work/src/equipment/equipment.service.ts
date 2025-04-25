import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EquipmentDTO } from './DTO/EquipmentDTO';
import { Prisma } from '@prisma/client';
import { SearchDTO } from './DTO/SearchDTO';

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

  async findEquipment(details: SearchDTO): Promise<EquipmentDTO[]> {
    try {
      const { name, type, description, inService, country, techSpecs } =
        details;

      const searchConditions: Prisma.MilitaryEquipmentWhereInput = {
        ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
        ...(type ? { type: { contains: type, mode: 'insensitive' } } : {}),
        ...(description
          ? { description: { contains: description, mode: 'insensitive' } }
          : {}),
        ...(inService !== undefined ? { inService } : {}),
        ...(country
          ? { country: { contains: country, mode: 'insensitive' } }
          : {}),
        ...(techSpecs
          ? { techSpecs: { contains: techSpecs, mode: 'insensitive' } }
          : {}),
      };

      const equipment = await this.prisma.militaryEquipment.findMany({
        where: searchConditions,
      });

      if (!equipment || equipment.length === 0) {
        throw new Error('No equipment found matching the search criteria');
      }

      return equipment.map((e) => ({
        ...e,
        description: e.description ?? undefined,
        year: e.year ?? undefined,
        imageUrl: e.imageUrl ?? undefined,
      }));
    } catch (error) {
      console.error('Error occurred while searching for equipment:', error);
      throw new Error('Failed to search for equipment');
    }
  }
}
