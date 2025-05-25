import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EquipmentDTO } from './DTO/EquipmentDTO';
import { Prisma } from '@prisma/client';
import { SearchDTO } from './DTO/SearchDTO';

@Injectable()
export class EquipmentService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService, //
  ) {}

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
      technicalSpecs: e.technicalSpecs ?? undefined,
    }));
  }

  async createEquipment(equipment: EquipmentDTO): Promise<EquipmentDTO> {
    try {
      console.log('Creating equipment:', {
        name: equipment.name,
        type: equipment.type,
        country: equipment.country,
        inService: equipment.inService,
      });

      const newEquipment = await this.prisma.militaryEquipment.create({
        data: {
          name: equipment.name,
          type: equipment.type,
          country: equipment.country,
          inService: equipment.inService,
          description: equipment.description,
          year: equipment.year,
          imageUrl: equipment.imageUrl,
          technicalSpecs: equipment.technicalSpecs,
        },
      });

      console.log('Equipment created successfully:', newEquipment.id);

      // Якщо є зображення, створюємо ембединг
      if (newEquipment.imageUrl) {
        try {
          console.log(
            `Creating embedding for equipment ID: ${newEquipment.id}`,
          );

          await this.aiService.createEmbedding({
            image_source: newEquipment.imageUrl,
            metadata: {
              equipment_id: newEquipment.id,
              name: newEquipment.name,
              type: newEquipment.type,
              country: newEquipment.country,
              ...(newEquipment.year && { year: newEquipment.year }),
              ...(newEquipment.description && {
                description: newEquipment.description,
              }),
            },
          });

          console.log(
            `Embedding created successfully for equipment ID: ${newEquipment.id}`,
          );
        } catch (embeddingError) {
          console.error(
            `Failed to create embedding for equipment ID: ${newEquipment.id}`,
            embeddingError,
          );
          // Не прокидуємо помилку далі, оскільки основний запис вже створено
        }
      }

      return {
        ...newEquipment,
        description: newEquipment.description ?? undefined,
        year: newEquipment.year ?? undefined,
        imageUrl: newEquipment.imageUrl ?? undefined,
        technicalSpecs: newEquipment.technicalSpecs ?? undefined,
      };
    } catch (err) {
      console.error('Failed to create equipment:', err);
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new Error(
            `Equipment with name "${equipment.name}" already exists`,
          );
        }
      }
      throw new Error(`Could not create equipment: ${err.message}`);
    }
  }

  async createEmbeddingForExistingEquipment(
    equipmentId: number,
  ): Promise<void> {
    try {
      const equipment = await this.prisma.militaryEquipment.findUnique({
        where: { id: equipmentId.toString() },
      });

      if (!equipment) {
        throw new Error(`Equipment with ID ${equipmentId} not found`);
      }

      if (!equipment.imageUrl) {
        throw new Error(`Equipment with ID ${equipmentId} has no image`);
      }

      await this.aiService.createEmbedding({
        image_source: equipment.imageUrl,
        metadata: {
          equipment_id: equipment.id,
          name: equipment.name,
          type: equipment.type,
          country: equipment.country,
          ...(equipment.year && { year: equipment.year }),
          ...(equipment.description && { description: equipment.description }),
        },
      });

      console.log(
        `Embedding created successfully for equipment ID: ${equipmentId}`,
      );
    } catch (error) {
      console.error(
        `Failed to create embedding for equipment ID: ${equipmentId}`,
        error,
      );
      throw error;
    }
  }

  async createEmbeddingsForMultipleEquipment(
    equipmentIds: number[],
  ): Promise<void> {
    try {
      const equipment = await this.prisma.militaryEquipment.findMany({
        where: {
          id: { in: equipmentIds.map((id) => id.toString()) },
          imageUrl: { not: null },
        },
      });

      if (equipment.length === 0) {
        throw new Error('No equipment found with images');
      }

      const images = equipment.map((eq) => ({
        image_source: eq.imageUrl!,
        image_id: eq.id.toString(),
        metadata: {
          equipment_id: eq.id,
          name: eq.name,
          type: eq.type,
          country: eq.country,
          ...(eq.year && { year: eq.year }),
          ...(eq.description && { description: eq.description }),
        },
      }));

      await this.aiService.bulkEmbed({ images });
      console.log(
        `Bulk embeddings created for ${equipment.length} equipment items`,
      );
    } catch (error) {
      console.error('Failed to create bulk embeddings:', error);
      throw error;
    }
  }

  async findEquipment(details: SearchDTO): Promise<EquipmentDTO[]> {
    try {
      const { query, name, type, description, inService, country, techSpecs } =
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
      if (query) {
        searchConditions.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { country: { contains: query, mode: 'insensitive' } },
          { technicalSpecs: { contains: query, mode: 'insensitive' } },
        ];
      }
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
        technicalSpecs: e.technicalSpecs ?? undefined,
      }));
    } catch (error) {
      console.error('Error occurred while searching for equipment:', error);
      throw new Error('Failed to search for equipment');
    }
  }

  async findSimilarEquipmentByImage(
    imageSource: string,
    topK: number = 5,
  ): Promise<any> {
    try {
      const similarImages = await this.aiService.searchBySimilarImage({
        image_source: imageSource,
        top_k: topK,
      });

      if (similarImages.results && similarImages.results.length > 0) {
        const equipmentIds = similarImages.results
          .map((result: any) => result.metadata?.equipment_id)
          .filter((id: any) => id !== undefined);

        if (equipmentIds.length > 0) {
          const equipmentDetails = await this.prisma.militaryEquipment.findMany(
            {
              where: { id: { in: equipmentIds } },
            },
          );

          return {
            ...similarImages,
            equipmentDetails: equipmentDetails.map((e) => ({
              ...e,
              description: e.description ?? undefined,
              year: e.year ?? undefined,
              imageUrl: e.imageUrl ?? undefined,
              technicalSpecs: e.technicalSpecs ?? undefined,
            })),
          };
        }
      }

      return similarImages;
    } catch (error) {
      console.error('Error searching for similar equipment by image:', error);
      throw new Error('Failed to search for similar equipment');
    }
  }

  async findByNameAndCountry(
    name: string,
    country: string,
  ): Promise<EquipmentDTO | null> {
    const equipment = await this.prisma.militaryEquipment.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        country: {
          equals: country,
          mode: 'insensitive',
        },
      },
    });

    if (!equipment) return null;

    return {
      ...equipment,
      description: equipment.description ?? undefined,
      year: equipment.year ?? undefined,
      imageUrl: equipment.imageUrl ?? undefined,
      technicalSpecs: equipment.technicalSpecs ?? undefined,
    };
  }
}
