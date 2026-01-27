# Database Migrations Guide

This project uses Supabase's standard migration system for managing database schema changes.

## 📁 Migration Structure

Migrations are stored in `supabase/migrations/` with timestamped filenames:
```
supabase/
├── config.toml          # Supabase project configuration
└── migrations/
    ├── 20250101000000_initial_schema.sql
    ├── 20250101000001_add_mandatory_cars.sql
    └── 20250125000000_add_car_fields.sql
```

## 🚀 Getting Started

### Prerequisites

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   # Or using Homebrew (macOS):
   brew install supabase/tap/supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (optional, for remote migrations):
   ```bash
   supabase link --project-ref your-project-ref
   ```
   Get your project ref from: Supabase Dashboard → Project Settings → General → Reference ID

## 📝 Creating New Migrations

### Method 1: Using Supabase CLI (Recommended)

```bash
# Create a new migration file
npm run db:migration:new add_new_feature

# This creates: supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql
# Edit the file with your SQL changes
```

### Method 2: Manual Creation

Create a file with format: `YYYYMMDDHHMMSS_description.sql`

Example: `20250125120000_add_user_preferences.sql`

## 🔄 Applying Migrations

### Option 1: Manual Application (Current Method)

If you're not using Supabase CLI, you can apply migrations manually:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file
4. Run them in chronological order (by timestamp)

### Option 2: Using Supabase CLI

#### For Remote Database (Production/Staging):

```bash
# Push all pending migrations to remote database
npm run db:push

# Or manually:
supabase db push
```

#### For Local Development:

```bash
# Start local Supabase (requires Docker)
supabase start

# Apply migrations
npm run db:migration:up

# Reset database and reapply all migrations
npm run db:reset
```

## 📋 Migration Best Practices

1. **Always use timestamps**: Format `YYYYMMDDHHMMSS_description.sql`
2. **One change per migration**: Keep migrations focused and atomic
3. **Make migrations reversible**: Consider rollback scenarios
4. **Test locally first**: Use `supabase start` to test migrations locally
5. **Never edit existing migrations**: Create new ones instead
6. **Use IF NOT EXISTS**: Prevents errors if migration runs twice
7. **Document complex logic**: Add comments explaining why, not just what

## 🔍 Checking Migration Status

```bash
# List all migrations and their status
npm run db:migration:list

# Or manually:
supabase migration list
```

## 🔄 Pulling Remote Changes

If you make changes directly in the Supabase Dashboard:

```bash
# Pull remote schema changes
npm run db:pull

# This creates a new migration file with the changes
```

## 📚 Current Migrations

### 1. `20250101000000_initial_schema.sql`
- Creates users, sessions, verification_tokens tables
- Creates rivals and user_rival_progress tables
- Sets up indexes and triggers

### 2. `20250101000001_add_mandatory_cars.sql`
- Creates mandatory_cars table
- Creates user_mandatory_car_progress table
- Inserts default mandatory cars list

### 3. `20250125000000_add_car_fields.sql`
- Adds brand, model, year, chassis columns to mandatory_cars
- Populates columns from existing name data
- Adds indexes for brand and year

## 🚨 Important Notes

- **Never delete migration files** once they've been applied to production
- **Always test migrations** on a staging environment first
- **Backup your database** before running migrations in production
- **Run migrations in order** - timestamps ensure correct order
- **Keep migrations in version control** - they're part of your codebase

## 🔧 Troubleshooting

### Migration fails with "already exists" error
- Use `IF NOT EXISTS` clauses in your SQL
- Check if the migration was partially applied

### Need to rollback a migration
- Create a new migration that reverses the changes
- Never modify existing migration files

### Migrations not applying
- Check that you're connected to the correct project
- Verify migration file naming format
- Check Supabase logs for detailed error messages

## 📖 Additional Resources

- [Supabase Migrations Documentation](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
