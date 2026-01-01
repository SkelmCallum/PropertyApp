import Link from 'next/link';
import { ChevronLeft, Check, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

const tenantRights = [
  {
    title: 'Right to a Written Lease',
    description: 'You have the right to request a written lease agreement. While verbal agreements are legally binding, a written lease protects both parties.',
    allowed: true,
  },
  {
    title: 'Deposit Protection',
    description: 'Your deposit must be kept in an interest-bearing account. The landlord must provide proof of this and return your deposit with interest within 7 days of lease end.',
    allowed: true,
  },
  {
    title: 'Privacy and Quiet Enjoyment',
    description: 'Landlords cannot enter your home without reasonable notice (typically 24-48 hours) except in emergencies.',
    allowed: true,
  },
  {
    title: 'Maintenance Requests',
    description: 'Landlords are responsible for structural repairs and maintaining the property in a habitable condition.',
    allowed: true,
  },
  {
    title: 'Protection from Unfair Eviction',
    description: 'Landlords must follow legal procedures for eviction. They cannot change locks, cut utilities, or forcibly remove you.',
    allowed: true,
  },
  {
    title: 'Receipt for All Payments',
    description: 'You have the right to receive a receipt for every payment made to the landlord or agent.',
    allowed: true,
  },
];

const landlordCannotDo = [
  {
    title: 'Evict Without Court Order',
    description: 'A landlord cannot evict you without obtaining a court order, regardless of non-payment or lease violations.',
  },
  {
    title: 'Cut Utilities',
    description: 'It is illegal for a landlord to disconnect water, electricity, or other services to force you out.',
  },
  {
    title: 'Enter Without Notice',
    description: 'Landlords must provide reasonable notice before entering your rental property, except in emergencies.',
  },
  {
    title: 'Keep Your Deposit Unreasonably',
    description: 'Landlords cannot withhold your deposit without valid reasons and must provide an itemized list of deductions.',
  },
  {
    title: 'Discriminate',
    description: 'Landlords cannot refuse to rent to you based on race, gender, religion, disability, or family status.',
  },
];

export default function RentalRightsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link 
          href="/education" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Education
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">Tenant Rights in South Africa</h1>
        <p className="text-lg text-slate-600 mb-8">
          The Rental Housing Act protects tenants in South Africa. Here&apos;s what you need to know about your rights.
        </p>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Rights as a Tenant</h2>
          <div className="space-y-4">
            {tenantRights.map((right, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{right.title}</h3>
                      <p className="text-slate-600">{right.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What Landlords Cannot Do */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What Landlords Cannot Do</h2>
          <div className="space-y-4">
            {landlordCannotDo.map((item, idx) => (
              <Card key={idx} className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Warning */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Know Your Recourse</h3>
                <p className="text-amber-800">
                  If your rights are being violated, you can file a complaint with the Rental Housing Tribunal in your province. 
                  This service is free and can help resolve disputes between tenants and landlords.
                </p>
                <a 
                  href="https://www.westerncape.gov.za/service/rental-housing-tribunal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-3 text-amber-700 font-medium hover:underline"
                >
                  Western Cape Rental Housing Tribunal →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

