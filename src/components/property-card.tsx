import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Car, MapPin, Heart, AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
}

const sourceColors: Record<string, string> = {
  private_property: 'bg-blue-100 text-blue-700',
  property24: 'bg-purple-100 text-purple-700',
  facebook: 'bg-indigo-100 text-indigo-700',
  country: 'bg-amber-100 text-amber-700',
  gantri: 'bg-rose-100 text-rose-700',
};

const sourceLabels: Record<string, string> = {
  private_property: 'Private Property',
  property24: 'Property24',
  facebook: 'Facebook',
  country: 'Country',
  gantri: 'Gantri',
};

export function PropertyCard({ property, isFavorite, onToggleFavorite }: PropertyCardProps) {
  const scamRiskLevel = property.scam_score < 0.15 ? 'safe' : 
                        property.scam_score < 0.35 ? 'low' : 
                        property.scam_score < 0.6 ? 'medium' : 'high';

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all duration-300">
      <Link href={`/listings/${property.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-slate-100">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <span>No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge className={cn('text-xs', sourceColors[property.source] || 'bg-slate-100 text-slate-700')}>
              {sourceLabels[property.source] || property.source}
            </Badge>
            {property.furnished && (
              <Badge variant="success" size="sm">Furnished</Badge>
            )}
            {property.pet_friendly && (
              <Badge variant="info" size="sm">Pet Friendly</Badge>
            )}
          </div>

          {/* Scam Warning */}
          {scamRiskLevel !== 'safe' && (
            <div className={cn(
              'absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              scamRiskLevel === 'low' && 'bg-amber-100 text-amber-700',
              scamRiskLevel === 'medium' && 'bg-orange-100 text-orange-700',
              scamRiskLevel === 'high' && 'bg-red-100 text-red-700'
            )}>
              <AlertTriangle className="w-3 h-3" />
              {scamRiskLevel === 'high' ? 'High Risk' : scamRiskLevel === 'medium' ? 'Caution' : 'Verify'}
            </div>
          )}

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(property.id);
              }}
              className={cn(
                'absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all z-10',
                isFavorite ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
              )}
            >
              <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold text-slate-900">
              R{property.price.toLocaleString()}
            </span>
            <span className="text-sm text-slate-500">
              /{property.price_frequency === 'monthly' ? 'mo' : property.price_frequency === 'weekly' ? 'wk' : 'day'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-slate-600 text-sm mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{property.suburb}, {property.city}</span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 text-slate-600 text-sm">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
            {property.parking > 0 && (
              <div className="flex items-center gap-1">
                <Car className="w-4 h-4" />
                <span>{property.parking}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* View Original Link - Outside the main Link to avoid nesting */}
      <div className="px-4 pb-4">
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Listed {new Date(property.created_at).toLocaleDateString()}
          </span>
          <a
            href={property.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
          >
            View original
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

