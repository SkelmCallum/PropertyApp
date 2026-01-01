import { 
  BaseScraper, 
  DEFAULT_USER_AGENTS, 
  type ScrapedProperty, 
  type ScraperConfig, 
  type ScraperResult 
} from './base-scraper';

const CONFIG: ScraperConfig = {
  source: 'facebook',
  baseUrl: 'https://www.facebook.com',
  searchUrl: 'https://www.facebook.com/marketplace',
  rateLimit: 1, // More conservative rate limit for Facebook
  maxPages: 5, // Lower max pages due to complexity
  userAgents: DEFAULT_USER_AGENTS,
};

/**
 * Facebook Marketplace Scraper
 * 
 * IMPORTANT NOTES:
 * - Facebook Marketplace requires authentication for most listings
 * - Facebook has strict anti-scraping measures and rate limiting
 * - This implementation uses fetch-based scraping, but may require:
 *   - Facebook login credentials (stored securely)
 *   - Session cookies for authenticated requests
 *   - Proxy services to avoid IP blocking
 *   - CAPTCHA solving services
 * 
 * For production use, consider:
 * 1. Using Facebook Graph API (if available for Marketplace)
 * 2. Using a headless browser (Puppeteer/Playwright) with authentication
 * 3. Using a third-party service that provides Facebook Marketplace data
 * 
 * This scraper attempts to extract data from public listings,
 * but may not work for all listings due to authentication requirements.
 */
export class FacebookScraper extends BaseScraper {
  private sessionCookies?: string;
  private csrfToken?: string;

  constructor(sessionCookies?: string, csrfToken?: string) {
    super(CONFIG);
    this.sessionCookies = sessionCookies;
    this.csrfToken = csrfToken;
  }

  async scrape(city?: string, suburb?: string): Promise<ScraperResult> {
    const startTime = Date.now();
    const properties: ScrapedProperty[] = [];
    const errors: string[] = [];

    // Facebook Marketplace search requires location and category
    // For property rentals, we need to search in the "Property Rentals" category
    try {
      // Build search URL with location and category filters
      const searchParams = new URLSearchParams();
      if (city) {
        searchParams.set('query', city);
      }
      if (suburb) {
        searchParams.set('query', `${suburb}, ${city || ''}`);
      }
      // Facebook Marketplace category for property rentals
      searchParams.set('category', 'propertyrentals');
      searchParams.set('vertical', 'property');

      const baseSearchUrl = `${this.config.searchUrl}/search`;
      let pagesScraped = 0;

      // Facebook Marketplace uses infinite scroll, but we'll try to paginate
      for (let page = 1; page <= this.config.maxPages; page++) {
        try {
          const url = page === 1 
            ? `${baseSearchUrl}?${searchParams.toString()}`
            : `${baseSearchUrl}?${searchParams.toString()}&page=${page}`;

          const pageProperties = await this.scrapeListingPage(url);
          
          if (pageProperties.length === 0) {
            break; // No more results
          }
          
          properties.push(...pageProperties);
          pagesScraped++;
          
          // Rate limiting - be extra conservative with Facebook
          await this.delay(this.getRateLimitDelay() * 2); // Double the delay
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Page ${page}: ${errorMsg}`);
          
          // If we get a 403 or authentication error, stop trying
          if (errorMsg.includes('403') || errorMsg.includes('authentication') || errorMsg.includes('login')) {
            errors.push('Facebook authentication required. Please provide session cookies.');
            break;
          }
        }
      }

      return {
        success: errors.length === 0 || properties.length > 0,
        properties,
        errors,
        pagesScraped,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        properties,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
        pagesScraped: 0,
        duration: Date.now() - startTime,
      };
    }
  }

  async scrapeListingPage(url: string): Promise<ScrapedProperty[]> {
    const headers: HeadersInit = {
      'User-Agent': this.getNextUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Referer': this.config.baseUrl,
    };

    // Add session cookies if available
    if (this.sessionCookies) {
      headers['Cookie'] = this.sessionCookies;
    }

    const response = await fetch(url, {
      headers,
      redirect: 'follow',
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Facebook blocked request - authentication required');
      }
      if (response.status === 401) {
        throw new Error('Facebook authentication failed - invalid session');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const properties: ScrapedProperty[] = [];

    // Facebook Marketplace uses React, so the HTML is mostly JavaScript
    // We need to extract data from JSON-LD or embedded JSON data
    // Facebook often embeds listing data in script tags with type="application/json"
    
    // Try to extract JSON data from script tags
    const jsonDataPattern = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
    const jsonMatches = html.matchAll(jsonDataPattern);
    
    for (const match of jsonMatches) {
      try {
        const jsonData = JSON.parse(match[1]);
        const extractedProperties = this.extractPropertiesFromJson(jsonData);
        properties.push(...extractedProperties);
      } catch (error) {
        // Continue if JSON parsing fails
        continue;
      }
    }

    // Alternative: Try to find marketplace listing links
    if (properties.length === 0) {
      // Facebook Marketplace URLs typically look like:
      // /marketplace/item/1234567890/
      const listingLinkPattern = /href="(\/marketplace\/item\/\d+\/[^"]*)"/gi;
      const linkMatches = html.matchAll(listingLinkPattern);
      const seenUrls = new Set<string>();
      
      for (const match of linkMatches) {
        const relativeUrl = match[1];
        if (relativeUrl && !seenUrls.has(relativeUrl)) {
          seenUrls.add(relativeUrl);
          const propertyUrl = `${this.config.baseUrl}${relativeUrl}`;
          
          try {
            const property = await this.scrapePropertyDetail(propertyUrl);
            if (property) {
              properties.push(property);
              // Rate limit between detail page requests
              await this.delay(this.getRateLimitDelay() * 2);
            }
          } catch (error) {
            // Continue with next property if one fails
            console.error(`Failed to scrape ${propertyUrl}:`, error);
          }
        }
      }
    }

    return properties;
  }

  async scrapePropertyDetail(url: string): Promise<ScrapedProperty | null> {
    const headers: HeadersInit = {
      'User-Agent': this.getNextUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Referer': this.config.searchUrl,
    };

    if (this.sessionCookies) {
      headers['Cookie'] = this.sessionCookies;
    }

    const response = await fetch(url, {
      headers,
      redirect: 'follow',
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Facebook blocked request - authentication required');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract external ID from URL (e.g., /marketplace/item/1234567890/)
    const idMatch = url.match(/\/marketplace\/item\/(\d+)/);
    const externalId = idMatch ? idMatch[1] : url.split('/').pop() || '';

    // Try to extract structured data from JSON-LD or embedded JSON
    const jsonDataPattern = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
    let propertyData: any = null;

    for (const match of html.matchAll(jsonDataPattern)) {
      try {
        const jsonData = JSON.parse(match[1]);
        // Facebook embeds listing data in nested structures
        propertyData = this.findPropertyDataInJson(jsonData);
        if (propertyData) break;
      } catch (error) {
        continue;
      }
    }

    // If we found structured data, use it
    if (propertyData) {
      return this.parsePropertyFromJson(propertyData, url, externalId);
    }

    // Fallback: Try to parse from HTML
    return this.parsePropertyFromHtml(html, url, externalId);
  }

  /**
   * Extract properties from Facebook's embedded JSON data
   */
  private extractPropertiesFromJson(jsonData: any): ScrapedProperty[] {
    const properties: ScrapedProperty[] = [];
    
    // Recursively search for marketplace listing data
    const listings = this.findListingsInJson(jsonData);
    
    for (const listing of listings) {
      try {
        const property = this.parsePropertyFromJson(listing, '', '');
        if (property) {
          properties.push(property);
        }
      } catch (error) {
        // Continue if parsing fails
        continue;
      }
    }
    
    return properties;
  }

  /**
   * Recursively search JSON for marketplace listing structures
   */
  private findListingsInJson(obj: any, depth = 0): any[] {
    if (depth > 10) return []; // Prevent infinite recursion
    
    const listings: any[] = [];
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        listings.push(...this.findListingsInJson(item, depth + 1));
      }
    } else if (obj && typeof obj === 'object') {
      // Check if this looks like a marketplace listing
      if (obj.marketplace_listing || obj.listing || obj.item) {
        listings.push(obj.marketplace_listing || obj.listing || obj.item);
      }
      
      // Check for arrays of listings
      if (obj.listings && Array.isArray(obj.listings)) {
        listings.push(...obj.listings);
      }
      
      // Recursively search nested objects
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          listings.push(...this.findListingsInJson(obj[key], depth + 1));
        }
      }
    }
    
    return listings;
  }

  /**
   * Find property data in nested JSON structure
   */
  private findPropertyDataInJson(obj: any, depth = 0): any {
    if (depth > 10) return null;
    
    if (obj && typeof obj === 'object') {
      // Check for common Facebook Marketplace property keys
      if (obj.marketplace_listing || obj.listing || obj.item || obj.product) {
        return obj.marketplace_listing || obj.listing || obj.item || obj.product;
      }
      
      // Recursively search
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const found = this.findPropertyDataInJson(obj[key], depth + 1);
          if (found) return found;
        }
      }
    }
    
    return null;
  }

  /**
   * Parse property from Facebook JSON structure
   */
  private parsePropertyFromJson(data: any, url: string, externalId: string): ScrapedProperty | null {
    try {
      // Facebook Marketplace JSON structure varies, try common patterns
      const title = data.title || data.name || data.headline || '';
      const description = data.description || data.details || '';
      const priceText = data.price || data.priceText || data.formattedPrice || '';
      const price = this.parsePrice(priceText);
      
      // Skip properties without a valid price
      if (!price || price <= 0) {
        return null;
      }
      
      // Extract location
      const location = data.location || data.place || {};
      const address = location.address || location.full_address || '';
      const suburb = location.suburb || location.neighborhood || location.city || 'Unknown';
      const city = location.city || location.metro || 'Unknown';
      const province = location.province || location.state || 'Unknown';
      
      // Extract property details
      const propertyType = this.normalizePropertyType(title + ' ' + description);
      
      // Extract bedrooms, bathrooms, etc. from description or structured data
      const bedrooms = data.bedrooms || this.parseRooms(data.bedroomsText || '');
      const bathrooms = data.bathrooms || this.parseRooms(data.bathroomsText || '');
      const parking = data.parking || this.parseRooms(data.parkingText || '');
      
      // Extract images
      const images: string[] = [];
      if (data.images && Array.isArray(data.images)) {
        images.push(...data.images.map((img: any) => 
          typeof img === 'string' ? img : (img.url || img.src || '')
        ).filter((url: string) => url));
      } else if (data.image) {
        images.push(typeof data.image === 'string' ? data.image : (data.image.url || ''));
      }
      
      // Extract seller information
      const seller = data.seller || data.owner || {};
      const agentName = seller.name || null;
      const agentPhone = seller.phone || null;
      const agentEmail = seller.email || null;
      
      // Check for furnished/pet-friendly
      const fullText = (title + ' ' + description).toLowerCase();
      const furnished = this.isFurnished(fullText);
      const petFriendly = this.isPetFriendly(fullText);
      
      // Extract coordinates if available
      const latitude = location.latitude || data.latitude || null;
      const longitude = location.longitude || data.longitude || null;
      
      return {
        external_id: externalId || data.id || url,
        source: 'facebook',
        source_url: url || data.url || '',
        title: title || 'Property Listing',
        description: description || null,
        property_type: propertyType,
        address: address || null,
        suburb: suburb || 'Unknown',
        city: city || 'Unknown',
        province: province || 'Unknown',
        postal_code: null,
        latitude,
        longitude,
        price: price,
        price_frequency: 'monthly', // Facebook Marketplace typically uses monthly
        deposit: null,
        bedrooms,
        bathrooms,
        parking,
        size_sqm: null,
        furnished,
        pet_friendly: petFriendly,
        images: images.slice(0, 20),
        agent_name: agentName,
        agent_phone: agentPhone,
        agent_email: agentEmail,
        agency_name: null,
      };
    } catch (error) {
      console.error('Error parsing property from JSON:', error);
      return null;
    }
  }

  /**
   * Fallback: Parse property from HTML when JSON extraction fails
   */
  private parsePropertyFromHtml(html: string, url: string, externalId: string): ScrapedProperty | null {
    try {
      // Extract title
      const titleMatch = html.match(/<title>([^<]+)<\/title>|<h1[^>]*>([^<]+)<\/h1>/i);
      const title = this.cleanText(titleMatch?.[1] || titleMatch?.[2] || '');

      // Extract price using robust pattern matching
      const price = this.extractPrice(html);
      // Skip properties without a valid price
      if (!price || price <= 0) {
        return null;
      }
      const priceFreqMatch = html.match(/per\s*(month|week|day)|(pm|pw|pd)/i);
      const priceFrequency = this.normalizePriceFrequency(priceFreqMatch);

      // Extract location (Facebook often shows location in various formats)
      const locationMatch = html.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      const suburb = locationMatch?.[1] || 'Unknown';
      const city = locationMatch?.[2] || 'Unknown';

      // Extract property type
      const typeMatch = html.match(/(apartment|house|townhouse|studio|room|flat)/i);
      const propertyType = this.normalizePropertyType(typeMatch?.[1] || title);

      // Extract bedrooms, bathrooms, parking
      const bedroomsMatch = html.match(/(\d+)\s*(?:bed|bedroom|br)/i);
      const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : 0;

      const bathroomsMatch = html.match(/(\d+)\s*(?:bath|bathroom|ba)/i);
      const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1], 10) : 0;

      const parkingMatch = html.match(/(\d+)\s*(?:parking|car)/i);
      const parking = parkingMatch ? parseInt(parkingMatch[1], 10) : 0;

      // Extract images
      const imageMatches = html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/gi);
      const images: string[] = [];
      const seenImages = new Set<string>();
      for (const match of imageMatches) {
        const imgUrl = match[1];
        if (imgUrl && !imgUrl.includes('placeholder') && !imgUrl.includes('logo') && !seenImages.has(imgUrl)) {
          seenImages.add(imgUrl);
          const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${this.config.baseUrl}${imgUrl}`;
          images.push(fullImgUrl);
        }
      }

      // Extract description
      const descPatterns = [
        /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<p[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
        /<div[^>]*data-testid="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      ];
      let description: string | null = null;
      for (const pattern of descPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          description = this.cleanText(match[1]);
          break;
        }
      }

      // Check for furnished/pet-friendly
      const fullText = html.toLowerCase();
      const furnished = this.isFurnished(fullText);
      const petFriendly = this.isPetFriendly(fullText);

      return {
        external_id: externalId || url,
        source: 'facebook',
        source_url: url,
        title: title || 'Property Listing',
        description: description || null,
        property_type: propertyType,
        address: null,
        suburb: suburb || 'Unknown',
        city: city || 'Unknown',
        province: 'Unknown',
        postal_code: null,
        latitude: null,
        longitude: null,
        price: price,
        price_frequency: priceFrequency as 'monthly' | 'weekly' | 'daily',
        deposit: null,
        bedrooms,
        bathrooms,
        parking,
        size_sqm: null,
        furnished,
        pet_friendly: petFriendly,
        images: images.slice(0, 20),
        agent_name: null,
        agent_phone: null,
        agent_email: null,
        agency_name: null,
      };
    } catch (error) {
      console.error('Error parsing property from HTML:', error);
      return null;
    }
  }

  /**
   * Clean HTML text
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}
