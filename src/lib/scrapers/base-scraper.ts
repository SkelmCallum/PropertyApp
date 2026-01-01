import type { Property, PropertySource, PropertyType } from '@/lib/types';

export interface ScrapedProperty {
  external_id: string;
  source: PropertySource;
  source_url: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  address: string | null;
  suburb: string;
  city: string;
  province: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number;
  price_frequency: 'monthly' | 'weekly' | 'daily';
  deposit: number | null;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  size_sqm: number | null;
  furnished: boolean;
  pet_friendly: boolean;
  images: string[];
  agent_name: string | null;
  agent_phone: string | null;
  agent_email: string | null;
  agency_name: string | null;
}

export interface ScraperConfig {
  source: PropertySource;
  baseUrl: string;
  searchUrl: string;
  rateLimit: number; // requests per second
  maxPages: number;
  userAgents: string[];
}

export interface ScraperResult {
  success: boolean;
  properties: ScrapedProperty[];
  errors: string[];
  pagesScraped: number;
  duration: number;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected userAgentIndex = 0;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  // Rotate user agents to avoid detection
  protected getNextUserAgent(): string {
    const ua = this.config.userAgents[this.userAgentIndex];
    this.userAgentIndex = (this.userAgentIndex + 1) % this.config.userAgents.length;
    return ua;
  }

  // Rate limiting helper
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Calculate delay based on rate limit
  protected getRateLimitDelay(): number {
    return Math.ceil(1000 / this.config.rateLimit);
  }

  // Parse price from text (handles R1,000 / R 1 000 / R1000 formats)
  protected parsePrice(priceText: string): number | null {
    if (!priceText) return null;
    const cleaned = priceText.replace(/[^\d.,]/g, '').replace(/,/g, '');
    const price = parseFloat(cleaned);
    return isNaN(price) ? null : price;
  }

  // Extract price from JSON/JavaScript data
  protected extractPriceFromJson(jsonData: any, path: string[] = []): number | null {
    if (jsonData === null || jsonData === undefined) return null;
    
    // Check if current object has price-related fields
    const priceFields = ['price', 'rent', 'rentalPrice', 'amount', 'cost', 'monthlyRent', 'weeklyRent', 'dailyRent'];
    for (const field of priceFields) {
      if (jsonData[field] !== undefined && jsonData[field] !== null) {
        const value = jsonData[field];
        if (typeof value === 'number' && value > 0) {
          return value;
        }
        if (typeof value === 'string') {
          const parsed = this.parsePrice(value);
          if (parsed !== null && parsed > 0) {
            return parsed;
          }
        }
        if (typeof value === 'object' && value.value) {
          const parsed = this.parsePrice(String(value.value));
          if (parsed !== null && parsed > 0) {
            return parsed;
          }
        }
      }
    }

    // Recursively search in nested objects (limit depth to avoid infinite loops)
    if (path.length < 5 && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
      for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
          const result = this.extractPriceFromJson(jsonData[key], [...path, key]);
          if (result !== null && result > 0) {
            return result;
          }
        }
      }
    }

    // Search in arrays
    if (Array.isArray(jsonData) && path.length < 5) {
      for (const item of jsonData) {
        const result = this.extractPriceFromJson(item, path);
        if (result !== null && result > 0) {
          return result;
        }
      }
    }

    return null;
  }

  // Extract price from HTML using multiple patterns
  protected extractPrice(html: string): number | null {
    // First, try to extract from JavaScript/JSON data
    const jsonPrice = this.extractPriceFromJavaScript(html);
    if (jsonPrice !== null && jsonPrice > 0) {
      return jsonPrice;
    }

    // Then try HTML patterns
    const pricePatterns = [
      // Pattern 1: Inside price-related HTML elements (class or id containing "price")
      /<[^>]*(?:class|id)="[^"]*price[^"]*"[^>]*>[\s\S]*?R\s*([\d\s,]+)/i,
      // Pattern 2: R followed by digits with frequency indicator
      /R\s*([\d\s,]+)\s*(?:per\s*(month|week|day)|pm|pw|pd|p\/m|p\/w|p\/d)/i,
      // Pattern 3: Basic R followed by digits (most common)
      /R\s*([\d\s,]+)/i,
      // Pattern 4: Price label format (rent: R12,500)
      /(?:rent|price)[^:]*:?\s*R?\s*([\d\s,]+)/i,
      // Pattern 5: Currency symbol variations
      /(?:R|ZAR|R\s*)\s*([\d\s,]+)/i,
      // Pattern 6: Price in data attributes (data-price, data-rent, etc.)
      /(?:data-price|data-rent|data-cost)="[^"]*R?\s*([\d\s,]+)"/i,
      // Pattern 7: Price in meta tags
      /<meta[^>]*(?:property|name)="[^"]*price[^"]*"[^>]*content="[^"]*R?\s*([\d\s,]+)"/i,
      // Pattern 8: Price in JSON-LD structured data
      /"price"[^:]*:\s*"?R?\s*([\d\s,]+)"?/i,
      // Pattern 9: Price with thousands separator (R 12,500 or R12,500)
      /R\s*([\d]{1,3}(?:[,\s]\d{3})*(?:\.\d{2})?)/i,
      // Pattern 10: Price in span/div with price class (more specific)
      /<(?:span|div|p|h[1-6])[^>]*class="[^"]*price[^"]*"[^>]*>[\s\S]*?R\s*([\d\s,]+)/i,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const priceText = match[1].trim();
        const price = this.parsePrice(priceText);
        if (price !== null && price > 0) {
          return price;
        }
      }
    }

    return null;
  }

  // Extract price from JavaScript/JSON embedded in HTML
  protected extractPriceFromJavaScript(html: string): number | null {
    // Try to extract JSON from script tags
    const scriptPatterns = [
      /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi,
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
      /<script[^>]*>[\s\S]*?window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});[\s\S]*?<\/script>/gi,
      /<script[^>]*>[\s\S]*?window\.__NEXT_DATA__\s*=\s*({[\s\S]*?});[\s\S]*?<\/script>/gi,
      /<script[^>]*>[\s\S]*?__INITIAL_PROPS__\s*=\s*({[\s\S]*?});[\s\S]*?<\/script>/gi,
    ];

    for (const pattern of scriptPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          try {
            const jsonData = JSON.parse(match[1]);
            const price = this.extractPriceFromJson(jsonData);
            if (price !== null && price > 0) {
              return price;
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    }

    // Try to find JavaScript variables with price data
    const jsVarPatterns = [
      /(?:price|rent|rentalPrice|amount)\s*[:=]\s*["']?R?\s*([\d\s,]+)["']?/gi,
      /(?:price|rent|rentalPrice|amount)\s*[:=]\s*(\d+(?:\.\d+)?)/gi,
      /"price"\s*:\s*["']?R?\s*([\d\s,]+)["']?/gi,
      /"rent"\s*:\s*["']?R?\s*([\d\s,]+)["']?/gi,
      /"amount"\s*:\s*["']?R?\s*([\d\s,]+)["']?/gi,
    ];

    for (const pattern of jsVarPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const price = this.parsePrice(match[1]);
          if (price !== null && price > 0) {
            return price;
          }
        }
      }
    }

    // Look for unescaped JSON in script tags (common in React apps)
    const unescapedJsonPattern = /<script[^>]*>[\s\S]*?({[\s\S]{100,10000}?"price"[\s\S]*?})[\s\S]*?<\/script>/gi;
    const unescapedMatches = html.matchAll(unescapedJsonPattern);
    for (const match of unescapedMatches) {
      if (match[1]) {
        try {
          // Try to extract just the price value from the JSON-like structure
          const priceMatch = match[1].match(/"price"\s*:\s*["']?R?\s*([\d\s,]+)["']?/i);
          if (priceMatch && priceMatch[1]) {
            const price = this.parsePrice(priceMatch[1]);
            if (price !== null && price > 0) {
              return price;
            }
          }
        } catch (e) {
          // Continue searching
        }
      }
    }

    return null;
  }

  // Parse number of rooms
  protected parseRooms(text: string): number {
    if (!text) return 0;
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // Normalize property type
  protected normalizePropertyType(type: string): PropertyType {
    const normalized = type.toLowerCase().trim();
    
    if (normalized.includes('apartment') || normalized.includes('flat')) return 'apartment';
    if (normalized.includes('house')) return 'house';
    if (normalized.includes('townhouse')) return 'townhouse';
    if (normalized.includes('studio') || normalized.includes('bachelor')) return 'studio';
    if (normalized.includes('room')) return 'room';
    
    return 'other';
  }

  // Check if text indicates pet-friendly
  protected isPetFriendly(text: string): boolean {
    const lowerText = text.toLowerCase();
    return lowerText.includes('pet friendly') || 
           lowerText.includes('pets allowed') ||
           lowerText.includes('pets ok');
  }

  // Check if text indicates furnished
  protected isFurnished(text: string): boolean {
    const lowerText = text.toLowerCase();
    return lowerText.includes('furnished') && !lowerText.includes('unfurnished');
  }

  // Normalize price frequency from various formats to standard values
  protected normalizePriceFrequency(match: RegExpMatchArray | null): 'monthly' | 'weekly' | 'daily' {
    if (!match) return 'monthly';
    
    if (match[1]) {
      // Matched "per month/week/day"
      const freq = match[1].toLowerCase();
      if (freq === 'month') return 'monthly';
      if (freq === 'week') return 'weekly';
      if (freq === 'day') return 'daily';
    }
    
    if (match[2]) {
      // Matched abbreviation (pm/pw/pd or p/m/p/w/p/d)
      const abbrev = match[2].toLowerCase();
      if (abbrev === 'pm' || abbrev === 'p/m') return 'monthly';
      if (abbrev === 'pw' || abbrev === 'p/w') return 'weekly';
      if (abbrev === 'pd' || abbrev === 'p/d') return 'daily';
    }
    
    return 'monthly';
  }

  // Generate a hash for deduplication
  protected generateHash(property: ScrapedProperty): string {
    const key = `${property.source}:${property.external_id}`;
    return key;
  }

  // Abstract methods to be implemented by each scraper
  abstract scrape(city?: string, suburb?: string): Promise<ScraperResult>;
  abstract scrapeListingPage(url: string): Promise<ScrapedProperty[]>;
  abstract scrapePropertyDetail(url: string): Promise<ScrapedProperty | null>;
}

// Common user agents for rotation
export const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

