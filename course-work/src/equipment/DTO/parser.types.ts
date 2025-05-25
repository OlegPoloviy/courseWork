export interface ParsedEquipmentData {
  name: string;
  type: EquipmentType;
  country: string;
  description?: string;
  year?: number;
  imageUrl?: string;
  technicalSpecs?: TechnicalSpecs;
  source: string;
  sourceUrl?: string;
}

export enum EquipmentType {
  TANK = 'Tank',
  AIRCRAFT = 'Aircraft',
  HELICOPTER = 'Helicopter',
  SUBMARINE = 'Submarine',
  NAVAL_VESSEL = 'Naval Vessel',
  AIRCRAFT_CARRIER = 'Aircraft Carrier',
  ARMOURED_VEHICLE = 'Armoured Vehicle',
  ARTILLERY = 'Artillery',
  MISSILE_SYSTEM = 'Missile System',
  RADAR_SYSTEM = 'Radar System',
  UNKNOWN = 'Unknown',
}

export interface TechnicalSpecs {
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  speed?: string;
  range?: string;
  crew?: number;
  armament?: string[];
  armor?: string;
  engine?: string;
  [key: string]: any;
}

export interface ParsingStatistics {
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  duplicateItems: number;
  processingTime: number;
  sourceBreakdown: {
    [source: string]: {
      items: number;
      errors: number;
    };
  };
}

export interface SourceConfig {
  name: string;
  baseUrl: string;
  enabled: boolean;
  maxRetries: number;
  delay: number;
  selectors: {
    itemList?: string;
    itemLink?: string;
    title?: string;
    description?: string;
    image?: string;
    country?: string;
    year?: string;
    specs?: string;
  };
}
