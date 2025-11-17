# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Required Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (found in Project Settings > API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key (found in Project Settings > API)
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_test_` for test mode, found in Dashboard > Developers > API keys)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_test_` for test mode, found in Dashboard > Developers > API keys)

## Quick Setup

1. Copy the template above into a new file named `.env.local`
2. Replace all placeholder values with your actual credentials
3. Never commit `.env.local` to version control (it's already in `.gitignore`)
