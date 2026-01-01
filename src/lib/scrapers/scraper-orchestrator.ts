import type { PropertySource } from '@/lib/types';
import type { ScrapedProperty, ScraperResult } from './base-scraper';

export interface OrchestratorConfig {
  sources: PropertySource[];
  city: string;
  suburbs?: string[];
  concurrent: boolean;
}

export interface OrchestratorResult {
  success: boolean;
  totalProperties: number;
  results: {
    source: PropertySource;
    result: ScraperResult;
  }[];
  duration: number;
}

export class ScraperOrchestrator {
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    this.config = config;
  }

  // Get scraper instance for a source
  private async getScraperForSource(source: PropertySource) {
    // Dynamic imports to avoid loading all scrapers
    switch (source) {
      case 'private_property':
        const { PrivatePropertyScraper } = await import('./private-property-scraper');
        return new PrivatePropertyScraper();
      case 'property24':
        const { Property24Scraper } = await import('./property24-scraper');
        return new Property24Scraper();
      case 'facebook':
        const { FacebookScraper } = await import('./facebook-scraper');
        return new FacebookScraper();
      default:
        return null;
    }
  }

  // Run all scrapers
  async run(): Promise<OrchestratorResult> {
    const startTime = Date.now();
    const results: OrchestratorResult['results'] = [];

    if (this.config.concurrent) {
      // Run scrapers in parallel
      const promises = this.config.sources.map(async (source) => {
        const scraper = await this.getScraperForSource(source);
        if (!scraper) {
          return {
            source,
            result: {
              success: false,
              properties: [],
              errors: [`No scraper available for ${source}`],
              pagesScraped: 0,
              duration: 0,
            },
          };
        }

        try {
          const result = await scraper.scrape(this.config.city);
          return { source, result };
        } catch (error) {
          return {
            source,
            result: {
              success: false,
              properties: [],
              errors: [error instanceof Error ? error.message : 'Unknown error'],
              pagesScraped: 0,
              duration: 0,
            },
          };
        }
      });

      const settledResults = await Promise.all(promises);
      results.push(...settledResults);
    } else {
      // Run scrapers sequentially
      for (const source of this.config.sources) {
        const scraper = await this.getScraperForSource(source);
        if (!scraper) {
          results.push({
            source,
            result: {
              success: false,
              properties: [],
              errors: [`No scraper available for ${source}`],
              pagesScraped: 0,
              duration: 0,
            },
          });
          continue;
        }

        try {
          const result = await scraper.scrape(this.config.city);
          results.push({ source, result });
        } catch (error) {
          results.push({
            source,
            result: {
              success: false,
              properties: [],
              errors: [error instanceof Error ? error.message : 'Unknown error'],
              pagesScraped: 0,
              duration: 0,
            },
          });
        }
      }
    }

    const totalProperties = results.reduce(
      (sum, r) => sum + r.result.properties.length,
      0
    );

    return {
      success: results.some(r => r.result.success),
      totalProperties,
      results,
      duration: Date.now() - startTime,
    };
  }

  // Deduplicate properties across sources
  static deduplicateProperties(properties: ScrapedProperty[]): ScrapedProperty[] {
    const seen = new Map<string, ScrapedProperty>();

    for (const property of properties) {
      // Create a dedup key based on address and price
      const dedupKey = `${property.suburb.toLowerCase()}-${property.title.toLowerCase().slice(0, 50)}-${property.price}`;
      
      if (!seen.has(dedupKey)) {
        seen.set(dedupKey, property);
      }
    }

    return Array.from(seen.values());
  }
}

