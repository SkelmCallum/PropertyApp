import Link from 'next/link';
import { ChevronLeft, Check, X, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';

const legalFees = [
  {
    name: 'Security Deposit',
    typical: '1-2 months rent',
    legal: true,
    description: 'Standard deposit to cover potential damages. Must be kept in an interest-bearing account.',
  },
  {
    name: 'First Month Rent',
    typical: '1 month rent',
    legal: true,
    description: 'Usually paid before moving in along with the deposit.',
  },
  {
    name: 'Admin Fee',
    typical: 'R500 - R2,000',
    legal: true,
    description: 'One-time fee for processing your application. Should be reasonable.',
  },
  {
    name: 'Key Deposit',
    typical: 'R200 - R500',
    legal: true,
    description: 'Refundable deposit for keys. Less common but allowed.',
  },
];

const potentiallyIllegalFees = [
  {
    name: 'Non-refundable Deposit',
    description: 'Deposits must be refundable. Any "non-refundable deposit" is illegal.',
    warning: 'This is a red flag. Avoid properties that require this.',
  },
  {
    name: 'Viewing Fee',
    description: 'Charging to view a property is not standard practice and often indicates a scam.',
    warning: 'Never pay to view a property.',
  },
  {
    name: 'Holding Fee Without Agreement',
    description: 'Asking for money to "hold" a property without a signed agreement.',
    warning: 'Get everything in writing before paying anything.',
  },
  {
    name: 'Excessive Admin Fees',
    description: 'Admin fees over R5,000 or multiple admin fees should be questioned.',
    warning: 'Ask for a breakdown and justification.',
  },
];

const depositRules = [
  'Deposit must be kept in a separate interest-bearing account',
  'Interest accrued belongs to the tenant',
  'Landlord must provide proof of deposit account on request',
  'Deposit and interest must be returned within 7 days of lease end',
  'Deductions require an itemized inspection report',
  'Tenant has the right to be present during final inspection',
];

export default function FeesGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/education" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Education
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">Legal Fees Guide</h1>
        <p className="text-lg text-slate-600 mb-8">
          Know what fees are legal and what amounts are reasonable when renting in South Africa.
        </p>

        {/* Legal Fees */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Standard Legal Fees</h2>
          <div className="space-y-4">
            {legalFees.map((fee, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{fee.name}</h3>
                        <p className="text-slate-600">{fee.description}</p>
                      </div>
                    </div>
                    <Badge variant="success" className="ml-4 whitespace-nowrap">
                      {fee.typical}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Potentially Illegal Fees */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Red Flag Fees</h2>
          <div className="space-y-4">
            {potentiallyIllegalFees.map((fee, idx) => (
              <Card key={idx} className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{fee.name}</h3>
                      <p className="text-slate-600 mb-2">{fee.description}</p>
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        {fee.warning}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Deposit Rules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Deposit Protection Rules</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <p className="text-slate-600">
                  The Rental Housing Act has specific rules about how deposits must be handled. Here&apos;s what you need to know:
                </p>
              </div>
              <ul className="space-y-3">
                {depositRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Calculator Placeholder */}
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Upfront Costs Calculator</h2>
            <p className="text-emerald-100 mb-6">
              Planning your budget? Calculate the total upfront costs you&apos;ll need to move into a rental.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg">
              Coming Soon
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

