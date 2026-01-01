import Link from 'next/link';
import { Scale, Banknote, FileText, HelpCircle, Shield, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';

const resources = [
  {
    icon: Scale,
    title: 'Know Your Rights',
    description: 'Understand your legal rights as a tenant in South Africa. Learn what landlords can and cannot do.',
    href: '/education/rights',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Banknote,
    title: 'Legal Fees Guide',
    description: 'What fees are legal? What are typical deposits? Avoid being overcharged with our comprehensive guide.',
    href: '/education/fees',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: FileText,
    title: 'Lease Agreements',
    description: 'What to look for in a lease agreement. Red flags to avoid and clauses that protect you.',
    href: '/education/lease',
    color: 'bg-purple-100 text-purple-600',
  },
];

const tips = [
  {
    icon: Shield,
    title: 'Never pay before viewing',
    description: 'Always view the property in person before making any payments. Scammers often ask for deposits before viewings.',
  },
  {
    icon: AlertTriangle,
    title: 'Verify the landlord',
    description: 'Ask for ID and proof of property ownership. Legitimate landlords will have no problem providing these.',
  },
  {
    icon: HelpCircle,
    title: 'Get everything in writing',
    description: 'All agreements, including verbal ones about repairs or inclusions, should be documented in your lease.',
  },
];

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Know Your Rights</h1>
            <p className="text-lg text-emerald-100">
              Renting in South Africa comes with legal protections. Learn what you&apos;re entitled to and how to protect yourself from unfair practices.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Resources Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {resources.map((resource) => (
            <Link key={resource.href} href={resource.href}>
              <Card className="h-full hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl ${resource.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <resource.icon className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {resource.title}
                  </h2>
                  <p className="text-slate-600 mb-4">{resource.description}</p>
                  <div className="flex items-center text-emerald-600 font-medium">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Safety Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tips.map((tip, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <tip.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{tip.title}</h3>
                      <p className="text-sm text-slate-600">{tip.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-slate-300 mb-6 max-w-lg mx-auto">
              If you believe you&apos;ve been scammed or your rights have been violated, there are resources available to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://www.westerncape.gov.za/service/rental-housing-tribunal" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">Rental Housing Tribunal</Button>
              </a>
              <a href="https://www.lssa.org.za" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Find a Lawyer
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

