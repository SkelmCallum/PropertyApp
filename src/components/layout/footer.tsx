import Link from 'next/link';
import { Home, Heart } from 'lucide-react';

const footerLinks = {
  product: [
    { href: '/listings', label: 'Find Rentals' },
    { href: '/education', label: 'Rental Rights' },
    { href: '/premium', label: 'Premium Features' },
  ],
  resources: [
    { href: '/education/rights', label: 'Know Your Rights' },
    { href: '/education/fees', label: 'Legal Fees Guide' },
    { href: '/education/lease', label: 'Lease Agreements' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PropertyApp</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              Making rental property search easier and safer for everyone in Cape Town.
              Built for renters, by people who understand the struggle.
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for Cape Town renters
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} PropertyApp. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            This is a free service. Consider{' '}
            <Link href="/premium" className="text-emerald-400 hover:underline">
              donating
            </Link>{' '}
            to support our mission.
          </p>
        </div>
      </div>
    </footer>
  );
}

