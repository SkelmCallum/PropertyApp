import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PropertySearchFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const filters: PropertySearchFilters = {
      query: searchParams.get('q') || undefined,
      city: searchParams.get('city') || 'Cape Town',
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

    // Full-text search
    if (filters.query) {
      query = query.textSearch('title', filters.query, { type: 'websearch' });
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
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / (filters.limit || 20));

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
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

