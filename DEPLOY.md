# Deploying to Cloudflare Pages

This guide will help you deploy your Tokyo Tracker app to Cloudflare Pages.

## Quick Start

1. **Login to Cloudflare**: `wrangler login`
2. **Deploy**: `npm run deploy`
3. **Set Environment Variables** in Cloudflare Dashboard (see below)
4. **Redeploy**: `npm run deploy`

For detailed instructions, see the sections below.

## Prerequisites

1. A Cloudflare account (free tier works)
2. Wrangler CLI installed: `npm install -g wrangler`
3. Your Supabase credentials ready

## Method 1: Deploy via Wrangler CLI (Recommended)

### Step 1: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for you to authenticate.

### Step 2: Build the Project

```bash
npm run build
```

This creates a `dist` folder with your production build.

### Step 3: Deploy to Cloudflare Pages

```bash
wrangler pages deploy dist
```

On first deployment, you'll be prompted to:
- Create a new project or link to an existing one
- Choose a project name (e.g., "tokyo-tracker")

### Step 4: Set Environment Variables

After deployment, set your environment variables in the Cloudflare dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → Your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

**Production Environment:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
APP_URL=https://your-project.pages.dev
```

**Preview Environment (optional):**
You can set different values for preview deployments if needed.

### Step 5: Redeploy

After setting environment variables, redeploy to apply them:

```bash
npm run build
wrangler pages deploy dist
```

## Method 2: Deploy via Git Integration (Continuous Deployment)

### Step 1: Push to GitHub/GitLab

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a repository on GitHub/GitLab and push:
   ```bash
   git remote add origin https://github.com/yourusername/tokyo-tracker.git
   git push -u origin main
   ```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select your Git provider (GitHub/GitLab)
4. Authorize Cloudflare to access your repositories
5. Select your `tokyo-tracker` repository
6. Configure build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave empty)

### Step 3: Set Environment Variables

Before the first deployment completes:

1. In the project settings, go to **Environment Variables**
2. Add all the required variables (same as Method 1, Step 4)
3. Save

### Step 4: Deploy

Cloudflare will automatically:
- Build your project
- Deploy it
- Set up a preview URL

Every push to your main branch will trigger a new deployment.

## Environment Variables Required

Make sure to set these in Cloudflare Pages:

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | `eyJhbGc...` |
| `RESEND_API_KEY` | Resend API key for emails | `re_xxxxx` |
| `FROM_EMAIL` | Email sender address | `noreply@yourdomain.com` |
| `APP_URL` | Your app's public URL | `https://tokyo-tracker.pages.dev` |

⚠️ **Important**: Never commit your `.env` file to git! These secrets should only be set in Cloudflare's dashboard.

## Post-Deployment Steps

### 1. Verify Your Domain (Optional)

1. In Cloudflare Pages, go to **Custom domains**
2. Add your domain
3. Follow the DNS setup instructions

### 3. Test the Deployment

1. Visit your deployment URL (e.g., `https://tokyo-tracker.pages.dev`)
2. Test signup/login
3. Verify email sending works
4. Check that rivals data loads correctly

## Debugging 500 Errors

If you encounter 500 errors after deployment:

1. **Check Cloudflare Real-time Logs**:
   - Go to Dashboard → Workers & Pages → Your project
   - Click **Real-time Logs** or **Logs** tab
   - Look for `[ERROR]` entries with full error details

2. **Review Error Details**:
   - Check the error message in the response
   - Look for error IDs in Cloudflare logs
   - Verify environment variables are set in Cloudflare dashboard

3. **Check Error Response**:
   - 500 errors now include an `errorId` in the response
   - Use this ID to search in Cloudflare logs

See [DEBUGGING.md](./DEBUGGING.md) for a complete debugging guide.

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs in Cloudflare dashboard

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Production/Preview)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Database Connection Errors

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is active (not paused)
- Ensure all migrations have been applied to Supabase (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

### Email Not Sending

- Verify `RESEND_API_KEY` is set correctly
- Check `FROM_EMAIL` matches your Resend domain
- Review Resend dashboard for delivery logs

## Updating Your Deployment

### Via CLI:
```bash
npm run build
wrangler pages deploy dist
```

### Via Git:
Just push to your main branch - Cloudflare will auto-deploy!

## Useful Commands

```bash
# Build locally
npm run build

# Preview build locally
npm run preview

# Deploy to Cloudflare
wrangler pages deploy dist

# View deployment logs
wrangler pages deployment list

# View project info
wrangler pages project list
```

## Next Steps

- Set up a custom domain
- Configure email domain in Resend
- Set up monitoring/analytics
- Configure backup strategies for your database
