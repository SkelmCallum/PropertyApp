import { 
  BaseScraper, 
  DEFAULT_USER_AGENTS, 
  type ScrapedProperty, 
  type ScraperConfig, 
  type ScraperResult 
} from './base-scraper';

const CONFIG: ScraperConfig = {
  source: 'property24',
  baseUrl: 'https://www.property24.com',
  searchUrl: 'https://www.property24.com/to-rent',
  rateLimit: 2,
  maxPages: 10,
  userAgents: DEFAULT_USER_AGENTS,
};

export class Property24Scraper extends BaseScraper {
  constructor() {
    super(CONFIG);
  }

  async scrape(city: string = 'cape-town'): Promise<ScraperResult> {
    const startTime = Date.now();
    const properties: ScrapedProperty[] = [];
    const errors: string[] = [];
    let pagesScraped = 0;

    try {
      for (let page = 1; page <= this.config.maxPages; page++) {
        try {
          const url = `${this.config.searchUrl}/${city}/p${page}`;
          const pageProperties = await this.scrapeListingPage(url);
          
          if (pageProperties.length === 0) {
            break;
          }
          
          properties.push(...pageProperties);
          pagesScraped++;
          
          await this.delay(this.getRateLimitDelay());
        } catch (error) {
          errors.push(`Page ${page}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: true,
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
        pagesScraped,
        duration: Date.now() - startTime,
      };
    }
  }

  async scrapeListingPage(url: string): Promise<ScrapedProperty[]> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.getNextUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': this.config.baseUrl,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const properties: ScrapedProperty[] = [];

    // Property24 uses various patterns for listing containers
    // Common patterns: p24_listing, js_listing, property-card, listing-item, etc.
    const listingPatterns = [
      /<div[^>]*class="[^"]*p24_listing[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*js_listing[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<article[^>]*class="[^"]*listing[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
      /<div[^>]*class="[^"]*property-card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*result-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<li[^>]*class="[^"]*property[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    ];

    let listings: string[] = [];
    for (const pattern of listingPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          listings.push(match[1]);
        }
      }
      if (listings.length > 0) break; // Use first pattern that finds listings
    }

    // If no structured listings found, try to find links to property detail pages
    if (listings.length === 0) {
      const linkPattern = /<a[^>]*href="(\/to-rent\/[^"]+)"[^>]*>/gi;
      const linkMatches = html.matchAll(linkPattern);
      const seenUrls = new Set<string>();
      
      for (const match of linkMatches) {
        const href = match[1];
        if (href && !seenUrls.has(href) && href.includes('/to-rent/') && !href.includes('/p')) {
          seenUrls.add(href);
          const propertyUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
          
          // Try to scrape detail page for this property
          try {
            const property = await this.scrapePropertyDetail(propertyUrl);
            if (property) {
              properties.push(property);
              // Rate limit between detail page requests
              await this.delay(this.getRateLimitDelay());
            }
          } catch (error) {
            // Continue with next property if one fails
            console.error(`Failed to scrape ${propertyUrl}:`, error);
          }
        }
      }
      
      return properties;
    }

    // Parse each listing
    for (const listingHtml of listings) {
      try {
        const property = this.parseListingHtml(listingHtml, url);
        if (property) {
          properties.push(property);
        }
      } catch (error) {
        console.error('Error parsing listing:', error);
        // Continue with next listing
      }
    }

    return properties;
  }

  private parseListingHtml(html: string, pageUrl: string): ScrapedProperty | null {
    // Extract property URL
    const urlMatch = html.match(/href="(\/to-rent\/[^"]+)"|href="(https?:\/\/[^"]*property24[^"]*\/to-rent\/[^"]+)"/i);
    const relativeUrl = urlMatch?.[1] || urlMatch?.[2];
    if (!relativeUrl) return null;

    const propertyUrl = relativeUrl.startsWith('http') 
      ? relativeUrl 
      : `${this.config.baseUrl}${relativeUrl}`;

    // Extract external ID from URL (e.g., /to-rent/cape-town/apartment/12345)
    const idMatch = propertyUrl.match(/\/(\d+)(?:\/|$)/);
    const externalId = idMatch ? idMatch[1] : propertyUrl.split('/').pop() || '';

    // Extract title
    const titleMatch = html.match(/<h[23][^>]*>([^<]+)<\/h[23]>|<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i)
      || html.match(/<a[^>]*>([^<]+)<\/a>/i);
    const title = this.cleanText(titleMatch?.[1] || titleMatch?.[2] || '');

    // Extract price
    const priceMatch = html.match(/R\s*([\d\s,]+)\s*(?:per\s*(month|week|day)|pm|pw|pd|p\/m|p\/w|p\/d)/i) 
      || html.match(/R\s*([\d\s,]+)/i);
    const priceText = priceMatch?.[1] || '';
    const price = this.parsePrice(priceText);
    const priceFreqMatch = html.match(/per\s*(month|week|day)|(pm|pw|pd|p\/m|p\/w|p\/d)/i);
    const priceFrequency = priceFreqMatch 
      ? (priceFreqMatch[1] || priceFreqMatch[2]?.replace('pm', 'monthly').replace('pw', 'weekly').replace('pd', 'daily').replace('p/m', 'monthly').replace('p/w', 'weekly').replace('p/d', 'daily') || 'monthly')
      : 'monthly';

    // Extract location (suburb, city)
    const locationMatch = html.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const suburb = locationMatch?.[1] || '';
    const city = locationMatch?.[2] || this.extractCityFromUrl(pageUrl);

    // Extract property type
    const typeMatch = html.match(/(apartment|house|townhouse|studio|room|flat|penthouse)/i);
    const propertyType = this.normalizePropertyType(typeMatch?.[1] || title);

    // Extract bedrooms, bathrooms, parking
    const bedroomsMatch = html.match(/(\d+)\s*(?:bed|bedroom|br|bedrooms)/i);
    const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : 0;

    const bathroomsMatch = html.match(/(\d+)\s*(?:bath|bathroom|ba|bathrooms)/i);
    const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1], 10) : 0;

    const parkingMatch = html.match(/(\d+)\s*(?:parking|car|garage)/i);
    const parking = parkingMatch ? parseInt(parkingMatch[1], 10) : 0;

    // Extract images
    const imageMatches = html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/gi);
    const images: string[] = [];
    for (const match of imageMatches) {
      const imgUrl = match[1];
      if (imgUrl && !imgUrl.includes('placeholder') && !imgUrl.includes('logo') && !imgUrl.includes('icon')) {
        const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${this.config.baseUrl}${imgUrl}`;
        images.push(fullImgUrl);
      }
    }

    // Extract description (truncated on listing page)
    const descMatch = html.match(/<p[^>]*>([^<]+)<\/p>|<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)<\/div>/i);
    const description = this.cleanText(descMatch?.[1] || descMatch?.[2] || '');

    // Check for furnished/pet-friendly flags
    const fullText = html.toLowerCase();
    const furnished = this.isFurnished(fullText);
    const petFriendly = this.isPetFriendly(fullText);

    // Default values for fields not available on listing page
    return {
      external_id: externalId || propertyUrl,
      source: 'property24',
      source_url: propertyUrl,
      title: title || 'Property Listing',
      description: description || null,
      property_type: propertyType,
      address: null,
      suburb: suburb || 'Unknown',
      city: city || 'Cape Town',
      province: 'Western Cape', // Default, can be improved
      postal_code: null,
      latitude: null,
      longitude: null,
      price: price || 0,
      price_frequency: priceFrequency as 'monthly' | 'weekly' | 'daily',
      deposit: null,
      bedrooms,
      bathrooms,
      parking,
      size_sqm: null,
      furnished,
      pet_friendly: petFriendly,
      images: images.slice(0, 10), // Limit to 10 images
      agent_name: null,
      agent_phone: null,
      agent_email: null,
      agency_name: null,
    };
  }

  async scrapePropertyDetail(url: string): Promise<ScrapedProperty | null> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.getNextUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': this.config.baseUrl,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract external ID from URL
    const idMatch = url.match(/\/(\d+)(?:\/|$)/);
    const externalId = idMatch ? idMatch[1] : url.split('/').pop() || '';

    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>|<title>([^<]+)<\/title>/i);
    const title = this.cleanText(titleMatch?.[1] || titleMatch?.[2] || '');

    // Extract price (more detailed on detail page)
    const priceMatch = html.match(/R\s*([\d\s,]+)\s*(?:per\s*(month|week|day)|pm|pw|pd|p\/m|p\/w|p\/d)/i) 
      || html.match(/R\s*([\d\s,]+)/i);
    const priceText = priceMatch?.[1] || '';
    const price = this.parsePrice(priceText);
    const priceFreqMatch = html.match(/per\s*(month|week|day)|(pm|pw|pd|p\/m|p\/w|p\/d)/i);
    const priceFrequency = priceFreqMatch 
      ? (priceFreqMatch[1] || priceFreqMatch[2]?.replace('pm', 'monthly').replace('pw', 'weekly').replace('pd', 'daily').replace('p/m', 'monthly').replace('p/w', 'weekly').replace('p/d', 'daily') || 'monthly')
      : 'monthly';

    // Extract deposit
    const depositMatch = html.match(/deposit[^:]*:?\s*R\s*([\d\s,]+)/i);
    const deposit = depositMatch ? this.parsePrice(depositMatch[1]) : null;

    // Extract full address
    const addressMatch = html.match(/<address[^>]*>([^<]+)<\/address>|<div[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)<\/div>/i)
      || html.match(/(\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+[A-Z][a-z]+)/);
    const address = this.cleanText(addressMatch?.[1] || addressMatch?.[2] || '');

    // Extract location details
    const locationMatch = html.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
      || html.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const suburb = locationMatch?.[1] || this.extractSuburbFromAddress(address);
    const city = locationMatch?.[2] || this.extractCityFromUrl(url);
    const province = locationMatch?.[3] || 'Western Cape';

    // Extract postal code
    const postalMatch = html.match(/(\d{4})/);
    const postalCode = postalMatch?.[1] || null;

    // Extract property type
    const typeMatch = html.match(/(apartment|house|townhouse|studio|room|flat|penthouse)/i);
    const propertyType = this.normalizePropertyType(typeMatch?.[1] || title);

    // Extract property features
    const bedroomsMatch = html.match(/(\d+)\s*(?:bed|bedroom|br|bedrooms)/i);
    const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : 0;

    const bathroomsMatch = html.match(/(\d+)\s*(?:bath|bathroom|ba|bathrooms)/i);
    const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1], 10) : 0;

    const parkingMatch = html.match(/(\d+)\s*(?:parking|car|garage)/i);
    const parking = parkingMatch ? parseInt(parkingMatch[1], 10) : 0;

    // Extract size
    const sizeMatch = html.match(/(\d+(?:\.\d+)?)\s*m²|(\d+(?:\.\d+)?)\s*sqm|(\d+(?:\.\d+)?)\s*m2/i);
    const sizeSqm = sizeMatch ? parseFloat(sizeMatch[1] || sizeMatch[2] || sizeMatch[3] || '0') : null;

    // Extract full description
    const descPatterns = [
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
      /<p[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
      /<div[^>]*class="[^"]*p24_description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    ];
    let description = null;
    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        description = this.cleanText(match[1]);
        break;
      }
    }
    if (!description) {
      // Fallback: get first long paragraph
      const pMatch = html.match(/<p[^>]*>([^<]{50,})<\/p>/i);
      description = pMatch ? this.cleanText(pMatch[1]) : null;
    }

    // Extract images (more images on detail page)
    const imageMatches = html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/gi);
    const images: string[] = [];
    const seenImages = new Set<string>();
    for (const match of imageMatches) {
      const imgUrl = match[1];
      if (imgUrl && !imgUrl.includes('placeholder') && !imgUrl.includes('logo') && !imgUrl.includes('icon') && !seenImages.has(imgUrl)) {
        seenImages.add(imgUrl);
        const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${this.config.baseUrl}${imgUrl}`;
        images.push(fullImgUrl);
      }
    }

    // Extract agent information
    const agentNameMatch = html.match(/<div[^>]*class="[^"]*agent[^"]*"[^>]*>[\s\S]*?<[^>]*>([^<]+)<\/[^>]*>/i)
      || html.match(/agent[^:]*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const agentName = agentNameMatch ? this.cleanText(agentNameMatch[1]) : null;

    const phoneMatch = html.match(/(\+?\d{2,3}[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4})/);
    const agentPhone = phoneMatch ? phoneMatch[1].replace(/\s+/g, ' ') : null;

    const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const agentEmail = emailMatch ? emailMatch[1] : null;

    const agencyMatch = html.match(/<div[^>]*class="[^"]*agency[^"]*"[^>]*>[\s\S]*?<[^>]*>([^<]+)<\/[^>]*>/i)
      || html.match(/agency[^:]*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const agencyName = agencyMatch ? this.cleanText(agencyMatch[1]) : null;

    // Check for furnished/pet-friendly
    const fullText = html.toLowerCase();
    const furnished = this.isFurnished(fullText);
    const petFriendly = this.isPetFriendly(fullText);

    // Extract coordinates if available (sometimes in meta tags or JSON-LD)
    let latitude: number | null = null;
    let longitude: number | null = null;
    const latMatch = html.match(/"latitude":\s*([-\d.]+)/);
    const lngMatch = html.match(/"longitude":\s*([-\d.]+)/);
    if (latMatch) {
      latitude = parseFloat(latMatch[1]) || null;
    }
    if (lngMatch) {
      longitude = parseFloat(lngMatch[1]) || null;
    }

    return {
      external_id: externalId || url,
      source: 'property24',
      source_url: url,
      title: title || 'Property Listing',
      description: description || null,
      property_type: propertyType,
      address: address || null,
      suburb: suburb || 'Unknown',
      city: city || 'Cape Town',
      province: province || 'Western Cape',
      postal_code: postalCode,
      latitude,
      longitude,
      price: price || 0,
      price_frequency: priceFrequency as 'monthly' | 'weekly' | 'daily',
      deposit,
      bedrooms,
      bathrooms,
      parking,
      size_sqm: sizeSqm,
      furnished,
      pet_friendly: petFriendly,
      images: images.slice(0, 20), // More images on detail page
      agent_name: agentName,
      agent_phone: agentPhone,
      agent_email: agentEmail,
      agency_name: agencyName,
    };
  }

  // Helper methods for parsing
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
      .trim();
  }

  private extractCityFromUrl(url: string): string {
    const cityMatch = url.match(/\/to-rent\/([^\/\?]+)/);
    if (cityMatch) {
      const citySlug = cityMatch[1];
      // Convert slug to proper case (cape-town -> Cape Town)
      return citySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return 'Cape Town'; // Default
  }

  private extractSuburbFromAddress(address: string): string {
    if (!address) return 'Unknown';
    // Try to extract suburb from address (usually second or third word)
    const parts = address.split(',').map(p => p.trim());
    if (parts.length > 1) {
      return parts[parts.length - 2] || parts[0] || 'Unknown';
    }
    return 'Unknown';
  }
}

