# Development Setup Guide

This project uses Supabase for the database. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database setup instructions.

## Prerequisites

- Node.js 20.19.0 or higher
- A Supabase account and project (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Get these values from your Supabase project settings:
- **Project URL**: Project Settings → API → Project URL
- **Service Role Key**: Project Settings → API → service_role key (secret)

⚠️ **Important**: The service_role key is a secret with elevated privileges. Never expose it in client-side code!

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Apply database migrations (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
4. Run the SQL script to create all tables and indexes

### 4. Start Development Server

```bash
npm run dev
```

This will start the Astro development server at `http://localhost:4321`.

## Development Commands

```bash
# Start Astro dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Build and run with Cloudflare Pages dev (if deploying to Cloudflare)
npm run dev:cloudflare
```

## Project Structure

```
tokyo-tracker/
├── src/
│   ├── lib/
│   │   ├── db.ts          # Database functions (Supabase)
│   │   ├── session.ts     # Session management
│   │   ├── auth.ts        # Authentication utilities
│   │   ├── supabase.ts    # Supabase client configuration
│   │   └── validation.ts  # Zod schemas
│   ├── pages/
│   │   ├── api/           # API routes
│   │   ├── index.astro    # Dashboard (protected)
│   │   ├── login.astro    # Login page
│   │   ├── signup.astro   # Signup page
│   │   └── verify-email.astro
│   └── styles/
│       └── global.css
└── .env                   # Environment variables (create this)
```

## Troubleshooting

### Supabase connection errors

If you see errors about missing Supabase credentials:

1. Make sure you've created a `.env` file
2. Verify your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
3. Check that your Supabase project is active

### Database errors

If you see database-related errors:

1. Make sure you've applied all migrations from `supabase/migrations/` (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
2. Verify your tables exist in the Supabase dashboard (Table Editor)
3. Check that your Supabase project is not paused

### Build errors

If you encounter build errors:

1. Make sure all dependencies are installed: `npm install`
2. Clear the build cache: `rm -rf .astro dist .wrangler`
3. Try rebuilding: `npm run build`

## Deployment

### Cloudflare Pages

This project is configured to deploy to Cloudflare Pages:

1. Build the project: `npm run build`
2. Deploy: `wrangler pages deploy dist`

Make sure to set the environment variables in Cloudflare Pages dashboard:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `APP_URL`

See [DEPLOY.md](./DEPLOY.md) for complete deployment instructions.

### Other Platforms

This project can be deployed to any platform that supports Astro:
- Vercel
- Netlify
- Railway
- etc.

Just make sure to set the Supabase environment variables in your platform's environment variable settings.
