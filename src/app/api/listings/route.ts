import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { PropertySearchFilters, PropertySource } from '@/lib/types';
import { ScraperOrchestrator } from '@/lib/scrapers/scraper-orchestrator';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const filters: PropertySearchFilters = {
      query: searchParams.get('q') || undefined,
      city: searchParams.get('city') || undefined,
      suburbs: searchParams.get('suburbs')?.split(',').filter(Boolean),
      property_types: searchParams.get('types')?.split(',').filter(Boolean) as PropertySearchFilters['property_types'],
      min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
      min_bedrooms: searchParams.get('min_beds') ? parseInt(searchParams.get('min_beds')!) : undefined,
      max_bedrooms: searchParams.get('max_beds') ? parseInt(searchParams.get('max_beds')!) : undefined,
      min_bathrooms: searchParams.get('min_baths') ? parseInt(searchParams.get('min_baths')!) : undefined,
      pet_friendly: searchParams.get('pets') === 'true' ? true : undefined,
      furnished: searchParams.get('furnished') === 'true' ? true : undefined,
      sources: searchParams.get('sources')?.split(',').filter(Boolean) as PropertySearchFilters['sources'],
      max_scam_score: searchParams.get('max_scam') ? parseFloat(searchParams.get('max_scam')!) : 0.5,
      sort_by: (searchParams.get('sort') as PropertySearchFilters['sort_by']) || 'date_desc',
      page: Math.max(1, parseInt(searchParams.get('page') || '1')),
      limit: Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20'))),
    };

    // Build query
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    // Apply filters
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.suburbs && filters.suburbs.length > 0) {
      query = query.in('suburb', filters.suburbs);
    }

    if (filters.property_types && filters.property_types.length > 0) {
      query = query.in('property_type', filters.property_types);
    }

    if (filters.min_price !== undefined) {
      query = query.gte('price', filters.min_price);
    }

    if (filters.max_price !== undefined) {
      query = query.lte('price', filters.max_price);
    }

    if (filters.min_bedrooms !== undefined) {
      query = query.gte('bedrooms', filters.min_bedrooms);
    }

    if (filters.max_bedrooms !== undefined) {
      query = query.lte('bedrooms', filters.max_bedrooms);
    }

    if (filters.min_bathrooms !== undefined) {
      query = query.gte('bathrooms', filters.min_bathrooms);
    }

    if (filters.pet_friendly) {
      query = query.eq('pet_friendly', true);
    }

    if (filters.furnished) {
      query = query.eq('furnished', true);
    }

    if (filters.sources && filters.sources.length > 0) {
      query = query.in('source', filters.sources);
    }

    if (filters.max_scam_score !== undefined) {
      query = query.lte('scam_score', filters.max_scam_score);
    }

    // Full-text search - search across multiple fields
    if (filters.query) {
      const searchTerm = filters.query.trim();
      const searchPattern = `%${searchTerm}%`;
      // Use OR conditions to search across title, description, suburb, and city
      // Supabase PostgREST OR syntax: column1.ilike.value1,column2.ilike.value2
      // The pattern with % wildcards should work directly with ilike
      query = query.or(
        `title.ilike.${searchPattern},description.ilike.${searchPattern},suburb.ilike.${searchPattern},city.ilike.${searchPattern}`
      );
    }

    // Apply sorting
    switch (filters.sort_by) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'scam_score_asc':
        query = query.order('scam_score', { ascending: true });
        break;
      case 'date_desc':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const offset = ((filters.page || 1) - 1) * (filters.limit || 20);
    query = query.range(offset, offset + (filters.limit || 20) - 1);

    // Execute query
    const { data: properties, count, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / (filters.limit || 20));

    // If no properties found, trigger scraping in the background
    if (total === 0) {
      // Trigger scraping asynchronously (don't wait for it)
      triggerScraping(filters, supabase).catch(err => {
        console.error('Background scraping error:', err);
      });
    }

    // Log search results for debugging
    if (filters.query) {
      console.log(`Search query: "${filters.query}" returned ${total} results`);
    }

    return NextResponse.json({
      properties: properties || [],
      total,
      page: filters.page || 1,
      limit: filters.limit || 20,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error('Listings API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch listings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Background function to trigger scraping
async function triggerScraping(filters: PropertySearchFilters, supabaseClient: Awaited<ReturnType<typeof createClient>>) {
  try {
    // Create a service role client for database writes
    // The service role key bypasses RLS policies
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set. Cannot save scraped properties.');
      return;
    }

    const supabaseService = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // Determine which sources to scrape
    const sourcesToScrape: PropertySource[] = filters.sources && filters.sources.length > 0
      ? filters.sources
      : ['private_property', 'property24', 'facebook']; // Default to all sources

    // Determine city for scraping
    const cityForScraping = filters.city || 'Cape Town';
    const citySlug = cityForScraping.toLowerCase().replace(/\s+/g, '-'); // Convert to slug format
    
    console.log(`Triggering scraping for city: ${cityForScraping}, sources: ${sourcesToScrape.join(', ')}`);
    
    // Create orchestrator and run scraping
    const orchestrator = new ScraperOrchestrator({
      sources: sourcesToScrape,
      city: citySlug,
      suburbs: filters.suburbs,
      concurrent: true, // Run scrapers in parallel for speed
    });

    const result = await orchestrator.run();
    
    console.log(`Scraping completed: ${result.totalProperties} properties found`);
    
    // Save scraped properties to database
    if (result.totalProperties > 0) {
      const allProperties = result.results.flatMap(r => r.result.properties);
      const deduplicated = ScraperOrchestrator.deduplicateProperties(allProperties);
      
      console.log(`Saving ${deduplicated.length} deduplicated properties to database...`);
      
      // Upsert properties to database in batches for better performance
      const batchSize = 10;
      let savedCount = 0;
      
      for (let i = 0; i < deduplicated.length; i += batchSize) {
        const batch = deduplicated.slice(i, i + batchSize);
        
        const propertiesToUpsert = batch.map(property => ({
          external_id: property.external_id,
          source: property.source,
          source_url: property.source_url,
          title: property.title,
          description: property.description || null,
          property_type: property.property_type,
          address: property.address || null,
          suburb: property.suburb,
          city: property.city,
          province: property.province || 'Western Cape',
          postal_code: property.postal_code || null,
          latitude: property.latitude || null,
          longitude: property.longitude || null,
          price: property.price,
          price_frequency: property.price_frequency || 'monthly',
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
          status: 'active' as const,
          last_seen_at: new Date().toISOString(),
        }));

        const { error: upsertError } = await supabaseService
          .from('properties')
          .upsert(propertiesToUpsert, {
            onConflict: 'source,external_id',
          });

        if (upsertError) {
          console.error(`Failed to upsert batch starting at index ${i}:`, upsertError);
        } else {
          savedCount += batch.length;
        }
      }
      
      console.log(`Scraping completed: ${savedCount} properties saved to database`);
    } else {
      console.log('No properties found during scraping');
    }
  } catch (error) {
    console.error('Scraping error:', error);
  }
}

