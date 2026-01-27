# Supabase Setup Guide

This project uses Supabase for the database with modern API key practices.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in Supabase

## Setup Steps

### 1. Create Database Tables

**Option A: Using Supabase Migrations (Recommended)**

1. Install Supabase CLI: `npm install -g supabase` or `brew install supabase/tap/supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref your-project-ref`
4. Apply migrations: `supabase db push`

See [MIGRATIONS.md](./MIGRATIONS.md) for detailed migration guide.

**Option B: Manual Application**

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run migrations in order from `supabase/migrations/`:
   - `20250101000000_initial_schema.sql`
   - `20250101000001_add_mandatory_cars.sql`
   - `20250125000000_add_car_fields.sql`

### 2. Get Your Supabase Credentials

1. Go to **Project Settings → API**
2. Copy your:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **service_role key (secret)** (this is your `SUPABASE_SERVICE_ROLE_KEY`)
     - ⚠️ **Important**: This is a secret key with elevated privileges. Never expose it in client-side code!

### 3. Configure Environment Variables

Create a `.env` file in the project root (or copy from `.env.example`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Why service_role key?**
- This app runs entirely server-side (Astro API routes)
- The service_role key provides full database access needed for our custom authentication
- It bypasses Row Level Security (RLS), which is appropriate since we manage auth ourselves
- It's never exposed to the client, keeping it secure

### 4. For Production Deployment

If deploying to Cloudflare Pages:

1. Go to your Cloudflare Pages project settings
2. Navigate to Environment Variables
3. Add:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service_role key (secret)

⚠️ **Security**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is marked as "Encrypted" or "Secret" in your deployment platform.

## API Keys Explained

Supabase offers different types of API keys:

- **Publishable Key** (`sb_publishable_...`): For client-side use, low privileges, safe to expose
- **Secret Key** (`sb_secret_...`): For server-side use, elevated privileges, must be kept secret
- **anon key** (legacy): Equivalent to publishable key, being phased out
- **service_role key** (legacy): Equivalent to secret key, still widely used

This project uses the **service_role key** because:
- All database operations happen server-side
- We need full database access for custom authentication
- The key is never exposed to clients

## Database Schema

The schema includes:
- **users** - User accounts with email, username, password, and verification status
- **verification_tokens** - Email verification tokens
- **sessions** - User session tokens
- **rivals** - Wanderer/rival information
- **user_rival_progress** - User progress tracking for rivals
- **mandatory_cars** - List of mandatory cars (with brand, model, year, chassis)
- **user_mandatory_car_progress** - User progress tracking for mandatory cars

All tables have proper indexes and foreign key constraints.

**Migrations**: Database schema is managed through Supabase migrations in `supabase/migrations/`. See [MIGRATIONS.md](./MIGRATIONS.md) for details.

## Migration from D1

If you were previously using D1:
- All D1-specific code has been removed
- Database functions now use Supabase client
- No more `initDatabase()` calls needed (tables are managed via Supabase)
- Environment variables changed from D1 bindings to Supabase credentials

## Development

The Supabase client is automatically configured when you set the environment variables. The client works in:
- Server-side (Astro API routes) - using service_role key
- All operations are server-side, so no client-side Supabase code is needed

## Security Notes

- ✅ The service_role key is only used server-side and never exposed to clients
- ✅ All database operations happen in secure API routes
- ✅ Row Level Security (RLS) is not needed since we use service_role key and manage auth ourselves
- ⚠️ Never commit your `.env` file with real keys to version control
- ⚠️ Always use environment variables for sensitive keys in production

## Troubleshooting

### "Missing Supabase service role key" error

Make sure you've:
1. Copied the **service_role key (secret)** from Project Settings → API
2. Set it as `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file
3. Restarted your development server after adding the variable

### Using the wrong key type

If you're using the anon/publishable key instead of service_role:
- You may get permission errors
- Some operations might fail
- Switch to using `SUPABASE_SERVICE_ROLE_KEY` instead
