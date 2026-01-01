// Supabase Edge Function for scraping properties
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type PropertySource = 'private_property' | 'property24' | 'facebook';
type PropertySourceInput = PropertySource | 'all';
type PropertyType = 'apartment' | 'house' | 'townhouse' | 'studio' | 'room' | 'other';

interface ScrapedProperty {
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

interface ScamFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  score: number;
}

interface ScamAnalysis {
  score: number;
  flags: ScamFlag[];
  riskLevel: 'safe' | 'low' | 'medium' | 'high';
}

// Helper function to parse price from text
function parsePrice(priceText: string): number | null {
  if (!priceText) return null;
  const cleaned = priceText.replace(/[^\d.,]/g, '').replace(/,/g, '');
  const price = parseFloat(cleaned);
  return isNaN(price) ? null : price;
}

// Helper function to clean HTML text
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Helper function to normalize property type
function normalizePropertyType(type: string): PropertyType {
  const normalized = type.toLowerCase().trim();
  if (normalized.includes('apartment') || normalized.includes('flat')) return 'apartment';
  if (normalized.includes('house')) return 'house';
  if (normalized.includes('townhouse')) return 'townhouse';
  if (normalized.includes('studio') || normalized.includes('bachelor')) return 'studio';
  if (normalized.includes('room')) return 'room';
  return 'other';
}

// Helper function to check if text indicates pet-friendly
function isPetFriendly(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes('pet friendly') || 
         lowerText.includes('pets allowed') ||
         lowerText.includes('pets ok');
}

// Helper function to check if text indicates furnished
function isFurnished(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes('furnished') && !lowerText.includes('unfurnished');
}

// Scrape a specific source
async function scrapeSource(source: PropertySource, city: string): Promise<ScrapedProperty[]> {
  const properties: ScrapedProperty[] = [];
  
  switch (source) {
    case 'private_property':
      return await scrapePrivateProperty(city);
    case 'property24':
      return await scrapeProperty24(city);
    case 'facebook':
      return await scrapeFacebook(city);
    default:
      return [];
  }
}

// Scrape Private Property
async function scrapePrivateProperty(city: string): Promise<ScrapedProperty[]> {
  const properties: ScrapedProperty[] = [];
  const baseUrl = 'https://www.privateproperty.co.za';
  const searchUrl = `${baseUrl}/to-rent/${city}`;
  const maxPages = 3; // Limit pages for Edge Function timeout

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `${searchUrl}?page=${page}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) break;

      const html = await response.text();
      const linkPattern = /<a[^>]*href="(\/to-rent\/[^"]+)"[^>]*>/gi;
      const linkMatches = html.matchAll(linkPattern);
      const seenUrls = new Set<string>();
      
      for (const match of linkMatches) {
        const href = match[1];
        if (href && !seenUrls.has(href) && href.includes('/to-rent/')) {
          seenUrls.add(href);
          const propertyUrl = `${baseUrl}${href}`;
          
          try {
            const property = await scrapePropertyDetail(propertyUrl, 'private_property', baseUrl);
            if (property) {
              properties.push(property);
            }
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Failed to scrape ${propertyUrl}:`, error);
          }
        }
      }

      if (seenUrls.size === 0) break; // No more results
    }
  } catch (error) {
    console.error('Error scraping Private Property:', error);
  }

  return properties;
}

// Scrape Property24
async function scrapeProperty24(city: string): Promise<ScrapedProperty[]> {
  const properties: ScrapedProperty[] = [];
  const baseUrl = 'https://www.property24.com';
  const searchUrl = `${baseUrl}/to-rent/${city}`;
  const maxPages = 3;

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `${searchUrl}?page=${page}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) break;

      const html = await response.text();
      const linkPattern = /<a[^>]*href="(\/to-rent\/[^"]+)"[^>]*>/gi;
      const linkMatches = html.matchAll(linkPattern);
      const seenUrls = new Set<string>();
      
      for (const match of linkMatches) {
        const href = match[1];
        if (href && !seenUrls.has(href) && href.includes('/to-rent/')) {
          seenUrls.add(href);
          const propertyUrl = `${baseUrl}${href}`;
          
          try {
            const property = await scrapePropertyDetail(propertyUrl, 'property24', baseUrl);
            if (property) {
              properties.push(property);
            }
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Failed to scrape ${propertyUrl}:`, error);
          }
        }
      }

      if (seenUrls.size === 0) break;
    }
  } catch (error) {
    console.error('Error scraping Property24:', error);
  }

  return properties;
}

// Scrape Facebook Marketplace (simplified - may need different approach)
async function scrapeFacebook(city: string): Promise<ScrapedProperty[]> {
  // Facebook Marketplace requires more complex scraping
  // For now, return empty array - can be implemented later
  return [];
}

// Scrape a property detail page
async function scrapePropertyDetail(url: string, source: PropertySource, baseUrl: string): Promise<ScrapedProperty | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract external ID from URL
    const idMatch = url.match(/\/(\d+)(?:\/|$)/);
    const externalId = idMatch ? idMatch[1] : url.split('/').pop() || '';

    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>|<title>([^<]+)<\/title>/i);
    const title = cleanText(titleMatch?.[1] || titleMatch?.[2] || '');

    // Extract price
    const priceMatch = html.match(/R\s*([\d\s,]+)\s*(?:per\s*(month|week|day)|pm|pw|pd)/i) 
      || html.match(/R\s*([\d\s,]+)/i);
    const priceText = priceMatch?.[1] || '';
    const price = parsePrice(priceText) || 0;
    const priceFreqMatch = html.match(/per\s*(month|week|day)|(pm|pw|pd)/i);
    const priceFrequency = priceFreqMatch 
      ? (priceFreqMatch[1] || (priceFreqMatch[2] === 'pm' ? 'monthly' : priceFreqMatch[2] === 'pw' ? 'weekly' : 'daily'))
      : 'monthly';

    // Extract location
    const locationMatch = html.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const suburb = locationMatch?.[1] || 'Unknown';
    const city = locationMatch?.[2] || 'Cape Town';

    // Extract property type
    const typeMatch = html.match(/(apartment|house|townhouse|studio|room|flat)/i);
    const propertyType = normalizePropertyType(typeMatch?.[1] || title);

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
        const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${baseUrl}${imgUrl}`;
        images.push(fullImgUrl);
      }
    }

    // Extract description
    const descPatterns = [
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<p[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    ];
    let description: string | null = null;
    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        description = cleanText(match[1]);
        break;
      }
    }

    // Check for furnished/pet-friendly
    const fullText = html.toLowerCase();
    const furnished = isFurnished(fullText);
    const petFriendly = isPetFriendly(fullText);

    // Extract agent info
    const phoneMatch = html.match(/(\+?\d{2,3}[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4})/);
    const agentPhone = phoneMatch ? phoneMatch[1].replace(/\s+/g, ' ') : null;

    const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const agentEmail = emailMatch ? emailMatch[1] : null;

    return {
      external_id: externalId || url,
      source,
      source_url: url,
      title: title || 'Property Listing',
      description,
      property_type: propertyType,
      address: null,
      suburb,
      city,
      province: 'Western Cape',
      postal_code: null,
      latitude: null,
      longitude: null,
      price,
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
      agent_phone: agentPhone,
      agent_email: agentEmail,
      agency_name: null,
    };
  } catch (error) {
    console.error(`Error scraping property detail ${url}:`, error);
    return null;
  }
}

// Deduplicate properties
function deduplicateProperties(properties: ScrapedProperty[]): ScrapedProperty[] {
  const seen = new Map<string, ScrapedProperty>();

  for (const property of properties) {
    const dedupKey = `${property.source}:${property.external_id}`;
    if (!seen.has(dedupKey)) {
      seen.set(dedupKey, property);
    }
  }

  return Array.from(seen.values());
}

// Calculate scam score (simplified version for Edge Function)
function calculateScamScore(property: ScrapedProperty): ScamAnalysis {
  const flags: ScamFlag[] = [];
  let totalScore = 0;

  // Area average prices (simplified)
  const AREA_AVERAGE_PRICES: Record<string, { min: number; max: number }> = {
    'cape town': { min: 8000, max: 25000 },
    'sea point': { min: 10000, max: 35000 },
    'green point': { min: 10000, max: 30000 },
    'default': { min: 5000, max: 30000 },
  };

  const suburb = property.suburb.toLowerCase();
  const priceRange = AREA_AVERAGE_PRICES[suburb] || AREA_AVERAGE_PRICES['default'];

  // Price check
  if (property.price < priceRange.min * 0.4) {
    flags.push({
      type: 'suspicious_price',
      severity: 'high',
      description: `Price is unusually low for ${property.suburb}`,
      score: 0.35,
    });
    totalScore += 0.35;
  } else if (property.price < priceRange.min * 0.6) {
    flags.push({
      type: 'low_price',
      severity: 'medium',
      description: `Price is below average for ${property.suburb}`,
      score: 0.15,
    });
    totalScore += 0.15;
  }

  // Description check
  const SCAM_KEYWORDS = [
    'send deposit', 'western union', 'moneygram', 'wire transfer',
    'overseas', 'abroad', 'urgently', 'no viewing', 'send money',
  ];
  const combinedText = `${property.title} ${property.description || ''}`.toLowerCase();
  for (const keyword of SCAM_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      flags.push({
        type: 'suspicious_keyword',
        severity: 'high',
        description: `Contains suspicious phrase: "${keyword}"`,
        score: 0.25,
      });
      totalScore += 0.25;
      break; // Only count once
    }
  }

  // Contact check
  if (!property.agent_phone && !property.agent_email && !property.agent_name) {
    flags.push({
      type: 'missing_contact',
      severity: 'medium',
      description: 'No contact information provided',
      score: 0.2,
    });
    totalScore += 0.2;
  }

  // Image check
  if (!property.images || property.images.length === 0) {
    flags.push({
      type: 'no_images',
      severity: 'medium',
      description: 'No photos provided',
      score: 0.15,
    });
    totalScore += 0.15;
  } else if (property.images.length === 1) {
    flags.push({
      type: 'few_images',
      severity: 'low',
      description: 'Only one photo provided',
      score: 0.05,
    });
    totalScore += 0.05;
  }

  // Normalize score
  const normalizedScore = Math.min(1, totalScore);

  // Determine risk level
  let riskLevel: 'safe' | 'low' | 'medium' | 'high';
  if (normalizedScore < 0.15) riskLevel = 'safe';
  else if (normalizedScore < 0.35) riskLevel = 'low';
  else if (normalizedScore < 0.6) riskLevel = 'medium';
  else riskLevel = 'high';

  return {
    score: normalizedScore,
    flags,
    riskLevel,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const sourceInput: PropertySourceInput = body.source || 'all';
    const city = body.city || 'cape-town';

    // Create scraping job record
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .insert({
        source: sourceInput,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create job: ${jobError.message}`);
    }

    // Determine which sources to scrape
    const sourcesToScrape: PropertySource[] = sourceInput === 'all' 
      ? ['private_property', 'property24', 'facebook']
      : [sourceInput as PropertySource];

    const properties: ScrapedProperty[] = [];
    let propertiesFound = 0;
    let propertiesAdded = 0;
    let propertiesUpdated = 0;
    const errors: string[] = [];

    // Scrape each source
    for (const sourceToScrape of sourcesToScrape) {
      try {
        const scraped = await scrapeSource(sourceToScrape, city);
        properties.push(...scraped);
        propertiesFound += scraped.length;
      } catch (error) {
        const errorMsg = `Failed to scrape ${sourceToScrape}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    // Deduplicate properties
    const deduplicated = deduplicateProperties(properties);

    // Process properties in batches
    const batchSize = 10;
    for (let i = 0; i < deduplicated.length; i += batchSize) {
      const batch = deduplicated.slice(i, i + batchSize);
      
      for (const property of batch) {
        try {
          // Calculate scam score
          const scamAnalysis = calculateScamScore(property);
          
          // Check if property already exists
          const { data: existing } = await supabase
            .from('properties')
            .select('id')
            .eq('source', property.source)
            .eq('external_id', property.external_id)
            .single();

          const propertyData = {
            external_id: property.external_id,
            source: property.source,
            source_url: property.source_url,
            title: property.title,
            description: property.description || null,
            property_type: property.property_type,
            address: property.address || null,
            suburb: property.suburb,
            city: property.city,
            province: property.province,
            postal_code: property.postal_code || null,
            latitude: property.latitude || null,
            longitude: property.longitude || null,
            price: property.price,
            price_frequency: property.price_frequency,
            deposit: property.deposit || null,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            parking: property.parking,
            size_sqm: property.size_sqm || null,
            furnished: property.furnished,
            pet_friendly: property.pet_friendly,
            images: property.images || [],
            agent_name: property.agent_name || null,
            agent_phone: property.agent_phone || null,
            agent_email: property.agent_email || null,
            agency_name: property.agency_name || null,
            scam_score: scamAnalysis.score,
            scam_flags: scamAnalysis.flags.map(f => f.type),
            status: 'active' as const,
            last_seen_at: new Date().toISOString(),
          };

          const { error: upsertError } = await supabase
            .from('properties')
            .upsert(propertyData, {
              onConflict: 'source,external_id',
            });

          if (upsertError) {
            errors.push(`Failed to upsert property ${property.external_id}: ${upsertError.message}`);
          } else {
            if (existing) {
              propertiesUpdated++;
            } else {
              propertiesAdded++;
            }
          }
        } catch (error) {
          errors.push(`Error processing property ${property.external_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Update job status
    const { error: updateError } = await supabase
      .from('scraping_jobs')
      .update({
        status: errors.length > 0 ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
        properties_found: propertiesFound,
        properties_added: propertiesAdded,
        properties_updated: propertiesUpdated,
        error_message: errors.length > 0 ? errors.join('; ') : null,
      })
      .eq('id', job.id);

    if (updateError) {
      console.error('Failed to update job:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        job_id: job.id,
        properties_found: propertiesFound,
        properties_added: propertiesAdded,
        properties_updated: propertiesUpdated,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Scraping error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

