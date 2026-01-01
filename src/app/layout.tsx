import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Analytics } from '@vercel/analytics/next';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'PropertyApp - Find Your Perfect Rental in Cape Town',
  description: 'Your trusted companion for finding rental properties in Cape Town. Aggregated listings from Private Property, Property24, Facebook & more. Scam protection included.',
  keywords: ['rental', 'property', 'cape town', 'south africa', 'apartment', 'house', 'rent'],
  authors: [{ name: 'PropertyApp Team' }],
  openGraph: {
    title: 'PropertyApp - Find Your Perfect Rental in Cape Town',
    description: 'Your trusted companion for finding rental properties in Cape Town.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
