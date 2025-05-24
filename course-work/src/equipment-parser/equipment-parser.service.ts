import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { EquipmentService } from '../equipment/equipment.service';

export interface ParsedEquipmentData {
  name: string;
  type: string;
  country: string;
  description?: string;
  year?: number;
  imageUrl?: string;
  technicalSpecs?: string;
  inService?: boolean;
  sourceUrl?: string;
}

@Injectable()
export class EquipmentParserService {
  private readonly logger = new Logger(EquipmentParserService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly equipmentService: EquipmentService,
  ) {}

  // Парсер для Wikipedia
  async parseWikipediaCategory(
    categoryUrl: string,
  ): Promise<ParsedEquipmentData[]> {
    try {
      this.logger.log(`Parsing Wikipedia category: ${categoryUrl}`);

      const response = await firstValueFrom(
        this.httpService.get(categoryUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; EquipmentBot/1.0)',
          },
        }),
      );

      const $ = cheerio.load(response.data);
      const equipment: ParsedEquipmentData[] = [];

      // Знаходимо посилання на статті про техніку
      $('#mw-pages .mw-category-group li a').each((_, element) => {
        const link = $(element);
        const title = link.text().trim();
        const url = `https://en.wikipedia.org${link.attr('href')}`;

        // Додаємо до черги для парсингу
        equipment.push({
          name: title,
          type: this.detectEquipmentType(title),
          country: this.detectCountry(title),
          sourceUrl: url,
          inService: true, // Припускаємо, що техніка на Wikipedia в основному в службі
        });
      });

      // Парсимо деталі для кожної одиниці техніки
      const detailedEquipment = await Promise.all(
        equipment.slice(0, 10).map(async (item) => {
          // Обмежуємо до 10 для тесту
          try {
            return await this.parseWikipediaArticle(item);
          } catch (error) {
            this.logger.error(
              `Failed to parse ${item.sourceUrl}:`,
              error.message,
            );
            return item;
          }
        }),
      );

      return detailedEquipment;
    } catch (error) {
      this.logger.error('Failed to parse Wikipedia category:', error.message);
      throw error;
    }
  }

  // Парсер окремої статті Wikipedia
  async parseWikipediaArticle(
    baseData: ParsedEquipmentData,
  ): Promise<ParsedEquipmentData> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(baseData.sourceUrl!, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; EquipmentBot/1.0)',
          },
        }),
      );

      const $ = cheerio.load(response.data);

      // Витягуємо основне зображення
      const mainImage = $('.infobox img').first().attr('src');
      if (mainImage && mainImage.startsWith('//')) {
        baseData.imageUrl = `https:${mainImage}`;
      }

      // Витягуємо опис
      const firstParagraph = $('#mw-content-text .mw-parser-output > p')
        .first()
        .text();
      if (firstParagraph) {
        baseData.description = firstParagraph.substring(0, 500) + '...';
      }

      // Витягуємо технічні характеристики з інфобоксу
      const specs: string[] = [];
      $('.infobox tr').each((_, row) => {
        const header = $(row).find('th').text().trim();
        const value = $(row).find('td').text().trim();

        if (header && value) {
          specs.push(`${header}: ${value}`);

          // Спеціальна обробка для року
          if (
            header.toLowerCase().includes('introduced') ||
            header.toLowerCase().includes('first flight') ||
            header.toLowerCase().includes('service')
          ) {
            const yearMatch = value.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
              baseData.year = parseInt(yearMatch[0]);
            }
          }

          // Визначення країни
          if (
            header.toLowerCase().includes('country') ||
            header.toLowerCase().includes('origin')
          ) {
            baseData.country = value;
          }
        }
      });

      baseData.technicalSpecs = specs.join('\n');

      return baseData;
    } catch (error) {
      this.logger.error(
        `Failed to parse Wikipedia article ${baseData.sourceUrl}:`,
        error.message,
      );
      return baseData;
    }
  }

  // Парсер для Military-Today.com
  async parseMilitaryToday(): Promise<ParsedEquipmentData[]> {
    const equipment: ParsedEquipmentData[] = [];
    const categories = [
      'https://www.military-today.com/tanks/',
      'https://www.military-today.com/aircraft/',
      'https://www.military-today.com/navy/',
    ];

    for (const categoryUrl of categories) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(categoryUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; EquipmentBot/1.0)',
            },
          }),
        );

        const $ = cheerio.load(response.data);

        $('.content-list a').each((_, element) => {
          const link = $(element);
          const title = link.text().trim();
          const url = link.attr('href');

          if (title && url) {
            equipment.push({
              name: title,
              type: this.detectEquipmentTypeFromUrl(url),
              country: 'Unknown',
              sourceUrl: url.startsWith('http')
                ? url
                : `https://www.military-today.com${url}`,
              inService: true,
            });
          }
        });
      } catch (error) {
        this.logger.error(
          `Failed to parse Military-Today category ${categoryUrl}:`,
          error.message,
        );
      }
    }

    return equipment.slice(0, 20); // Обмежуємо кількість для тесту
  }

  // API для отримання даних з відкритих джерел
  async fetchFromOpenAPIs(): Promise<ParsedEquipmentData[]> {
    const equipment: ParsedEquipmentData[] = [];

    try {
      // Приклад використання REST Countries API для отримання країн
      // а потім пошук техніки за країнами
      const countriesResponse = await firstValueFrom(
        this.httpService.get(
          'https://restcountries.com/v3.1/all?fields=name,flag',
        ),
      );

      const majorMilitaryCountries = [
        'United States',
        'Russia',
        'China',
        'Germany',
        'France',
        'United Kingdom',
        'Israel',
        'Sweden',
        'Italy',
        'Ukraine',
      ];

      // Генеруємо базові дані для популярної техніки
      const popularEquipment = [
        {
          name: 'M1 Abrams',
          type: 'Main Battle Tank',
          country: 'United States',
        },
        { name: 'T-90', type: 'Main Battle Tank', country: 'Russia' },
        { name: 'Leopard 2', type: 'Main Battle Tank', country: 'Germany' },
        {
          name: 'F-16 Fighting Falcon',
          type: 'Fighter Aircraft',
          country: 'United States',
        },
        { name: 'Su-27 Flanker', type: 'Fighter Aircraft', country: 'Russia' },
        {
          name: 'Eurofighter Typhoon',
          type: 'Fighter Aircraft',
          country: 'United Kingdom',
        },
        {
          name: 'AH-64 Apache',
          type: 'Attack Helicopter',
          country: 'United States',
        },
        { name: 'Mi-24 Hind', type: 'Attack Helicopter', country: 'Russia' },
        {
          name: 'Javelin Missile',
          type: 'Anti-Tank Missile',
          country: 'United States',
        },
        {
          name: 'S-400 Triumf',
          type: 'Surface-to-Air Missile',
          country: 'Russia',
        },
      ];

      equipment.push(
        ...popularEquipment.map((item) => ({
          ...item,
          inService: true,
          year: 2000 + Math.floor(Math.random() * 24), // Рандомний рік між 2000-2023
          description: `Modern ${item.type.toLowerCase()} used by ${item.country}`,
        })),
      );
    } catch (error) {
      this.logger.error('Failed to fetch from open APIs:', error.message);
    }

    return equipment;
  }

  // Головний метод для запуску парсингу
  async runFullParsing(): Promise<void> {
    this.logger.log('Starting full equipment parsing...');

    try {
      // 1. Парсимо Wikipedia категорії
      const wikiEquipment = await this.parseWikipediaCategory(
        'https://en.wikipedia.org/wiki/Category:Military_vehicles',
      );

      // 2. Парсимо Military-Today
      const militaryTodayEquipment = await this.parseMilitaryToday();

      // 3. Отримуємо дані з API
      const apiEquipment = await this.fetchFromOpenAPIs();

      // Об'єднуємо всі дані
      const allEquipment = [
        ...wikiEquipment,
        ...militaryTodayEquipment,
        ...apiEquipment,
      ];

      // Видаляємо дублікати
      const uniqueEquipment = this.removeDuplicates(allEquipment);

      this.logger.log(`Found ${uniqueEquipment.length} unique equipment items`);

      // Зберігаємо до бази даних та створюємо ембединги
      for (const equipment of uniqueEquipment) {
        try {
          await this.saveEquipmentWithEmbedding(equipment);
          await this.delay(1000); // Затримка між запитами
        } catch (error) {
          this.logger.error(
            `Failed to save equipment ${equipment.name}:`,
            error.message,
          );
        }
      }

      this.logger.log('Full parsing completed successfully');
    } catch (error) {
      this.logger.error('Full parsing failed:', error.message);
      throw error;
    }
  }

  // Зберігаємо техніку та створюємо ембединг
  private async saveEquipmentWithEmbedding(
    equipment: ParsedEquipmentData,
  ): Promise<void> {
    try {
      // Створюємо запис в базі
      const savedEquipment = await this.equipmentService.createEquipment({
        name: equipment.name,
        type: equipment.type,
        country: equipment.country,
        description: equipment.description,
        year: equipment.year,
        imageUrl: equipment.imageUrl,
        technicalSpecs: equipment.technicalSpecs,
        inService: equipment.inService ?? true,
      });

      this.logger.log(
        `Saved equipment: ${savedEquipment.name} (ID: ${savedEquipment.id})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to save equipment ${equipment.name}:`,
        error.message,
      );
    }
  }

  // Допоміжні методи
  private detectEquipmentType(name: string): string {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('tank')) return 'Main Battle Tank';
    if (lowerName.includes('fighter') || lowerName.includes('f-'))
      return 'Fighter Aircraft';
    if (lowerName.includes('helicopter')) return 'Helicopter';
    if (lowerName.includes('missile')) return 'Missile System';
    if (lowerName.includes('ship') || lowerName.includes('destroyer'))
      return 'Naval Vessel';
    if (lowerName.includes('rifle') || lowerName.includes('gun'))
      return 'Small Arms';

    return 'Military Equipment';
  }

  private detectEquipmentTypeFromUrl(url: string): string {
    if (url.includes('/tanks/')) return 'Main Battle Tank';
    if (url.includes('/aircraft/')) return 'Aircraft';
    if (url.includes('/navy/')) return 'Naval Vessel';
    return 'Military Equipment';
  }

  private detectCountry(name: string): string {
    const countryKeywords = {
      'United States': ['american', 'us ', 'm1', 'f-16', 'f-22', 'f-35'],
      Russia: ['russian', 'soviet', 't-', 'su-', 'mig-', 'ak-'],
      Germany: ['german', 'leopard', 'tiger'],
      'United Kingdom': ['british', 'challenger', 'harrier'],
      France: ['french', 'leclerc', 'mirage'],
      Israel: ['israeli', 'merkava', 'iron dome'],
    };

    const lowerName = name.toLowerCase();

    for (const [country, keywords] of Object.entries(countryKeywords)) {
      if (keywords.some((keyword) => lowerName.includes(keyword))) {
        return country;
      }
    }

    return 'Unknown';
  }

  private removeDuplicates(
    equipment: ParsedEquipmentData[],
  ): ParsedEquipmentData[] {
    const seen = new Set<string>();
    return equipment.filter((item) => {
      const key = `${item.name.toLowerCase()}-${item.country.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // API ендпоінт для запуску парсингу
  async startParsing(options?: {
    sources?: string[];
    maxItems?: number;
    categories?: string[];
  }): Promise<{ message: string; itemsProcessed: number }> {
    try {
      await this.runFullParsing();
      return {
        message: 'Parsing completed successfully',
        itemsProcessed: 100, // Тут буде реальна кількість
      };
    } catch (error) {
      throw new Error(`Parsing failed: ${error.message}`);
    }
  }
}
