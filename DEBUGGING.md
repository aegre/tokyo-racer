# Debugging 500 Errors on Cloudflare Pages

This guide explains how to debug 500 errors when your app is deployed to Cloudflare Pages.

## Quick Reference

**Most common command:**
```bash
wrangler pages deployment tail
```

**Filter for errors only:**
```bash
wrangler pages deployment tail | jq 'select(.outcome == "exception")'
```

**Find specific error:**
```bash
wrangler pages deployment tail | grep "errorId"
```

See the [Wrangler CLI section](#method-2-wrangler-cli-recommended-for-cli-users) below for more commands.

## Quick Debugging Steps

### 1. Check Cloudflare Real-time Logs

**This is the most important step!**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → Your project
3. Click on **Real-time Logs** (or **Logs** tab)
4. You'll see live logs from your application

**What to look for:**
- `[ERROR]` entries - These show full error details
- `[ERROR ID]` entries - These help correlate errors with requests
- Stack traces and error messages

### 2. Check Error Responses

When a 500 error occurs, the response now includes:
- `error`: Error message
- `errorId`: Unique ID to find the error in logs
- `details`: Stack trace (in development only)

Example response:
```json
{
  "error": "Failed to create user: invalid result from database",
  "errorId": "m123abc-xyz9"
}
```

Use the `errorId` to search in Cloudflare logs.

## Viewing Logs in Cloudflare

### Method 1: Real-time Logs (Recommended)

1. **Dashboard** → **Workers & Pages** → Your project
2. Click **Real-time Logs** or **Logs** tab
3. Filter by:
   - Log level (Errors, Warnings, Info)
   - Time range
   - Search for specific error IDs or messages

### Method 2: Wrangler CLI (Recommended for CLI users)

You can view logs directly from the command line using Wrangler:

**Basic usage:**
```bash
# View real-time logs from your latest deployment
# This streams logs as they happen (like tail -f)
wrangler pages deployment tail

# View logs for a specific deployment
wrangler pages deployment tail <deployment-id>
```

**Get deployment information:**
```bash
# List all deployments to find the deployment ID
wrangler pages deployment list

# Or get project info
wrangler pages project list
```

**Filter and format logs:**
```bash
# Pretty format (easier to read)
wrangler pages deployment tail | jq

# Filter for errors only (using jq)
wrangler pages deployment tail | jq 'select(.outcome == "exception" or .exceptions != null)'

# Search for specific text
wrangler pages deployment tail | grep "ERROR"

# Show only your custom console.log/error statements
wrangler pages deployment tail | jq '.logs[]'
```

**Example log entry structure:**
```json
{
  "outcome": "ok" | "exception",
  "exceptions": [...],
  "logs": [
    {
      "level": "log" | "error" | "warn",
      "message": ["Your log message here"]
    }
  ],
  "event": {
    "request": {
      "url": "https://your-app.pages.dev/api/signup",
      "method": "POST"
    }
  },
  "eventTimestamp": 1234567890
}
```

**Useful one-liners:**
```bash
# Watch errors in real-time
wrangler pages deployment tail | jq 'select(.outcome == "exception")'

# Watch your console.error statements
wrangler pages deployment tail | jq '.logs[] | select(.level == "error")'

# Watch a specific endpoint
wrangler pages deployment tail | jq 'select(.event.request.url | contains("/api/signup"))'

# Pretty print all logs
wrangler pages deployment tail | jq -r '.logs[].message[]'
```

**Note**: 
- Make sure you're logged in: `wrangler login`
- Install `jq` for better JSON parsing: `brew install jq` (macOS) or `apt install jq` (Linux)
- The command runs continuously - press Ctrl+C to stop

### Method 3: Analytics Dashboard

1. Go to your project in Cloudflare Dashboard
2. Click **Analytics** tab
3. View error rates and patterns

## Common 500 Error Causes

### 1. Missing Environment Variables

**Symptoms:**
- Errors about "undefined" or "missing"
- Database connection failures
- API key errors

**Fix:**
1. Verify all variables are set in Cloudflare Pages dashboard
2. Make sure variables are set for the correct environment (Production/Preview)
3. Check variable names match exactly (case-sensitive)

### 2. Database Connection Issues

**Symptoms:**
- "Database not available" errors
- Supabase connection timeouts

**Fix:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is not paused
- Verify network connectivity from Cloudflare to Supabase

### 3. Import/Module Errors

**Symptoms:**
- "Cannot find module" errors
- Build succeeds but runtime fails

**Debug:**
- Check build logs in Cloudflare Pages
- Verify all dependencies are in `package.json`
- Check for missing type definitions

### 4. Runtime Errors

**Symptoms:**
- Errors in API routes
- Unhandled promise rejections

**Debug:**
- Check Real-time Logs for `[ERROR]` entries
- Look for the `errorId` in the response
- Review stack traces in logs

## Error Logging Features

All API endpoints now use improved error logging:

1. **Structured Logging**: Errors are logged as JSON with context
2. **Error IDs**: Each error gets a unique ID for tracking
3. **Context Information**: Logs include path, method, and request details
4. **Safe Responses**: Sensitive details are hidden in production

## Example Error Log Entry

When an error occurs, you'll see logs like this:

```json
[ERROR] {
  "timestamp": "2026-01-25T20:30:00.000Z",
  "path": "/api/signup",
  "method": "POST",
  "error": {
    "name": "Error",
    "message": "Failed to create user: invalid result from database",
    "stack": "Error: Failed to create user...\n    at createUser..."
  },
  "request": {
    "url": "https://your-app.pages.dev/api/signup"
  }
}
[ERROR ID] m123abc-xyz9 - /api/signup - Failed to create user: invalid result from database
```

## Debugging Workflow

### Step 1: Reproduce the Error
- Note the exact endpoint and request
- Check browser console for client-side errors
- Note the `errorId` from the response

### Step 2: Check Logs
- Open Cloudflare Real-time Logs
- Search for the `errorId` or error message
- Review the full error context

### Step 3: Test Locally
```bash
# Test the same endpoint locally
npm run dev
# Then test the endpoint that's failing
```

### Step 4: Fix and Redeploy
```bash
npm run build
npm run deploy
```

## Best Practices

1. **Always check logs first** - Most issues are visible in Real-time Logs
2. **Use error IDs** - They help correlate errors across requests
3. **Check environment variables** - Many errors are due to missing config
4. **Test locally first** - Reproduce errors locally when possible
5. **Monitor error rates** - Use Cloudflare Analytics to track error patterns

## Getting Help

If you're stuck:

1. Check the error logs with the `errorId`
2. Verify environment variables in Cloudflare dashboard
3. Review the error message and stack trace in logs
4. Check if the same code works locally
5. Ensure all environment variables are set correctly

## Quick Commands Cheat Sheet

```bash
# Login to Cloudflare
wrangler login

# List all deployments
wrangler pages deployment list

# View logs (real-time)
wrangler pages deployment tail

# View logs with pretty formatting
wrangler pages deployment tail | jq

# View only errors
wrangler pages deployment tail | jq 'select(.outcome == "exception")'

# View custom error logs
wrangler pages deployment tail | jq '.logs[] | select(.level == "error")'

# Search for specific error ID
wrangler pages deployment tail | grep "m123abc-xyz9"

# Search for error message
wrangler pages deployment tail | grep "Failed to create user"
```

**Tips:**
- Keep `wrangler pages deployment tail` running in a terminal while testing
- Use `jq` for better JSON parsing: `brew install jq` (macOS) or `apt install jq` (Linux)
- Filter early to avoid overwhelming output

## Additional Resources

- [Cloudflare Pages Logs Documentation](https://developers.cloudflare.com/pages/platform/functions/logging/)
- [Cloudflare Workers Debugging](https://developers.cloudflare.com/workers/observability/logging/)
- [Astro Error Handling](https://docs.astro.build/en/guides/errors/)
