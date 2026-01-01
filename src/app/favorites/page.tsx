'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PropertyCard } from '@/components/property-card';
import type { Property } from '@/lib/types';

interface Favorite {
  id: string;
  notes: string | null;
  created_at: string;
  properties: Property;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId }),
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(f => f.properties.id !== propertyId));
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Saved Properties</h1>
          <p className="text-slate-600">
            {favorites.length === 0 
              ? 'Properties you save will appear here'
              : `You have ${favorites.length} saved ${favorites.length === 1 ? 'property' : 'properties'}`
            }
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved properties</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                When you find properties you like, click the heart icon to save them here for easy access later.
              </p>
              <Link href="/listings">
                <Button>
                  Browse Properties
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <PropertyCard
                key={favorite.id}
                property={favorite.properties}
                isFavorite={true}
                onToggleFavorite={() => handleRemoveFavorite(favorite.properties.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

