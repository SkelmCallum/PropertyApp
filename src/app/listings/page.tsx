'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LayoutGrid, List, Map } from 'lucide-react';
import { Button } from '@/components/ui';
import { PropertyCard } from '@/components/property-card';
import { SearchFilters } from '@/components/search-filters';
import { cn } from '@/lib/utils/cn';
import type { Property } from '@/lib/types';

interface ListingsResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [listings, setListings] = useState<ListingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        const response = await fetch(`/api/listings?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setListings(data);
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchParams]);

  // Handle search/filter changes
  const handleSearch = (filters: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/listings?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/listings?${params.toString()}`);
  };

  // Toggle favorite
  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  };

  // Get initial filters from URL
  const initialFilters: Record<string, string | undefined> = {};
  searchParams.forEach((value, key) => {
    initialFilters[key] = value;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Your Perfect Rental</h1>
          <p className="text-slate-600">
            Browse {listings?.total.toLocaleString() || '...'} properties in Cape Town
          </p>
        </div>

        {/* Search Filters */}
        <div className="mb-6">
          <SearchFilters onSearch={handleSearch} initialFilters={initialFilters} />
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-600">
            {listings && (
              <>
                Showing {((listings.page - 1) * listings.limit) + 1} - {Math.min(listings.page * listings.limit, listings.total)} of {listings.total.toLocaleString()} properties
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 hover:text-slate-600'
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 hover:text-slate-600'
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <select
              defaultValue="date_desc"
              onChange={(e) => handleSearch({ ...initialFilters, sort: e.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700"
            >
              <option value="date_desc">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="scam_score_asc">Safest First</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : listings?.properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search filters</p>
            <Button variant="outline" onClick={() => handleSearch({})}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className={cn(
            'grid gap-6',
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {listings?.properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.has(property.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {listings && listings.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={listings.page === 1}
              onClick={() => handlePageChange(listings.page - 1)}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, listings.total_pages) }, (_, i) => {
              let pageNum: number;
              if (listings.total_pages <= 5) {
                pageNum = i + 1;
              } else if (listings.page <= 3) {
                pageNum = i + 1;
              } else if (listings.page >= listings.total_pages - 2) {
                pageNum = listings.total_pages - 4 + i;
              } else {
                pageNum = listings.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                    pageNum === listings.page
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              disabled={listings.page === listings.total_pages}
              onClick={() => handlePageChange(listings.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}

