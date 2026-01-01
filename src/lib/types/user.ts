export type SubscriptionTier = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  platform: 'private_property' | 'property24' | 'facebook';
  platform_user_id: string | null;
  platform_username: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  notify_new_listings: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  notes: string | null;
  created_at: string;
}

export interface ScamReport {
  id: string;
  user_id: string;
  property_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'confirmed' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
}

