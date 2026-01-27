# Email Setup Guide

This guide explains how to set up email sending for verification emails.

## What Needs to Be Sent

When a user signs up, you need to send them an email containing:
- **Verification URL**: `https://your-domain.com/verify-email?token={verificationToken}`
- **User's email address**: The email they registered with
- **Expiration notice**: The token expires in 24 hours

## Email Service Options

### Recommended: Resend (Modern & Easy)
- **Free tier**: 3,000 emails/month, 100 emails/day
- **Simple API**: Very developer-friendly
- **Great deliverability**: Built for transactional emails
- **Website**: https://resend.com

### Alternative Options

1. **SendGrid**
   - Free tier: 100 emails/day
   - More complex setup
   - Website: https://sendgrid.com

2. **Mailgun**
   - Free tier: 5,000 emails/month for 3 months
   - Good for developers
   - Website: https://mailgun.com

3. **AWS SES**
   - Very cheap ($0.10 per 1,000 emails)
   - More complex setup
   - Website: https://aws.amazon.com/ses

4. **Supabase Edge Functions** (if using Supabase)
   - Can use Supabase's built-in email capabilities
   - Integrated with your existing Supabase setup

## Quick Start with Resend (Recommended)

### 1. Create Resend Account

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email

### 2. Get API Key

1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name it (e.g., "Tokyo Tracker Production")
4. Copy the API key (starts with `re_`)

### 3. Verify Domain (Optional but Recommended)

For production, you should verify your domain:
1. Go to **Domains** in Resend
2. Add your domain
3. Add the DNS records they provide
4. Wait for verification

For development, you can use their test domain: `onboarding@resend.dev`

### 4. Install Resend Package

```bash
npm install resend
```

### 5. Add Environment Variable

Add to your `.env` file:

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
# Or for development:
# FROM_EMAIL=onboarding@resend.dev
```

### 6. Update Code

The code has been updated to use Resend. See `src/lib/email.ts` for the implementation.

## Email Content

The verification email should include:

**Subject**: "Verify your Tokyo Tracker account"

**Body**:
```
Hi {username},

Thanks for signing up! Please verify your email address by clicking the link below:

{verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Thanks,
Tokyo Tracker Team
```

## Environment Variables Needed

Add these to your `.env` file:

```env
# Resend (or your email service)
RESEND_API_KEY=re_your_api_key_here

# Email sender address
FROM_EMAIL=noreply@yourdomain.com
# Or use Resend's test domain for development:
# FROM_EMAIL=onboarding@resend.dev

# Your app URL (for verification links)
APP_URL=https://your-domain.com
# Or for development:
# APP_URL=http://localhost:4321
```

## Testing

1. Use Resend's test domain for development: `onboarding@resend.dev`
2. Check Resend dashboard for email logs
3. Test with real email addresses before going to production

## Troubleshooting

### Emails not sending
- Check your API key is correct
- Verify your domain (if using custom domain)
- Check Resend dashboard for error logs
- Make sure `FROM_EMAIL` matches your verified domain

### Emails going to spam
- Verify your domain with SPF/DKIM records
- Use a proper "From" address
- Include unsubscribe links (for marketing emails)
- Keep email content professional

## Production Checklist

- [ ] Verify your domain in Resend
- [ ] Set up SPF and DKIM records
- [ ] Use a proper "From" email address
- [ ] Test email delivery
- [ ] Set up email monitoring/alerts
- [ ] Add error handling for failed sends
- [ ] Consider email retry logic
