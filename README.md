# Tokyo Tracker

A modern web application built with Astro and Supabase, featuring user authentication with email verification.

## 🚀 Project Structure

```text
/
├── public/
├── src/
│   ├── lib/
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── db.ts            # Database functions (Supabase)
│   │   ├── session.ts      # Session management
│   │   ├── supabase.ts     # Supabase client configuration
│   │   └── validation.ts    # Zod schemas
│   └── pages/
│       ├── index.astro      # Dashboard (protected)
│       ├── login.astro      # Login page
│       ├── signup.astro     # Signup page
│       ├── verify-email.astro # Email verification page
│       └── api/
│           ├── login.ts     # Login API endpoint
│           ├── signup.ts    # Signup API endpoint
│           ├── logout.ts    # Logout API endpoint
│           └── verify-email.ts # Email verification endpoint
├── supabase/
│   ├── config.toml        # Supabase project configuration
│   └── migrations/         # Database migrations (timestamped SQL files)
├── wrangler.toml           # Cloudflare Pages configuration
└── package.json
```

## Features

- ✅ User registration with email, username, and password
- ✅ Secure password hashing with bcrypt
- ✅ Email verification system
- ✅ User login with session management
- ✅ Supabase database integration
- ✅ Modern, responsive UI with Tailwind CSS and DaisyUI

## Setup

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed database setup instructions.

Quick start:
1. Install dependencies: `npm install`
2. Create a Supabase project at [supabase.com](https://supabase.com)
3. Set up database: Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to apply migrations
4. Set environment variables: Create `.env` file with your Supabase credentials
5. Start dev server: `npm run dev`

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run dev:cloudflare`  | Build and run with Cloudflare Pages dev server   |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📚 Documentation

- [DEV_SETUP.md](./DEV_SETUP.md) - Development setup and local development guide
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase database setup guide
- [MIGRATIONS.md](./MIGRATIONS.md) - Database migrations guide
- [EMAIL_SETUP.md](./EMAIL_SETUP.md) - Email service (Resend) setup guide
- [DEPLOY.md](./DEPLOY.md) - Deployment guide for Cloudflare Pages
- [DEBUGGING.md](./DEBUGGING.md) - Debugging guide for production errors

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
