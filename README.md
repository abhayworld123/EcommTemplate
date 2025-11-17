# Ecommerce Template - Next.js

A modern ecommerce template built with Next.js 14, Supabase, and Stripe. Import products via Excel and start selling!

## Features

- 📦 Excel-based product import (client-side and server-side)
- 🛒 Full shopping cart functionality
- 💳 Stripe payment integration (test mode)
- 👤 Optional user authentication
- 🎨 Modern, responsive UI with Tailwind CSS
- 📊 Admin dashboard for order and product management
- 🚀 Ready-to-use default watch store data

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migration from `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
3. Get your Supabase URL and anon key from Project Settings > API

### 3. Set Up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Get your test API keys from the Dashboard > Developers > API keys
3. Use test card: `4242 4242 4242 4242` for testing

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Update the values:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_test_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_test_`)

### 5. Seed Default Data

Visit `/api/seed` in your browser or run:

```bash
curl http://localhost:3000/api/seed
```

This will populate your database with default watch products.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Excel Import Format

When importing products via Excel, use the following columns:

| name | description | price | image_url | category | stock | featured |
|------|-------------|-------|-----------|----------|-------|----------|
| Watch Model X | Description... | 299.99 | /images/watch1.jpg | Men | 50 | true |

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - React components
- `contexts/` - React context providers (Cart)
- `lib/` - Utility functions and configurations
- `types/` - TypeScript type definitions
- `data/` - Default data files

## Admin Panel

Access the admin panel at `/admin`:
- Dashboard with statistics
- Product management
- Excel import interface
- Order management

## Authentication

User authentication is optional. Guest checkout is available. To enable user accounts:
- Login: `/login`
- Register: `/register`

## Payment Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and any CVC

## License

MIT
