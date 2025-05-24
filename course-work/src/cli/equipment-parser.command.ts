import { Command, CommandRunner, Option } from 'nest-commander';
import { EquipmentParserService } from '../equipment-parser/equipment-parser.service';
import { Logger } from '@nestjs/common';

interface ParseCommandOptions {
  source?: string;
  maxItems?: number;
  dryRun?: boolean;
}

@Command({
  name: 'parse-equipment',
  description: 'Parse military equipment data from various sources',
})
export class ParseEquipmentCommand extends CommandRunner {
  private readonly logger = new Logger(ParseEquipmentCommand.name);

  constructor(private readonly parserService: EquipmentParserService) {
    super();
  }

  async run(
    passedParams: string[],
    options: ParseCommandOptions,
  ): Promise<void> {
    this.logger.log('🚀 Starting equipment parsing...');

    try {
      if (options.dryRun) {
        this.logger.log('🧪 Running in dry-run mode (no data will be saved)');
        // Тут можна додати логіку для dry-run
        return;
      }

      const result = await this.parserService.startParsing({
        maxItems: options.maxItems,
        sources: options.source ? [options.source] : undefined,
      });

      this.logger.log(`✅ Parsing completed successfully!`);
      this.logger.log(`📊 Items processed: ${result.itemsProcessed}`);
    } catch (error) {
      this.logger.error(`❌ Parsing failed: ${error.message}`);
      process.exit(1);
    }
  }

  @Option({
    flags: '-s, --source <source>',
    description: 'Source to parse (wikipedia, military-today, apis)',
  })
  parseSource(val: string): string {
    return val;
  }

  @Option({
    flags: '-m, --max-items <maxItems>',
    description: 'Maximum number of items to process',
  })
  parseMaxItems(val: string): number {
    return parseInt(val, 10);
  }

  @Option({
    flags: '--dry-run',
    description: 'Run without saving data to database',
  })
  parseDryRun(): boolean {
    return true;
  }
}

// Окрема команда для швидкого заповнення
@Command({
  name: 'quick-seed',
  description: 'Quickly seed database with basic military equipment data',
})
export class QuickSeedCommand extends CommandRunner {
  private readonly logger = new Logger(QuickSeedCommand.name);

  constructor(private readonly parserService: EquipmentParserService) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('🌱 Quick seeding database with equipment data...');

    try {
      const equipment = await this.parserService.fetchFromOpenAPIs();

      this.logger.log(`✅ Quick seed completed!`);
      this.logger.log(`📊 Added ${equipment.length} equipment items`);
    } catch (error) {
      this.logger.error(`❌ Quick seed failed: ${error.message}`);
      process.exit(1);
    }
  }
}
