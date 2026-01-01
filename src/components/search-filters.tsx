'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface SearchFiltersProps {
  onSearch: (filters: Record<string, string | undefined>) => void;
  initialFilters?: Record<string, string | undefined>;
}

const SUBURBS = [
  'Cape Town CBD', 'Sea Point', 'Green Point', 'Camps Bay', 'Clifton',
  'Observatory', 'Woodstock', 'Salt River', 'Rondebosch', 'Claremont',
  'Kenilworth', 'Newlands', 'Constantia', 'Hout Bay', 'Muizenberg',
  'Kalk Bay', 'Fish Hoek', 'Simons Town', 'Milnerton', 'Table View',
  'Blouberg', 'Bellville', 'Durbanville', 'Stellenbosch',
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio', label: 'Studio / Bachelor' },
  { value: 'room', label: 'Room' },
];

const PRICE_RANGES = [
  { min: 0, max: 5000, label: 'Under R5,000' },
  { min: 5000, max: 10000, label: 'R5,000 - R10,000' },
  { min: 10000, max: 15000, label: 'R10,000 - R15,000' },
  { min: 15000, max: 25000, label: 'R15,000 - R25,000' },
  { min: 25000, max: 50000, label: 'R25,000 - R50,000' },
  { min: 50000, max: undefined, label: 'R50,000+' },
];

export function SearchFilters({ onSearch, initialFilters = {} }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(initialFilters.q || '');
  const [selectedSuburbs, setSelectedSuburbs] = useState<string[]>(
    initialFilters.suburbs?.split(',').filter(Boolean) || []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    initialFilters.types?.split(',').filter(Boolean) || []
  );
  const [minPrice, setMinPrice] = useState(initialFilters.min_price || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.max_price || '');
  const [minBeds, setMinBeds] = useState(initialFilters.min_beds || '');
  const [petFriendly, setPetFriendly] = useState(initialFilters.pets === 'true');
  const [furnished, setFurnished] = useState(initialFilters.furnished === 'true');

  const handleSearch = () => {
    onSearch({
      q: query || undefined,
      suburbs: selectedSuburbs.length > 0 ? selectedSuburbs.join(',') : undefined,
      types: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      min_beds: minBeds || undefined,
      pets: petFriendly ? 'true' : undefined,
      furnished: furnished ? 'true' : undefined,
    });
  };

  const handleReset = () => {
    setQuery('');
    setSelectedSuburbs([]);
    setSelectedTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setMinBeds('');
    setPetFriendly(false);
    setFurnished(false);
    onSearch({});
  };

  const toggleSuburb = (suburb: string) => {
    setSelectedSuburbs(prev => 
      prev.includes(suburb) 
        ? prev.filter(s => s !== suburb)
        : [...prev, suburb]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const activeFilterCount = [
    selectedSuburbs.length > 0,
    selectedTypes.length > 0,
    minPrice,
    maxPrice,
    minBeds,
    petFriendly,
    furnished,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Main Search Bar */}
      <div className="p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by location, property type, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-12"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(activeFilterCount > 0 && 'border-emerald-500 text-emerald-600')}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      <div className={cn(
        'overflow-hidden transition-all duration-300',
        showFilters ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="p-4 pt-0 border-t border-slate-100 space-y-6">
          {/* Suburbs */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Suburbs</label>
            <div className="flex flex-wrap gap-2">
              {SUBURBS.map((suburb) => (
                <button
                  key={suburb}
                  onClick={() => toggleSuburb(suburb)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full border transition-all',
                    selectedSuburbs.includes(suburb)
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                  )}
                >
                  {suburb}
                </button>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full border transition-all',
                    selectedTypes.includes(type.value)
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price and Bedrooms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Price (R)</label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Price (R)</label>
              <Input
                type="number"
                placeholder="No max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Bedrooms</label>
              <select
                value={minBeds}
                onChange={(e) => setMinBeds(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={petFriendly}
                onChange={(e) => setPetFriendly(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">Pet Friendly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={furnished}
                onChange={(e) => setFurnished(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">Furnished</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={handleReset}>
              <X className="w-4 h-4 mr-2" />
              Reset All
            </Button>
            <Button onClick={handleSearch}>Apply Filters</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

