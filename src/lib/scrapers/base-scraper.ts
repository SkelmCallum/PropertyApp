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

