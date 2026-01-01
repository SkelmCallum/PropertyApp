// Supabase Edge Function for scraping properties
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedProperty {
  external_id: string;
  source: string;
  source_url: string;
  title: string;
  description: string | null;
  property_type: string;
  address: string | null;
  suburb: string;
  city: string;
  province: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number;
  price_frequency: string;
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
    const source = body.source || 'all';
    const city = body.city || 'cape-town';

    // Create scraping job record
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .insert({
        source,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create job: ${jobError.message}`);
    }

    // Placeholder: In production, this would call the actual scrapers
    // For now, we'll simulate the scraping process
    const properties: ScrapedProperty[] = [];
    let propertiesFound = 0;
    let propertiesAdded = 0;
    let propertiesUpdated = 0;
    const errors: string[] = [];

    // TODO: Implement actual scraping logic here
    // This would use the scraper classes with Cheerio for HTML parsing
    // Since Edge Functions have limited capabilities, complex scraping
    // might need to be done via external APIs or services

    // Example: If we had scraped properties, we'd upsert them
    for (const property of properties) {
      const { error: upsertError } = await supabase
        .from('properties')
        .upsert({
          ...property,
          last_seen_at: new Date().toISOString(),
        }, {
          onConflict: 'source,external_id',
        });

      if (upsertError) {
        errors.push(`Failed to upsert property ${property.external_id}: ${upsertError.message}`);
      } else {
        propertiesAdded++;
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

