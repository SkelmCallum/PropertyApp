import Link from 'next/link';
import { Search, Shield, MessageSquare, BookOpen, Heart, Zap, ArrowRight, Building2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';

const features = [
  {
    icon: Search,
    title: 'All Listings, One Place',
    description: 'We aggregate listings from Private Property, Property24, Facebook Marketplace, and more. No more jumping between websites.',
  },
  {
    icon: Shield,
    title: 'Scam Protection',
    description: 'Our intelligent system flags suspicious listings so you can rent with confidence. We check for common red flags automatically.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    description: 'Contact agents and landlords directly from our app. All your conversations in one place.',
  },
  {
    icon: BookOpen,
    title: 'Know Your Rights',
    description: 'Access resources about rental laws, legal fees, and what landlords can and cannot do.',
  },
];

const stats = [
  { value: '10K+', label: 'Active Listings' },
  { value: '5', label: 'Platforms Aggregated' },
  { value: '24/7', label: 'Scam Monitoring' },
  { value: 'Free', label: 'Always Free' },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" />
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#10b981" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8">
              <Heart className="w-4 h-4 fill-emerald-600" />
              Built for Cape Town renters
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Find your perfect
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                rental home
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              We know how hard it is to find a rental in Cape Town. That&apos;s why we built PropertyApp &mdash; 
              aggregating listings from everywhere, filtering out scams, and putting you in control.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by suburb, area, or property type..."
                    className="w-full py-3 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <Link href="/listings">
                  <Button size="lg" className="w-full sm:w-auto px-8">
                    Search Rentals
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600">
              <span>Popular:</span>
              {['Cape Town CBD', 'Sea Point', 'Observatory', 'Woodstock', 'Rondebosch'].map((area) => (
                <Link
                  key={area}
                  href={`/listings?suburb=${encodeURIComponent(area)}`}
                  className="px-3 py-1 bg-white hover:bg-emerald-50 border border-slate-200 rounded-full hover:border-emerald-300 hover:text-emerald-700 transition-all"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to find a home
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We built the tools we wished we had when searching for rentals in Cape Town.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 md:py-28 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                The Housing Crisis
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Finding a rental in Cape Town shouldn&apos;t be this hard
              </h2>
              <p className="text-slate-300 text-lg mb-6">
                Demand far exceeds supply. Scammers prey on desperate renters. Legitimate listings 
                disappear within hours. Information is scattered across dozens of websites.
              </p>
              <p className="text-slate-300 text-lg mb-8">
                We built PropertyApp because we&apos;ve been there. This is our way of giving back 
                to the community and making the search just a little bit easier.
              </p>
              <Link href="/about">
                <Button variant="secondary" size="lg">
                  Our Story
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-800 rounded-xl">
                <Building2 className="w-8 h-8 text-emerald-400 mb-4" />
                <div className="text-2xl font-bold text-white mb-1">High Demand</div>
                <p className="text-slate-400 text-sm">More renters than available properties</p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl">
                <Shield className="w-8 h-8 text-amber-400 mb-4" />
                <div className="text-2xl font-bold text-white mb-1">Scam Risk</div>
                <p className="text-slate-400 text-sm">Fraudsters target desperate renters</p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl">
                <Zap className="w-8 h-8 text-cyan-400 mb-4" />
                <div className="text-2xl font-bold text-white mb-1">Fast Paced</div>
                <p className="text-slate-400 text-sm">Good listings go in hours</p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl">
                <Users className="w-8 h-8 text-purple-400 mb-4" />
                <div className="text-2xl font-bold text-white mb-1">For Renters</div>
                <p className="text-slate-400 text-sm">Built by the community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Ready to find your new home?
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Start searching now. It&apos;s completely free, and always will be.
            Consider donating if we help you find your place!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/listings">
              <Button size="lg" className="px-8">
                Start Searching
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/premium">
              <Button variant="outline" size="lg" className="px-8">
                <Heart className="w-4 h-4 mr-2" />
                Support Our Mission
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
