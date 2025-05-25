import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { EquipmentService } from '../equipment/equipment.service';
import { FileService } from '../fileHandling/file.service';
import { EquipmentDTO } from '../equipment/DTO/EquipmentDTO';

// Інтерфейси для сервісів
export interface IEquipmentService {
  createEquipment(
    equipment: EquipmentDTO,
  ): Promise<EquipmentDTO & { id: string }>;
  findByNameAndCountry?(name: string, country: string): Promise<any>;
}

export interface IS3Service {
  uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string>;
}

export interface ParsedEquipmentData {
  name: string;
  type: string;
  category: string;
  country: string;
  manufacturer?: string;
  inService?: string;
  crew?: string;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  engine?: string;
  speed?: string;
  range?: string;
  armor?: string;
  armament?: string[];
  description?: string;
  imageUrl?: string;
  source: string;
  sourceUrl: string;
}

export interface ParseOptions {
  sources?: string[];
  maxItems?: number;
  categories?: string[];
  dryRun?: boolean;
}

export interface ParseResult {
  processed: number;
  success: number;
  failed: number;
  data?: ParsedEquipmentData[];
  errors?: string[];
}

// Регулярні вирази для фільтрації та класифікації
const EQUIPMENT_PATTERNS = {
  // Патерни для визначення типу техніки
  types: {
    tank: /(main battle tank|mbt|tank|танк|танки|бронетанкова техніка|бронетанкові війська)/i,
    ifv: /(infantry fighting vehicle|ifv|бмп|бмд|бойова машина піхоти)/i,
    apc: /(armoured personnel carrier|apc|бтр|бронетранспортер)/i,
    artillery:
      /(self-propelled artillery|howitzer|artillery|артилерія|самохідна артилерійська установка)/i,
    aircraft:
      /(fighter aircraft|military aircraft|aircraft|літак|військовий літак)/i,
    helicopter: /(military helicopter|helicopter|вертоліт|бойовий вертоліт)/i,
    naval:
      /(naval ship|destroyer|frigate|submarine|корабель|військовий корабель)/i,
  },
  // Патерни для визначення країни
  countries: {
    usa: /(united states|usa|us|american|американський|сша)/i,
    russia: /(russian|soviet|ussr|російський|радянський)/i,
    ukraine: /(ukrainian|ukraine|український|україна)/i,
    germany: /(german|germany|німецький|німеччина)/i,
    france: /(french|france|французький|франція)/i,
    uk: /(british|united kingdom|uk|британський|велика британія)/i,
    china: /(chinese|china|китайський|китай)/i,
    israel: /(israeli|israel|ізраїльський|ізраїль)/i,
    turkey: /(turkish|turkey|турецький|туреччина)/i,
    southKorea:
      /(south korean|south korea|rok|південнокорейський|південна корея)/i,
    japan: /(japanese|japan|японський|японія)/i,
    india: /(indian|india|індійський|індія)/i,
  },
  // Патерни для фільтрації небажаного контенту
  exclude: {
    prototypes: /(prototype|concept|experimental|прототип|експериментальний)/i,
    cancelled:
      /(cancelled|abandoned|never built|скасований|не був побудований)/i,
    obsolete:
      /(obsolete|retired|decommissioned|застарілий|знятий з озброєння)/i,
    civilian: /(civilian|commercial|passenger|цивільний|комерційний)/i,
  },
  // Патерни для відомих моделей танків
  knownTanks: {
    usa: /(m1 abrams|m1a1|m1a2|m60|m48|m47|m46|m26|m4 sherman)/i,
    russia: /(t-14 armata|t-90|t-80|t-72|t-64|t-62|t-55|t-34|is-2|kv-1)/i,
    ukraine: /(t-84 oplot|t-84|t-80ud|t-64bm bulat|t-64bv|t-64bm)/i,
    germany: /(leopard 2|leopard 1|panther|tiger|tiger ii|pz iv|pz iii)/i,
    uk: /(challenger 2|challenger 1|chieftain|centurion|cromwell|churchill)/i,
    france: /(leclerc|amx-56|amx-40|amx-30|amx-13)/i,
    israel: /(merkava|merkava iv|merkava iii|merkava ii|merkava i)/i,
    china: /(type 99|type 96|type 90|type 85|type 80|type 69|type 59)/i,
    southKorea: /(k2 black panther|k1|k1a1|k1a2)/i,
    japan: /(type 10|type 90|type 74|type 61)/i,
  },
};

// Конфігурація джерел
export interface Sources {
  name: string;
  baseUrl: string;
  searchPatterns: string[];
}

@Injectable()
export class EquipmentParserService {
  private readonly logger = new Logger(EquipmentParserService.name);

  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly fileService: FileService,
  ) {}

  // Конфігурація джерел
  private readonly sources: { [key: string]: Sources } = {
    wikipedia: {
      name: 'Wikipedia',
      baseUrl: 'https://en.wikipedia.org',
      searchPatterns: [
        'Category:Main_battle_tanks',
        'Category:Main_battle_tanks_by_country',
        'Category:Main_battle_tanks_of_the_United_States',
        'Category:Main_battle_tanks_of_Russia',
        'Category:Main_battle_tanks_of_Ukraine',
        'Category:Main_battle_tanks_of_Germany',
        'Category:Main_battle_tanks_of_the_United_Kingdom',
        'Category:Main_battle_tanks_of_France',
        'Category:Main_battle_tanks_of_Israel',
        'Category:Main_battle_tanks_of_China',
        'Category:Main_battle_tanks_of_South_Korea',
        'Category:Main_battle_tanks_of_Japan',
        'Category:Main_battle_tanks_of_India',
        'Category:Military_vehicles',
        'Category:Military_aircraft',
        'Category:Military_ships',
        'Category:Military_helicopters',
      ],
    },
    'army-recognition': {
      name: 'Army Recognition',
      baseUrl: 'https://www.armyrecognition.com',
      searchPatterns: [
        '/weapon/tanks',
        '/weapon/ifv',
        '/weapon/apc',
        '/weapon/artillery',
        '/weapon/air-defense',
        '/weapon/aircraft',
        '/weapon/helicopters',
        '/weapon/navy',
      ],
    },
    'military-today': {
      name: 'Military Today',
      baseUrl: 'https://www.military-today.com',
      searchPatterns: [
        '/tanks',
        '/aircraft',
        '/helicopters',
        '/navy',
        '/artillery',
        '/apc',
        '/ifv',
      ],
    },
  };

  private readonly listPages = {
    tanks: [
      'List_of_main_battle_tanks_by_country',
      'List_of_main_battle_tanks',
      'List_of_tanks_of_the_Soviet_Union',
      'List_of_tanks_of_the_United_States',
      'List_of_tanks_of_the_United_Kingdom',
      'List_of_tanks_of_Germany',
      'List_of_tanks_of_France',
      'List_of_tanks_of_Israel',
      'List_of_tanks_of_China',
      'List_of_tanks_of_Ukraine',
    ],
    aircraft: [
      'List_of_active_United_States_military_aircraft',
      'List_of_active_Russian_military_aircraft',
      'List_of_active_Ukrainian_military_aircraft',
      'List_of_active_United_Kingdom_military_aircraft',
      'List_of_active_French_military_aircraft',
      'List_of_active_German_military_aircraft',
    ],
    helicopters: [
      'List_of_active_United_States_military_aircraft',
      'List_of_active_Russian_military_aircraft',
      'List_of_active_Ukrainian_military_aircraft',
    ],
  };

  async startParsing(options: ParseOptions = {}): Promise<ParseResult> {
    const {
      sources = ['wikipedia'],
      maxItems = 1000,
      categories = [],
      dryRun = false,
    } = options;

    this.logger.log(`🔍 Starting parsing with sources: ${sources.join(', ')}`);
    this.logger.log(`📊 Max items: ${maxItems}, Dry run: ${dryRun}`);

    const allData: ParsedEquipmentData[] = [];
    const errors: string[] = [];
    let totalProcessed = 0;
    let totalSuccess = 0;

    // Спочатку парсимо списки техніки
    for (const [type, pages] of Object.entries(this.listPages)) {
      for (const page of pages) {
        try {
          const url = `${this.sources.wikipedia.baseUrl}/wiki/${page}`;
          this.logger.log(`📋 Parsing equipment list: ${page}`);

          const listData = await this.parseEquipmentList(url);
          allData.push(...listData);

          totalProcessed += listData.length;
          totalSuccess += listData.length;

          this.logger.log(`✅ ${page}: ${listData.length} items parsed`);

          if (allData.length >= maxItems) break;
        } catch (error) {
          const errorMsg = `Failed to parse list ${page}: ${error.message}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }
    }

    // Потім парсимо категорії, якщо потрібно
    if (allData.length < maxItems) {
      for (const source of sources) {
        try {
          this.logger.log(`🌐 Parsing from ${source}...`);

          let sourceData: ParsedEquipmentData[] = [];

          switch (source.toLowerCase()) {
            case 'wikipedia':
              sourceData = await this.parseWikipedia(
                maxItems - allData.length,
                categories,
              );
              break;
            case 'army-recognition':
              sourceData = await this.parseArmyRecognition(
                maxItems - allData.length,
              );
              break;
            case 'military-today':
              sourceData = await this.parseMilitaryToday(
                maxItems - allData.length,
              );
              break;
          }

          allData.push(...sourceData);
          totalProcessed += sourceData.length;
          totalSuccess += sourceData.length;

          this.logger.log(`✅ ${source}: ${sourceData.length} items parsed`);
        } catch (error) {
          const errorMsg = `Failed to parse ${source}: ${error.message}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }
    }

    // Save to database (if not dry run)
    if (!dryRun && allData.length > 0) {
      try {
        await this.saveToDatabaseBatch(allData, 10);
        this.logger.log(`💾 Database save process completed`);
      } catch (error) {
        this.logger.error(`❌ Failed to save to database: ${error.message}`);
        errors.push(`Database save failed: ${error.message}`);
      }
    }

    return {
      processed: totalProcessed,
      success: totalSuccess,
      failed: errors.length,
      data: allData,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private async parseEquipmentList(
    url: string,
  ): Promise<ParsedEquipmentData[]> {
    const equipmentData: ParsedEquipmentData[] = [];

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Equipment-Parser/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      // Шукаємо таблиці з технікою
      $('table.wikitable').each((_, table) => {
        const rows = $(table).find('tr');

        // Пропускаємо заголовок таблиці
        rows.slice(1).each((_, row) => {
          const cells = $(row).find('td, th');
          if (cells.length < 2) return;

          // Отримуємо назву з першої клітинки
          const nameCell = $(cells[0]);
          const name = nameCell.text().trim();
          const link = nameCell.find('a').attr('href');

          if (!name || !link) return;

          // Визначаємо тип техніки з URL
          const type = this.determineTypeFromUrl(url);

          // Визначаємо країну з URL або таблиці
          const country =
            this.determineCountryFromUrl(url) ||
            (cells[1] ? $(cells[1]).text().trim() : 'Unknown');

          // Додаємо базову інформацію
          const equipment: ParsedEquipmentData = {
            name,
            type,
            category: type,
            country,
            source: 'Wikipedia',
            sourceUrl: `${this.sources.wikipedia.baseUrl}${link}`,
          };

          // Додаємо додаткову інформацію з інших клітинок
          if (cells[2]) equipment.manufacturer = $(cells[2]).text().trim();
          if (cells[3]) equipment.inService = $(cells[3]).text().trim();
          if (cells[4]) equipment.crew = $(cells[4]).text().trim();
          if (cells[5]) equipment.weight = $(cells[5]).text().trim();
          if (cells[6])
            equipment.armament = this.parseArmament($(cells[6]).text().trim());

          equipmentData.push(equipment);
        });
      });

      // Додатково парсимо посилання на статті про кожну одиницю техніки
      for (const equipment of equipmentData) {
        try {
          const detailedInfo = await this.parseWikipediaArticle(
            equipment.sourceUrl,
          );
          if (detailedInfo) {
            // Оновлюємо інформацію з детальної статті
            Object.assign(equipment, detailedInfo);
          }
          await this.delay(300); // Затримка між запитами
        } catch (error) {
          this.logger.warn(
            `Failed to parse detailed article for ${equipment.name}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to parse equipment list ${url}: ${error.message}`,
      );
    }

    return equipmentData;
  }

  private determineTypeFromUrl(url: string): string {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('tank')) return 'Tank';
    if (lowerUrl.includes('aircraft')) return 'Aircraft';
    if (lowerUrl.includes('helicopter')) return 'Helicopter';
    return 'Other';
  }

  private determineCountryFromUrl(url: string): string {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('united_states') || lowerUrl.includes('american'))
      return 'USA';
    if (lowerUrl.includes('russian') || lowerUrl.includes('soviet'))
      return 'Russia';
    if (lowerUrl.includes('ukrainian') || lowerUrl.includes('ukraine'))
      return 'Ukraine';
    if (lowerUrl.includes('german') || lowerUrl.includes('germany'))
      return 'Germany';
    if (lowerUrl.includes('french') || lowerUrl.includes('france'))
      return 'France';
    if (lowerUrl.includes('united_kingdom') || lowerUrl.includes('british'))
      return 'UK';
    if (lowerUrl.includes('chinese') || lowerUrl.includes('china'))
      return 'China';
    if (lowerUrl.includes('israeli') || lowerUrl.includes('israel'))
      return 'Israel';
    return 'Unknown';
  }

  private async parseWikipedia(
    maxItems: number,
    categories: string[] = [],
  ): Promise<ParsedEquipmentData[]> {
    const equipmentData: ParsedEquipmentData[] = [];
    const categoriesToParse =
      categories.length > 0
        ? categories
        : this.sources.wikipedia.searchPatterns;

    for (const category of categoriesToParse) {
      try {
        const categoryUrl = `${this.sources.wikipedia.baseUrl}/wiki/${category}`;
        this.logger.log(`📂 Parsing Wikipedia category: ${category}`);

        const response = await axios.get(categoryUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Equipment-Parser/1.0)',
          },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        // Find article links in the category
        const articleLinks: string[] = [];
        $('#mw-pages .mw-category-group ul li a').each((_, element) => {
          const href = $(element).attr('href');
          if (href && !href.includes(':') && !href.includes('#')) {
            articleLinks.push(`${this.sources.wikipedia.baseUrl}${href}`);
          }
        });

        // Parse each article
        for (const link of articleLinks) {
          try {
            const equipmentItem = await this.parseWikipediaArticle(link);
            if (equipmentItem) {
              equipmentData.push(equipmentItem);
            }
            await this.delay(300); // Reduced delay between requests
          } catch (error) {
            this.logger.warn(
              `⚠️ Failed to parse article ${link}: ${error.message}`,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `❌ Failed to parse category ${category}: ${error.message}`,
        );
      }

      if (equipmentData.length >= maxItems) break;
    }

    return equipmentData.slice(0, maxItems);
  }

  private async parseWikipediaArticle(
    url: string,
  ): Promise<ParsedEquipmentData | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Equipment-Parser/1.0)',
        },
        timeout: 8000,
      });

      const $ = cheerio.load(response.data);

      // Базова інформація
      const title = $('#firstHeading').text().trim();
      if (!title) return null;

      // Інформаційна таблиця (infobox)
      const infobox = $('.infobox');
      const specs: { [key: string]: string } = {};

      infobox.find('tr').each((_, row) => {
        const label = $(row).find('th').first().text().trim().toLowerCase();
        const value = $(row).find('td').first().text().trim();
        if (label && value) {
          specs[label] = value;
        }
      });

      // Опис (перший параграф)
      const description = $('.mw-parser-output > p').first().text().trim();

      // Перевіряємо чи це релевантна техніка
      if (!this.isRelevantEquipment(title, description)) {
        return null;
      }

      // Покращена логіка пошуку зображень
      let imageUrl = '';

      // 1. Спочатку шукаємо в infobox
      const infoboxImg = infobox.find('img').first();
      if (infoboxImg.length) {
        const src = infoboxImg.attr('src');
        if (src) {
          imageUrl = src.startsWith('//') ? `https:${src}` : src;
        }
      }

      // 2. Якщо не знайшли в infobox, шукаємо в галереї
      if (!imageUrl) {
        const galleryImg = $('.gallery img, .thumb img').first();
        if (galleryImg.length) {
          const src = galleryImg.attr('src');
          if (src) {
            imageUrl = src.startsWith('//') ? `https:${src}` : src;
          }
        }
      }

      // 3. Якщо все ще не знайшли, шукаємо в контенті статті
      if (!imageUrl) {
        const contentImg = $('.mw-parser-output img').first();
        if (contentImg.length) {
          const src = contentImg.attr('src');
          if (src) {
            imageUrl = src.startsWith('//') ? `https:${src}` : src;
          }
        }
      }

      // 4. Якщо знайшли зображення, переконуємося що воно достатньо велике
      if (imageUrl) {
        try {
          const imgResponse = await axios.head(imageUrl);
          const contentType = imgResponse.headers['content-type'];
          const contentLength = parseInt(
            imgResponse.headers['content-length'] || '0',
          );

          // Перевіряємо чи це зображення і чи воно достатньо велике (більше 10KB)
          if (!contentType?.startsWith('image/') || contentLength < 10240) {
            imageUrl = '';
          }
        } catch (error) {
          imageUrl = '';
        }
      }

      return {
        name: title,
        type: this.determineEquipmentType(title, description),
        category: this.determineCategory(title, description),
        country: this.determineCountry(title, description, specs),
        manufacturer:
          specs['manufacturer'] || specs['designed by'] || undefined,
        inService: specs['in service'] || specs['service'] || undefined,
        crew: specs['crew'] || undefined,
        weight: specs['weight'] || specs['mass'] || undefined,
        length: specs['length'] || undefined,
        width: specs['width'] || undefined,
        height: specs['height'] || undefined,
        engine: specs['engine'] || specs['powerplant'] || undefined,
        speed: specs['maximum speed'] || specs['speed'] || undefined,
        range: specs['range'] || specs['operational range'] || undefined,
        armor: specs['armor'] || specs['armour'] || undefined,
        armament: this.parseArmament(
          specs['main armament'] || specs['armament'] || '',
        ),
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        source: 'Wikipedia',
        sourceUrl: url,
      };
    } catch (error) {
      this.logger.warn(`⚠️ Error parsing Wikipedia article: ${error.message}`);
      return null;
    }
  }

  private async parseArmyRecognition(
    maxItems: number,
  ): Promise<ParsedEquipmentData[]> {
    const equipmentData: ParsedEquipmentData[] = [];

    for (const section of this.sources['army-recognition'].searchPatterns) {
      try {
        const sectionUrl = `${this.sources['army-recognition'].baseUrl}${section}`;
        this.logger.log(`🔗 Parsing Army Recognition section: ${section}`);

        const response = await axios.get(sectionUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Equipment-Parser/1.0)',
          },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        // Знаходимо посилання на статті
        const articleLinks: string[] = [];
        $('.article-item a, .equipment-item a').each((_, element) => {
          const href = $(element).attr('href');
          if (href) {
            const fullUrl = href.startsWith('http')
              ? href
              : `${this.sources['army-recognition'].baseUrl}${href}`;
            articleLinks.push(fullUrl);
          }
        });

        // Парсимо статті
        for (const link of articleLinks.slice(
          0,
          Math.ceil(
            maxItems / this.sources['army-recognition'].searchPatterns.length,
          ),
        )) {
          try {
            const equipmentItem = await this.parseArmyRecognitionArticle(link);
            if (equipmentItem) {
              equipmentData.push(equipmentItem);
            }
            await this.delay(1000);
          } catch (error) {
            this.logger.warn(
              `⚠️ Failed to parse Army Recognition article: ${error.message}`,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `❌ Failed to parse Army Recognition section ${section}: ${error.message}`,
        );
      }

      if (equipmentData.length >= maxItems) break;
    }

    return equipmentData.slice(0, maxItems);
  }

  private async parseArmyRecognitionArticle(
    url: string,
  ): Promise<ParsedEquipmentData | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Equipment-Parser/1.0)',
        },
        timeout: 8000,
      });

      const $ = cheerio.load(response.data);

      const title = $('h1').first().text().trim();
      if (!title) return null;

      const description = $('.article-content p').first().text().trim();

      // Специфікації зазвичай в таблиці або списку
      const specs: { [key: string]: string } = {};
      $('.specifications table tr, .specs-table tr').each((_, row) => {
        const label = $(row).find('td').first().text().trim().toLowerCase();
        const value = $(row).find('td').last().text().trim();
        if (label && value && label !== value) {
          specs[label] = value;
        }
      });

      return {
        name: title,
        type: this.determineEquipmentType(title, description),
        category: this.determineCategory(title, description),
        country: specs['country'] || specs['origin'] || 'Unknown',
        manufacturer: specs['manufacturer'] || undefined,
        description: description || undefined,
        source: 'Army Recognition',
        sourceUrl: url,
      };
    } catch (error) {
      return null;
    }
  }

  private async parseMilitaryToday(
    maxItems: number,
  ): Promise<ParsedEquipmentData[]> {
    const equipmentData: ParsedEquipmentData[] = [];

    // Схожа логіка як для Army Recognition
    // Реалізація залежить від структури сайту Military Today

    return equipmentData;
  }

  private determineEquipmentType(name: string, description: string): string {
    const text = `${name.toLowerCase()} ${description.toLowerCase()}`;

    // Спочатку перевіряємо чи це відомий танк
    for (const [country, pattern] of Object.entries(
      EQUIPMENT_PATTERNS.knownTanks,
    )) {
      if (pattern.test(text)) {
        return 'Tank';
      }
    }

    // Якщо не знайдено відомий танк, перевіряємо інші типи
    for (const [type, pattern] of Object.entries(EQUIPMENT_PATTERNS.types)) {
      if (pattern.test(text)) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }

    return 'Other';
  }

  private determineCountry(
    name: string,
    description: string,
    specs: any,
  ): string {
    const text = `${name.toLowerCase()} ${description.toLowerCase()} ${JSON.stringify(specs).toLowerCase()}`;

    for (const [country, pattern] of Object.entries(
      EQUIPMENT_PATTERNS.countries,
    )) {
      if (pattern.test(text)) {
        return country.charAt(0).toUpperCase() + country.slice(1);
      }
    }

    return (
      specs['country of origin'] ||
      specs['place of origin'] ||
      specs['country'] ||
      'Unknown'
    );
  }

  private isRelevantEquipment(name: string, description: string): boolean {
    const text = `${name.toLowerCase()} ${description.toLowerCase()}`;

    // Перевіряємо чи не є це небажаним контентом
    for (const pattern of Object.values(EQUIPMENT_PATTERNS.exclude)) {
      if (pattern.test(text)) {
        return false;
      }
    }

    // Перевіряємо чи є це військовою технікою
    const isMilitary = Object.values(EQUIPMENT_PATTERNS.types).some((pattern) =>
      pattern.test(text),
    );

    // Додаткова перевірка для танків
    if (EQUIPMENT_PATTERNS.types.tank.test(text)) {
      // Перевіряємо чи це відомий танк
      const isKnownTank = Object.values(EQUIPMENT_PATTERNS.knownTanks).some(
        (pattern) => pattern.test(text),
      );
      return isKnownTank || isMilitary;
    }

    return isMilitary;
  }

  private determineCategory(name: string, description: string): string {
    const text = `${name.toLowerCase()} ${description.toLowerCase()}`;

    if (text.includes('main battle tank') || text.includes('mbt'))
      return 'Main Battle Tank';
    if (text.includes('light tank')) return 'Light Tank';
    if (text.includes('fighter')) return 'Fighter Aircraft';
    if (text.includes('bomber')) return 'Bomber Aircraft';
    if (text.includes('transport')) return 'Transport';
    if (text.includes('reconnaissance')) return 'Reconnaissance';

    return this.determineEquipmentType(name, description);
  }

  private parseArmament(armamentText: string): string[] {
    if (!armamentText) return [];

    return armamentText
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private async saveToDatabase(data: ParsedEquipmentData[]): Promise<void> {
    this.logger.log(`💾 Starting to save ${data.length} items to database...`);

    let savedCount = 0;
    let failedCount = 0;

    for (const item of data) {
      try {
        // Конвертуємо ParsedEquipmentData в EquipmentDTO
        const equipmentDTO = await this.convertToEquipmentDTO(item);

        // Перевіряємо чи вже існує така техніка
        const exists = await this.checkIfEquipmentExists(
          equipmentDTO.name,
          equipmentDTO.country,
        );
        if (exists) {
          this.logger.log(
            `⏭️ Equipment ${equipmentDTO.name} already exists, skipping...`,
          );
          continue;
        }

        // Створюємо техніку в базі даних
        const savedEquipment =
          await this.equipmentService.createEquipment(equipmentDTO);

        this.logger.log(
          `✅ Saved: ${savedEquipment.name} (ID: ${savedEquipment.id})`,
        );
        savedCount++;

        // Невелика затримка між збереженням
        await this.delay(200);
      } catch (error) {
        this.logger.error(`❌ Failed to save ${item.name}: ${error.message}`);
        failedCount++;
      }
    }

    this.logger.log(
      `📊 Database save completed: ${savedCount} saved, ${failedCount} failed`,
    );
  }

  private async convertToEquipmentDTO(
    data: ParsedEquipmentData,
  ): Promise<EquipmentDTO> {
    const equipmentDTO: EquipmentDTO = {
      name: data.name,
      type: data.type,
      country: data.country,
      description: data.description || null,
      inService: true,
    };

    // Extract year from inService string if available
    if (data.inService) {
      const yearMatch = data.inService.match(/(\d{4})/);
      if (yearMatch) {
        equipmentDTO.year = parseInt(yearMatch[1]);
      }
    }

    // Upload image if available
    if (data.imageUrl) {
      try {
        const uploadedImageUrl = await this.uploadImageToS3(
          data.imageUrl,
          data.name,
        );
        equipmentDTO.imageUrl = uploadedImageUrl;
        this.logger.log(`📸 Image uploaded for ${data.name}`);
      } catch (error) {
        this.logger.warn(
          `⚠️ Failed to upload image for ${data.name}: ${error.message}`,
        );
        // Спробуємо знайти альтернативне зображення
        try {
          const alternativeImageUrl = await this.findAlternativeImage(
            data.name,
            data.type,
          );
          if (alternativeImageUrl) {
            const uploadedImageUrl = await this.uploadImageToS3(
              alternativeImageUrl,
              data.name,
            );
            equipmentDTO.imageUrl = uploadedImageUrl;
            this.logger.log(`📸 Alternative image uploaded for ${data.name}`);
          }
        } catch (altError) {
          this.logger.warn(
            `⚠️ Failed to find alternative image for ${data.name}: ${altError.message}`,
          );
        }
      }
    }

    // Form technical specifications
    const technicalSpecs: any = {};

    if (data.manufacturer) technicalSpecs.manufacturer = data.manufacturer;
    if (data.crew) technicalSpecs.crew = data.crew;
    if (data.weight) technicalSpecs.weight = data.weight;
    if (data.length) technicalSpecs.length = data.length;
    if (data.width) technicalSpecs.width = data.width;
    if (data.height) technicalSpecs.height = data.height;
    if (data.engine) technicalSpecs.engine = data.engine;
    if (data.speed) technicalSpecs.speed = data.speed;
    if (data.range) technicalSpecs.range = data.range;
    if (data.armor) technicalSpecs.armor = data.armor;
    if (data.armament && data.armament.length > 0) {
      technicalSpecs.armament = data.armament;
    }

    // Add source information
    technicalSpecs.source = data.source;
    technicalSpecs.sourceUrl = data.sourceUrl;
    technicalSpecs.category = data.category;

    if (Object.keys(technicalSpecs).length > 0) {
      equipmentDTO.technicalSpecs = JSON.stringify(technicalSpecs);
    }

    return equipmentDTO;
  }

  private async uploadImageToS3(
    imageUrl: string,
    equipmentName: string,
  ): Promise<string> {
    try {
      // Download the image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Equipment-Parser/1.0)',
        },
      });

      if (!response.data) {
        throw new Error('No image data received');
      }

      // Create a file-like object that FileService can handle
      const file = {
        buffer: Buffer.from(response.data),
        mimetype: response.headers['content-type'] || 'image/jpeg',
        originalname: `${this.sanitizeFileName(equipmentName)}.jpg`,
      } as Express.Multer.File;

      // Upload using FileService
      const result = await this.fileService.uploadFileToAWSWithOptions(file, {
        compress: true,
      });

      return result.url;
    } catch (error) {
      this.logger.error(
        `Failed to upload image from ${imageUrl}: ${error.message}`,
      );
      throw error;
    }
  }

  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private async checkIfEquipmentExists(
    name: string,
    country: string,
  ): Promise<boolean> {
    try {
      const existing = await this.equipmentService.findByNameAndCountry(
        name,
        country,
      );
      return !!existing;
    } catch (error) {
      this.logger.warn(`Failed to check if equipment exists: ${error.message}`);
      return false;
    }
  }

  // Додатковий метод для batch збереження з кращою продуктивністю
  private async saveToDatabaseBatch(
    data: ParsedEquipmentData[],
    batchSize: number = 5,
  ): Promise<void> {
    this.logger.log(
      `💾 Starting batch save of ${data.length} items (batch size: ${batchSize})...`,
    );

    // Фільтруємо дублікати перед збереженням
    const uniqueData = this.removeDuplicates(data);
    this.logger.log(`🔄 Removed ${data.length - uniqueData.length} duplicates`);

    const batches: ParsedEquipmentData[][] = [];
    for (let i = 0; i < uniqueData.length; i += batchSize) {
      batches.push(uniqueData.slice(i, i + batchSize));
    }

    let totalSaved = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.log(
        `📦 Processing batch ${i + 1}/${batches.length} (${batch.length} items)...`,
      );

      const batchPromises = batch.map(async (item) => {
        try {
          const equipmentDTO = await this.convertToEquipmentDTO(item);

          // Перевіряємо існування
          const exists = await this.checkIfEquipmentExists(
            equipmentDTO.name,
            equipmentDTO.country,
          );
          if (exists) {
            return {
              success: false,
              reason: 'already_exists',
              name: item.name,
            };
          }

          const saved =
            await this.equipmentService.createEquipment(equipmentDTO);
          return { success: true, id: saved.id, name: saved.name };
        } catch (error) {
          return { success: false, error: error.message, name: item.name };
        }
      });

      const results = await Promise.allSettled(batchPromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const value = result.value;
          if (value.success) {
            totalSaved++;
            this.logger.log(`✅ Saved: ${value.name}`);
          } else {
            if (value.reason === 'already_exists') {
              totalSkipped++;
              this.logger.log(`⏭️ Skipped (exists): ${value.name}`);
            } else {
              totalFailed++;
              this.logger.warn(
                `⚠️ Failed: ${value.name} - ${value.error || value.reason}`,
              );
            }
          }
        } else {
          totalFailed++;
          this.logger.error(`❌ Batch item failed: ${result.reason}`);
        }
      });

      // Затримка між батчами
      if (i < batches.length - 1) {
        await this.delay(2000);
      }
    }

    this.logger.log(
      `📊 Batch save completed: ${totalSaved} saved, ${totalFailed} failed, ${totalSkipped} skipped`,
    );
  }

  private removeDuplicates(data: ParsedEquipmentData[]): ParsedEquipmentData[] {
    const seen = new Map<string, ParsedEquipmentData>();

    return data.filter((item) => {
      // Створюємо унікальний ключ для кожної одиниці техніки
      const key = `${item.name.toLowerCase()}_${item.country.toLowerCase()}`;

      if (seen.has(key)) {
        // Якщо знайдено дублікат, перевіряємо чи нова версія має більше інформації
        const existing = seen.get(key)!;
        const newItemHasMoreInfo = this.hasMoreInformation(item, existing);

        if (newItemHasMoreInfo) {
          seen.set(key, item);
          return true;
        }
        return false;
      }

      seen.set(key, item);
      return true;
    });
  }

  private hasMoreInformation(
    newItem: ParsedEquipmentData,
    existing: ParsedEquipmentData,
  ): boolean {
    // Рахуємо кількість заповнених полів
    const countFields = (item: ParsedEquipmentData): number => {
      return Object.entries(item).filter(([key, value]) => {
        if (key === 'source' || key === 'sourceUrl') return false;
        return value !== undefined && value !== null && value !== '';
      }).length;
    };

    const newFieldsCount = countFields(newItem);
    const existingFieldsCount = countFields(existing);

    // Якщо нова версія має більше інформації, використовуємо її
    if (newFieldsCount > existingFieldsCount) {
      return true;
    }

    // Якщо кількість полів однакова, перевіряємо довжину опису
    if (newFieldsCount === existingFieldsCount) {
      const newDescLength = newItem.description?.length || 0;
      const existingDescLength = existing.description?.length || 0;
      return newDescLength > existingDescLength;
    }

    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async findAlternativeImage(
    name: string,
    type: string,
  ): Promise<string | null> {
    try {
      // Формуємо пошуковий запит
      const searchQuery = `${name} ${type} military equipment`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`;

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Equipment-Parser/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const imgUrl = $('img').first().attr('src');

      return imgUrl || null;
    } catch (error) {
      this.logger.warn(`Failed to find alternative image: ${error.message}`);
      return null;
    }
  }
}
