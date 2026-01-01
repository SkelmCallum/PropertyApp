# PropertyApp

A property rental aggregator for Cape Town, South Africa. Built to help renters find their perfect home by aggregating listings from multiple sources and providing scam detection.

## Features

- **Multi-source Aggregation**: Scrapes listings from Private Property, Property24, Facebook Marketplace, and more
- **Scam Detection**: Intelligent system that flags suspicious listings based on price analysis, contact verification, and known scam patterns
- **Direct Messaging**: Contact landlords and agents directly from the app
- **Education Hub**: Learn about tenant rights, legal fees, and lease agreements in South Africa
- **Free with Premium**: Core features are free; premium features unlocked through donations

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase Edge Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email, Google, Facebook)
- **Deployment**: Vercel (Web), Supabase (Database & Functions)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PropertyApp.git
   cd PropertyApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

The project uses Supabase. Migrations are in `supabase/migrations/`.

1. Link your Supabase project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

2. Push migrations:
   ```bash
   supabase db push
   ```

### Deployment

#### Vercel (Web App)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

#### Supabase Edge Functions

```bash
supabase functions deploy scrape-properties
```

## Project Structure

```
PropertyApp/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── education/      # Education section
│   │   ├── listings/       # Property listings
│   │   └── ...
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   └── layout/        # Layout components
│   └── lib/
│       ├── scrapers/      # Web scraping logic
│       ├── services/      # Business logic (scam detection)
│       ├── supabase/      # Supabase client config
│       ├── types/         # TypeScript types
│       └── utils/         # Utility functions
├── supabase/
│   ├── functions/         # Supabase Edge Functions
│   └── migrations/        # Database migrations
└── mobile/                # React Native app (future)
```

## Contributing

PropertyApp is built for the community. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) for details.

## Support

This is a free project built to help Cape Town renters. If you find it useful, consider [donating](/premium) to help keep it running.

---

Made with ❤️ for Cape Town renters
