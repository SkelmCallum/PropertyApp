import Link from 'next/link';
import { Heart, Check, Zap, Shield, Bell, Star, Coffee, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';

const freeFeatures = [
  'Access to all property listings',
  'Basic search and filtering',
  'Scam detection warnings',
  'Send messages to landlords',
  'Save favorite properties',
  'Educational resources',
];

const premiumFeatures = [
  'Ad-free experience',
  'Advanced search filters',
  'Early access to new listings',
  'Priority customer support',
  'Saved search notifications',
  'Detailed scam analysis reports',
  'Unlimited message templates',
  'Download listings offline',
];

const donationTiers = [
  {
    amount: 50,
    label: 'Coffee',
    icon: Coffee,
    description: 'Buy us a coffee',
    months: 0,
  },
  {
    amount: 100,
    label: 'Supporter',
    icon: Heart,
    description: '1 month of premium',
    months: 1,
    popular: false,
  },
  {
    amount: 250,
    label: 'Champion',
    icon: Star,
    description: '3 months of premium',
    months: 3,
    popular: true,
  },
  {
    amount: 500,
    label: 'Hero',
    icon: Shield,
    description: '6 months of premium',
    months: 6,
  },
];

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Badge className="bg-white/20 text-white mb-6">
            <Heart className="w-3 h-3 mr-1 fill-current" />
            Support Our Mission
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            PropertyApp is Free.
            <br />
            <span className="text-emerald-200">Always Will Be.</span>
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
            We built PropertyApp to help Cape Town renters. Your donations help us maintain the service, 
            improve features, and keep fighting scams. Plus, you get premium features as a thank you!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Tier */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Free</h2>
              <p className="text-slate-600 mb-6">Everything you need to find a rental</p>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/listings">
                <Button variant="outline" className="w-full">
                  Start Searching
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="border-2 border-emerald-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-emerald-500 text-white">
                <Zap className="w-3 h-3 mr-1" />
                Donors Get This
              </Badge>
            </div>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Premium</h2>
              <p className="text-slate-600 mb-6">Unlock with any donation</p>
              <ul className="space-y-3 mb-8">
                {premiumFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Donate Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Donation Tiers */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Support Level</h2>
            <p className="text-slate-600 max-w-lg mx-auto">
              Every rand helps us maintain and improve PropertyApp. Pick what works for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {donationTiers.map((tier) => (
              <Card 
                key={tier.amount} 
                className={tier.popular ? 'border-2 border-emerald-500 relative' : ''}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <tier.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">R{tier.amount}</div>
                  <div className="text-sm text-slate-500 mb-4">{tier.description}</div>
                  <Button 
                    className="w-full"
                    variant={tier.popular ? 'primary' : 'outline'}
                  >
                    Donate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Custom amounts accepted. Payments processed securely via Stripe.
          </p>
        </section>

        {/* Why Donate */}
        <section className="mb-16">
          <Card className="bg-slate-900 text-white">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Why Your Support Matters</h2>
                  <p className="text-slate-300 mb-6">
                    PropertyApp runs on donations and a small team&apos;s dedication. Here&apos;s where your money goes:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span>Server and infrastructure costs</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span>Improving scam detection algorithms</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span>Adding new property sources</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span>Keeping the service free for everyone</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-emerald-400 mb-2">R0</div>
                  <p className="text-slate-400">Cost to search for your next home</p>
                  <p className="text-sm text-slate-500 mt-4">
                    Unlike other platforms, we don&apos;t charge listing fees or commissions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Is the free version limited?</h3>
                <p className="text-slate-600">
                  No! The free version includes everything you need. Premium features are bonuses to thank donors.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-2">How long does premium last?</h3>
                <p className="text-slate-600">
                  Premium duration depends on your donation amount. Minimum R100 for 1 month, scaling up from there.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Can I donate anonymously?</h3>
                <p className="text-slate-600">
                  Yes! You can choose to keep your donation anonymous. We won&apos;t share your info.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Is my payment secure?</h3>
                <p className="text-slate-600">
                  Absolutely. We use Stripe for payment processing. We never see or store your card details.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

