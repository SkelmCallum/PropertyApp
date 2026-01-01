export type PropertySource = 
  | 'private_property'
  | 'property24'
  | 'facebook'
  | 'country'
  | 'gantri';

export type PropertyType = 
  | 'apartment'
  | 'house'
  | 'townhouse'
  | 'studio'
  | 'room'
  | 'other';

export type ListingStatus = 
  | 'active'
  | 'pending'
  | 'rented'
  | 'expired';

export interface Property {
  id: string;
  external_id: string;
  source: PropertySource;
  source_url: string;
  
  // Basic info
  title: string;
  description: string;
  property_type: PropertyType;
  
  // Location
  address: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  
  // Pricing
  price: number;
  price_frequency: 'monthly' | 'weekly' | 'daily';
  deposit: number | null;
  
  // Features
  bedrooms: number;
  bathrooms: number;
  parking: number;
  size_sqm: number | null;
  furnished: boolean;
  pet_friendly: boolean;
  
  // Media
  images: string[];
  
  // Contact
  agent_name: string | null;
  agent_phone: string | null;
  agent_email: string | null;
  agency_name: string | null;
  
  // Scam detection
  scam_score: number;
  scam_flags: string[];
  
  // Metadata
  status: ListingStatus;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface PropertySearchFilters {
  query?: string;
  city?: string;
  suburbs?: string[];
  property_types?: PropertyType[];
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  pet_friendly?: boolean;
  furnished?: boolean;
  sources?: PropertySource[];
  max_scam_score?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'date_desc' | 'scam_score_asc';
  page?: number;
  limit?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

