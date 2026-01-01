import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bed, Bath, Car, MapPin, Calendar, Building2, Heart, 
  Share2, Flag, ExternalLink, Phone, Mail, AlertTriangle,
  Check, X, ChevronLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { Property } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

const sourceLabels: Record<string, string> = {
  private_property: 'Private Property',
  property24: 'Property24',
  facebook: 'Facebook Marketplace',
  country: 'Country',
  gantri: 'Gantri',
};

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !property) {
    notFound();
  }

  const typedProperty = property as Property;

  const scamRiskLevel = typedProperty.scam_score < 0.15 ? 'safe' : 
                        typedProperty.scam_score < 0.35 ? 'low' : 
                        typedProperty.scam_score < 0.6 ? 'medium' : 'high';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/listings" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to listings
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
              <div className="relative aspect-[16/9] bg-slate-100">
                {typedProperty.images && typedProperty.images.length > 0 ? (
                  <Image
                    src={typedProperty.images[0]}
                    alt={typedProperty.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    No images available
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge className="bg-white/90 text-slate-700">
                    {sourceLabels[typedProperty.source] || typedProperty.source}
                  </Badge>
                </div>
              </div>
              
              {/* Image Thumbnails */}
              {typedProperty.images && typedProperty.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {typedProperty.images.slice(0, 6).map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                      <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                  {typedProperty.images.length > 6 && (
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-sm">
                      +{typedProperty.images.length - 6} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Property Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{typedProperty.title}</h1>
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{typedProperty.address || `${typedProperty.suburb}, ${typedProperty.city}`}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">
                      R{typedProperty.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500">
                      per {typedProperty.price_frequency === 'monthly' ? 'month' : typedProperty.price_frequency}
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-lg mx-auto mb-2">
                      <Bed className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-lg font-semibold text-slate-900">{typedProperty.bedrooms}</div>
                    <div className="text-sm text-slate-500">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-lg mx-auto mb-2">
                      <Bath className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-lg font-semibold text-slate-900">{typedProperty.bathrooms}</div>
                    <div className="text-sm text-slate-500">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-lg mx-auto mb-2">
                      <Car className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-lg font-semibold text-slate-900">{typedProperty.parking}</div>
                    <div className="text-sm text-slate-500">Parking</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-lg mx-auto mb-2">
                      <Building2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-lg font-semibold text-slate-900">
                      {typedProperty.size_sqm ? `${typedProperty.size_sqm}m²` : '-'}
                    </div>
                    <div className="text-sm text-slate-500">Size</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="py-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      {typedProperty.furnished ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300" />
                      )}
                      <span className={typedProperty.furnished ? 'text-slate-900' : 'text-slate-400'}>
                        Furnished
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {typedProperty.pet_friendly ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300" />
                      )}
                      <span className={typedProperty.pet_friendly ? 'text-slate-900' : 'text-slate-400'}>
                        Pet Friendly
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
                  <p className="text-slate-600 whitespace-pre-wrap">
                    {typedProperty.description || 'No description provided.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Scam Warning */}
            {scamRiskLevel !== 'safe' && (
              <Card className={cn(
                'border-2',
                scamRiskLevel === 'high' && 'border-red-300 bg-red-50',
                scamRiskLevel === 'medium' && 'border-orange-300 bg-orange-50',
                scamRiskLevel === 'low' && 'border-amber-300 bg-amber-50'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={cn(
                      'w-6 h-6 flex-shrink-0',
                      scamRiskLevel === 'high' && 'text-red-600',
                      scamRiskLevel === 'medium' && 'text-orange-600',
                      scamRiskLevel === 'low' && 'text-amber-600'
                    )} />
                    <div>
                      <h3 className={cn(
                        'font-semibold',
                        scamRiskLevel === 'high' && 'text-red-800',
                        scamRiskLevel === 'medium' && 'text-orange-800',
                        scamRiskLevel === 'low' && 'text-amber-800'
                      )}>
                        {scamRiskLevel === 'high' ? 'High Risk Listing' : 
                         scamRiskLevel === 'medium' ? 'Exercise Caution' : 
                         'Verify This Listing'}
                      </h3>
                      <p className={cn(
                        'text-sm mt-1',
                        scamRiskLevel === 'high' && 'text-red-700',
                        scamRiskLevel === 'medium' && 'text-orange-700',
                        scamRiskLevel === 'low' && 'text-amber-700'
                      )}>
                        Our system has flagged potential concerns. Please verify before making any payments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact</h2>
                
                {typedProperty.agent_name && (
                  <div className="mb-4">
                    <div className="font-medium text-slate-900">{typedProperty.agent_name}</div>
                    {typedProperty.agency_name && (
                      <div className="text-sm text-slate-500">{typedProperty.agency_name}</div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {typedProperty.agent_phone && (
                    <a
                      href={`tel:${typedProperty.agent_phone}`}
                      className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>{typedProperty.agent_phone}</span>
                    </a>
                  )}
                  {typedProperty.agent_email && (
                    <a
                      href={`mailto:${typedProperty.agent_email}`}
                      className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="truncate">{typedProperty.agent_email}</span>
                    </a>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <a href={typedProperty.source_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Original Listing
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Listing Info */}
            <Card>
              <CardContent className="p-4 text-sm text-slate-500 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Listed {new Date(typedProperty.created_at).toLocaleDateString()}
                </div>
                <div>Last seen: {new Date(typedProperty.last_seen_at).toLocaleDateString()}</div>
                <div>Source: {sourceLabels[typedProperty.source]}</div>
                {typedProperty.deposit && (
                  <div>Deposit: R{typedProperty.deposit.toLocaleString()}</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

