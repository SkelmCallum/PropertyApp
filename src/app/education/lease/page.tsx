import Link from 'next/link';
import { ChevronLeft, Check, AlertTriangle, FileText, Eye } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';

const mustHaveClauses = [
  {
    title: 'Parties to the Agreement',
    description: 'Full names and ID numbers of both landlord and tenant(s).',
  },
  {
    title: 'Property Address',
    description: 'Complete physical address of the rental property.',
  },
  {
    title: 'Lease Duration',
    description: 'Start date, end date, and whether it automatically renews.',
  },
  {
    title: 'Rental Amount',
    description: 'Monthly rent, due date, and acceptable payment methods.',
  },
  {
    title: 'Deposit Details',
    description: 'Amount, bank where it will be held, and return conditions.',
  },
  {
    title: 'Notice Period',
    description: 'How much notice is required to end the lease (usually 1-2 months).',
  },
  {
    title: 'Maintenance Responsibilities',
    description: 'Who is responsible for what repairs and maintenance.',
  },
];

const redFlagClauses = [
  {
    title: 'Waiving Legal Rights',
    description: 'Any clause that asks you to waive your rights under the Rental Housing Act is illegal and unenforceable.',
    severity: 'high',
  },
  {
    title: 'Unreasonable Penalties',
    description: 'Excessive late fees (more than the legal maximum) or unreasonable penalties for minor issues.',
    severity: 'medium',
  },
  {
    title: 'Automatic Rent Increases',
    description: 'Increases tied to arbitrary percentages without limits. Should be tied to CPI or a fixed percentage.',
    severity: 'medium',
  },
  {
    title: 'No Entry Notice',
    description: 'Clauses allowing the landlord to enter without notice. You have the right to reasonable notice.',
    severity: 'high',
  },
  {
    title: 'Forfeiture of Deposit',
    description: 'Any clause saying you forfeit your deposit automatically. Deposits can only be kept for valid reasons.',
    severity: 'high',
  },
  {
    title: 'No Subletting Clause',
    description: 'While landlords can prohibit subletting, complete bans without any option to discuss may be too restrictive.',
    severity: 'low',
  },
];

const beforeSigning = [
  'Read the entire lease carefully, including the fine print',
  'Ask questions about anything you don\'t understand',
  'Take photos/videos of the property condition before moving in',
  'Get a signed inventory/inspection report',
  'Keep a copy of all documents for your records',
  'Never sign under pressure - take time to review',
  'Have someone you trust review the lease if possible',
];

export default function LeaseGuidePage() {
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

        <h1 className="text-3xl font-bold text-slate-900 mb-4">Lease Agreement Guide</h1>
        <p className="text-lg text-slate-600 mb-8">
          Understanding your lease agreement is crucial. Here&apos;s what to look for before you sign.
        </p>

        {/* Must Have Clauses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            <FileText className="inline w-6 h-6 mr-2 text-emerald-600" />
            Essential Clauses
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mustHaveClauses.map((clause, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{clause.title}</h3>
                      <p className="text-sm text-slate-600">{clause.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Red Flag Clauses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            <AlertTriangle className="inline w-6 h-6 mr-2 text-red-600" />
            Red Flag Clauses
          </h2>
          <div className="space-y-4">
            {redFlagClauses.map((clause, idx) => (
              <Card key={idx} className={
                clause.severity === 'high' ? 'border-red-200' :
                clause.severity === 'medium' ? 'border-amber-200' :
                'border-slate-200'
              }>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{clause.title}</h3>
                      <p className="text-slate-600">{clause.description}</p>
                    </div>
                    <Badge 
                      variant={clause.severity === 'high' ? 'danger' : clause.severity === 'medium' ? 'warning' : 'default'}
                      className="ml-4"
                    >
                      {clause.severity === 'high' ? 'High Risk' : clause.severity === 'medium' ? 'Caution' : 'Note'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Before Signing Checklist */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            <Eye className="inline w-6 h-6 mr-2 text-blue-600" />
            Before You Sign Checklist
          </h2>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {beforeSigning.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Pro Tip */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Pro Tip: Amendments Are Okay</h3>
            <p className="text-blue-800">
              You can negotiate and amend clauses in a lease before signing. Cross out, initial, and have both parties sign any changes. 
              A landlord who refuses any reasonable amendments may not be someone you want to rent from.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

