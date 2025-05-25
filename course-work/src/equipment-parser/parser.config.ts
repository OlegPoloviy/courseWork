export interface ParserSourceConfig {
  name: string;
  baseUrl: string;
  enabled: boolean;
  maxRetries: number;
  delay: number;
  timeout: number;
  categories: CategoryConfig[];
}

export interface CategoryConfig {
  name: string;
  path: string;
  type: string;
  selectors: SelectorConfig;
}

export interface SelectorConfig {
  container?: string;
  itemList?: string;
  itemLink?: string;
  title?: string;
  description?: string;
  image?: string;
  country?: string;
  year?: string;
  specs?: string;
  nextPage?: string;
}

export const PARSER_CONFIG: Record<string, ParserSourceConfig> = {
  wikipedia: {
    name: 'Wikipedia',
    baseUrl: 'https://en.wikipedia.org',
    enabled: true,
    maxRetries: 3,
    delay: 1000,
    timeout: 30000,
    categories: [
      {
        name: 'Main Battle Tanks',
        path: '/wiki/List_of_main_battle_tanks',
        type: 'Tank',
        selectors: {
          container: 'table.wikitable, table.sortable',
          itemList: 'tr',
          title: 'td:first-child, th:first-child',
          country: 'td:nth-child(2)',
          year: 'td:nth-child(3)',
          image: 'img',
        },
      },
      {
        name: 'Fighter Aircraft',
        path: '/wiki/List_of_fighter_aircraft',
        type: 'Aircraft',
        selectors: {
          container: 'table.wikitable',
          itemList: 'tr',
          title: 'td:first-child',
          country: 'td:nth-child(2)',
          year: 'td:nth-child(3)',
          image: 'img',
        },
      },
      {
        name: 'Military Helicopters',
        path: '/wiki/List_of_military_helicopters',
        type: 'Helicopter',
        selectors: {
          container: 'table.wikitable',
          itemList: 'tr',
          title: 'td:first-child',
          country: 'td:nth-child(2)',
          image: 'img',
        },
      },
      {
        name: 'Armoured Fighting Vehicles',
        path: '/wiki/List_of_armoured_fighting_vehicles',
        type: 'Armoured Vehicle',
        selectors: {
          container: 'table.wikitable',
          itemList: 'tr',
          title: 'td:first-child',
          country: 'td:nth-child(2)',
          image: 'img',
        },
      },
      {
        name: 'Submarines',
        path: '/wiki/List_of_submarines',
        type: 'Submarine',
        selectors: {
          container: 'table.wikitable',
          itemList: 'tr',
          title: 'td:first-child',
          country: 'td:nth-child(2)',
          image: 'img',
        },
      },
    ],
  },
  armyTechnology: {
    name: 'Army Technology',
    baseUrl: 'https://www.army-technology.com',
    enabled: true,
    maxRetries: 2,
    delay: 1500,
    timeout: 20000,
    categories: [
      {
        name: 'Main Battle Tanks',
        path: '/projects/category/land-systems/tanks/',
        type: 'Tank',
        selectors: {
          container: '.project-listing',
          itemList: '.project-item',
          itemLink: 'a',
          title: '.project-title',
          description: '.project-description',
          image: '.project-image img',
        },
      },
      {
        name: 'Combat Aircraft',
        path: '/projects/category/defence-aircraft/combat-aircraft/',
        type: 'Aircraft',
        selectors: {
          container: '.project-listing',
          itemList: '.project-item',
          itemLink: 'a',
          title: '.project-title',
          description: '.project-description',
          image: '.project-image img',
        },
      },
    ],
  },
};

// Enhanced source configs with more detailed parsing rules
export const PARSING_RULES = {
  countryAliases: {
    USA: 'United States',
    US: 'United States',
    America: 'United States',
    UK: 'United Kingdom',
    Britain: 'United Kingdom',
    USSR: 'Russia',
    'Soviet Union': 'Russia',
    'West Germany': 'Germany',
    'East Germany': 'Germany',
  },

  typeKeywords: {
    Tank: [
      'tank',
      'abrams',
      'leopard',
      'challenger',
      't-90',
      't-80',
      'merkava',
    ],
    Aircraft: [
      'fighter',
      'bomber',
      'aircraft',
      'jet',
      'f-16',
      'f-35',
      'mig',
      'su-',
    ],
    Helicopter: [
      'helicopter',
      'apache',
      'blackhawk',
      'cobra',
      'hind',
      'chinook',
    ],
    Submarine: ['submarine', 'sub', 'u-boat', 'ssn', 'ssbn'],
    'Naval Vessel': [
      'destroyer',
      'cruiser',
      'frigate',
      'corvette',
      'battleship',
    ],
    'Aircraft Carrier': ['carrier', 'cv-', 'cvn-'],
    Artillery: ['artillery', 'howitzer', 'cannon', 'gun', 'mortar'],
    'Missile System': ['missile', 'rocket', 'sam', 'patriot', 's-300', 's-400'],
  },

  excludePatterns: [
    /^(test|example|sample|placeholder)/i,
    /^(image|photo|picture|fig\.|figure)/i,
    /^(click|here|more|see|view)/i,
    /^[\d\s\-_.]+$/,
    /^(unknown|n\/a|tbd|tba)/i,
  ],

  yearPatterns: [
    /\b(19|20)\d{2}\b/,
    /\((19|20)\d{2}\)/,
    /since\s+(19|20)\d{2}/i,
    /from\s+(19|20)\d{2}/i,
  ],
};

export const DEFAULT_PARSE_OPTIONS = {
  maxItems: 100,
  maxConcurrency: 3,
};
