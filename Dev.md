# Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Database Schema](#database-schema)
7. [API Routes](#api-routes)
8. [Components](#components)
9. [Key Features](#key-features)
10. [Development Workflow](#development-workflow)
11. [Common Tasks](#common-tasks)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

This is a modern, full-featured ecommerce template built with Next.js 14 (App Router), Supabase, and Stripe. The template supports product management via Excel import, a complete shopping cart flow, payment processing, and an admin dashboard.

### Key Capabilities
- **Product Management**: Import products via Excel (client-side or server-side parsing)
- **Shopping Cart**: Full cart functionality with localStorage persistence
- **Payment Processing**: Stripe Checkout integration (test mode)
- **User Authentication**: Optional Supabase Auth (guest checkout supported)
- **Admin Dashboard**: Product and order management interface
- **Modern UI**: Premium design with Tailwind CSS, Framer Motion animations

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Next.js App   │
│   (App Router)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Supabase│ │Stripe │
│  DB    │ │Payment│
└────────┘ └───────┘
```

### Data Flow

1. **Product Display**: Server Components fetch from Supabase → Display on pages
2. **Cart Management**: Client-side Context API → localStorage persistence
3. **Checkout**: Form submission → API route → Stripe session → Redirect to Stripe
4. **Order Processing**: Stripe webhook → Update order status in Supabase

---

## Tech Stack

### Core Framework
- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Animation library
- **Lucide React 0.553.0** - Icon library
- **Inter & Playfair Display** - Google Fonts

### Backend & Database
- **Supabase** - PostgreSQL database + Auth + Storage
- **@supabase/supabase-js 2.81.1** - Supabase client
- **@supabase/ssr 0.7.0** - Server-side rendering support

### Payment Processing
- **Stripe 19.3.0** - Payment processing
- **@stripe/stripe-js 8.4.0** - Stripe client SDK

### Form Handling
- **React Hook Form 7.66.0** - Form management
- **Zod 4.1.12** - Schema validation
- **@hookform/resolvers 5.2.2** - Form validation resolvers

### Utilities
- **xlsx 0.18.5** - Excel file parsing
- **clsx 2.1.1** - Conditional class names
- **tailwind-merge 3.4.0** - Tailwind class merging

---

## Project Structure

```
clone1/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth routes (future grouping)
│   │   ├── login/
│   │   └── register/
│   ├── (shop)/                  # Shop routes
│   │   ├── page.tsx             # Landing page
│   │   ├── products/
│   │   │   ├── page.tsx         # Product listing
│   │   │   └── [id]/page.tsx    # Product detail
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── success/
│   ├── admin/                   # Admin panel
│   │   ├── page.tsx             # Dashboard
│   │   ├── products/
│   │   │   ├── page.tsx         # Product management
│   │   │   └── import/page.tsx  # Excel import
│   │   └── orders/page.tsx
│   ├── api/                     # API routes
│   │   ├── products/
│   │   ├── checkout/
│   │   ├── admin/
│   │   ├── seed/
│   │   └── webhooks/stripe/
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/                  # React components
│   ├── ProductCard.tsx
│   ├── ProductList.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   └── Navbar.tsx
├── contexts/                    # React Context providers
│   └── CartContext.tsx
├── lib/                         # Utility functions
│   ├── supabase.ts             # Supabase client
│   ├── stripe.ts                # Stripe client
│   ├── excelParser.ts          # Excel parsing utilities
│   ├── seed.ts                 # Database seeding
│   └── utils.ts                # Helper functions
├── types/                       # TypeScript definitions
│   └── index.ts
├── data/                        # Default data files
│   ├── default-watches.json
│   └── default-household-services.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── public/                      # Static assets
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)

### Step-by-Step Setup

#### 1. Clone and Install
```bash
git clone <repository-url>
cd clone1
npm install
```

#### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration:
   ```sql
   -- Copy contents from supabase/migrations/001_initial_schema.sql
   ```
3. Get your credentials:
   - Project URL: `https://your-project.supabase.co`
   - Anon Key: Found in Settings > API

#### 3. Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard > Developers > API keys
3. Test card: `4242 4242 4242 4242` (any future expiry, any CVC)

#### 4. Environment Variables

Create `.env.local` in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

#### 5. Seed Database

```bash
# Start dev server first
npm run dev

# Then seed database
curl http://localhost:3000/api/seed
# Or visit http://localhost:3000/api/seed in browser
```

#### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Database Schema

### Tables

#### `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `order_items`
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `site_config`
```sql
CREATE TABLE site_config (
  id TEXT PRIMARY KEY DEFAULT '1',
  site_name TEXT NOT NULL,
  banner_image TEXT,
  description TEXT,
  theme_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relationships
- `orders.user_id` → `auth.users.id` (optional, for authenticated users)
- `order_items.order_id` → `orders.id` (CASCADE delete)
- `order_items.product_id` → `products.id`

---

## API Routes

### Public Routes

#### `GET /api/products`
Fetch all products.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Product Name",
    "description": "Description",
    "price": 299.99,
    "image_url": "https://...",
    "category": "Category",
    "stock": 50,
    "featured": true
  }
]
```

#### `POST /api/products`
Create a new product (admin).

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Description",
  "price": 299.99,
  "image_url": "https://...",
  "category": "Category",
  "stock": 50,
  "featured": false
}
```

### Checkout Routes

#### `POST /api/checkout`
Create Stripe checkout session.

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 299.99
    }
  ],
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "zip": "10001",
    "country": "United States"
  }
}
```

**Response:**
```json
{
  "sessionId": "cs_test_..."
}
```

### Admin Routes

#### `GET /api/admin/dashboard`
Get dashboard statistics and orders.

**Response:**
```json
{
  "orders": [...],
  "stats": {
    "totalRevenue": 5000.00,
    "totalOrders": 25,
    "totalProducts": 30
  }
}
```

#### `POST /api/admin/import`
Import products from Excel file.

**Request:** FormData with `file` field

**Response:**
```json
{
  "success": true,
  "count": 10,
  "products": [...]
}
```

#### `PUT /api/admin/products?id={id}`
Update a product.

#### `DELETE /api/admin/products?id={id}`
Delete a product.

#### `PUT /api/admin/orders?id={id}`
Update order status.

**Request Body:**
```json
{
  "status": "completed"
}
```

### Utility Routes

#### `GET /api/seed`
Seed database with default data.

**Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully"
}
```

---

## Components

### ProductCard
**Location:** `components/ProductCard.tsx`

Displays a single product card with image, name, price, and add to cart button.

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
  index?: number; // For animation delay
}
```

**Features:**
- Hover animations (scale, shadow elevation)
- Image overlay on hover
- Featured badge
- Stock warnings
- Gradient price display

### ProductList
**Location:** `components/ProductList.tsx`

Renders a grid of ProductCard components.

**Props:**
```typescript
interface ProductListProps {
  products: Product[];
}
```

### ProductDetail
**Location:** `components/ProductDetail.tsx`

Full product detail page with image, description, and add to cart.

**Props:**
```typescript
interface ProductDetailProps {
  product: Product;
}
```

**Features:**
- Quantity selector
- Product info cards
- Stock availability display
- Animated layout

### Cart
**Location:** `components/Cart.tsx`

Shopping cart display with item management.

**Features:**
- Add/remove items
- Quantity updates
- Total calculation
- Empty state
- Animated item removal

### Navbar
**Location:** `components/Navbar.tsx`

Navigation bar with cart badge and mobile menu.

**Features:**
- Sticky navigation
- Backdrop blur on scroll
- Cart item count badge
- Mobile responsive menu

---

## Key Features

### 1. Excel Product Import

#### Client-Side Import
- User uploads Excel file in browser
- File parsed using `xlsx` library
- Data sent to API for insertion

#### Server-Side Import
- File uploaded to server
- Parsed server-side
- Bulk insert to database

**Excel Format:**
| name | description | price | image_url | category | stock | featured |
|------|-------------|-------|-----------|----------|-------|----------|
| Product Name | Description | 299.99 | /image.jpg | Category | 50 | true |

### 2. Shopping Cart

**Implementation:**
- React Context API (`CartContext`)
- localStorage persistence
- Automatic sync on page load
- Real-time updates

**Cart Functions:**
- `addItem(product, quantity)` - Add product to cart
- `removeItem(productId)` - Remove product
- `updateQuantity(productId, quantity)` - Update quantity
- `clearCart()` - Empty cart

### 3. Stripe Checkout

**Flow:**
1. User fills checkout form
2. API creates Stripe checkout session
3. Order created in database (pending status)
4. User redirected to Stripe
5. After payment, redirected to success page
6. Order status updated via webhook

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry, any CVC

### 4. Admin Dashboard

**Features:**
- Revenue statistics
- Order management
- Product CRUD operations
- Excel import interface
- Order status updates

---

## Development Workflow

### Adding a New Product

1. **Via Admin Panel:**
   - Navigate to `/admin/products/import`
   - Upload Excel file or use form

2. **Via API:**
   ```typescript
   POST /api/products
   {
     "name": "New Product",
     "price": 99.99,
     // ... other fields
   }
   ```

3. **Via Database:**
   ```sql
   INSERT INTO products (name, price, ...) 
   VALUES ('New Product', 99.99, ...);
   ```

### Adding a New Page

1. Create file in `app/` directory:
   ```typescript
   // app/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. For dynamic routes:
   ```typescript
   // app/products/[id]/page.tsx
   export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
     // ...
   }
   ```

### Adding a New API Route

1. Create route file:
   ```typescript
   // app/api/new-route/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   
   export async function GET(request: NextRequest) {
     return NextResponse.json({ message: 'Hello' });
   }
   ```

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use CSS variables from `globals.css` for colors
- Add animations with Framer Motion
- Maintain consistent spacing (4px grid)

### Code Style

- Use TypeScript for all files
- Follow React functional component patterns
- Use async/await for async operations
- Handle errors gracefully
- Add loading states for async operations

---

## Common Tasks

### Changing Site Name/Branding

1. Update `site_config` table:
   ```sql
   UPDATE site_config 
   SET site_name = 'New Name', 
       description = 'New Description'
   WHERE id = '1';
   ```

2. Or update via seed script: `lib/seed.ts`

### Adding New Product Categories

Categories are stored as strings in the `category` field. Simply use a new category name when creating products. Categories are automatically extracted for filtering.

### Customizing Colors

1. Update CSS variables in `app/globals.css`:
   ```css
   :root {
     --primary: #your-color;
     --secondary: #your-color;
   }
   ```

2. Or update Tailwind config if needed

### Adding Authentication

Authentication is already set up with Supabase Auth. To require login:

1. Create middleware:
   ```typescript
   // middleware.ts
   import { createServerClient } from '@supabase/ssr';
   
   export async function middleware(request: NextRequest) {
     // Check auth and redirect if needed
   }
   ```

2. Protect routes by checking auth in page components

### Deploying to Production

1. **Build:**
   ```bash
   npm run build
   ```

2. **Environment Variables:**
   - Set production Supabase credentials
   - Set production Stripe keys
   - Update `NEXT_PUBLIC_*` variables

3. **Database:**
   - Run migrations on production Supabase
   - Seed initial data if needed

4. **Stripe:**
   - Switch to live API keys
   - Configure webhook endpoint
   - Update success/cancel URLs

---

## Troubleshooting

### Products Not Showing

1. **Check database connection:**
   - Verify Supabase credentials in `.env.local`
   - Check Supabase dashboard for data

2. **Check RLS policies:**
   - Ensure products table has public read access
   - Verify policies in Supabase dashboard

3. **Check console errors:**
   - Look for API errors in browser console
   - Check server logs for errors

### Stripe Checkout Not Working

1. **Verify API keys:**
   - Check `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Ensure using test keys for development

2. **Check webhook:**
   - Verify webhook endpoint is configured
   - Check Stripe dashboard for webhook events

3. **Check redirect URLs:**
   - Ensure success/cancel URLs are correct
   - Check `next.config.ts` for URL issues

### Excel Import Failing

1. **Check file format:**
   - Ensure columns match expected format
   - Verify data types (price as number, stock as integer)

2. **Check file size:**
   - Large files may timeout
   - Consider chunking for bulk imports

3. **Check server logs:**
   - Look for parsing errors
   - Verify database connection

### Cart Not Persisting

1. **Check localStorage:**
   - Verify browser allows localStorage
   - Check for storage quota issues

2. **Check CartContext:**
   - Ensure CartProvider wraps app in `layout.tsx`
   - Verify context is being used correctly

### Images Not Loading

1. **Check Next.js config:**
   - Verify image domains in `next.config.ts`
   - Add new domains if needed

2. **Check image URLs:**
   - Ensure URLs are valid
   - Check CORS if using external images

### Build Errors

1. **Type errors:**
   - Run `npm run lint` to check
   - Fix TypeScript errors

2. **Missing dependencies:**
   - Run `npm install`
   - Check `package.json` for versions

3. **Environment variables:**
   - Ensure all required vars are set
   - Check `.env.local` exists

---

## Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

### Project-Specific Files
- `README.md` - User-facing documentation
- `ENV_SETUP.md` - Environment variable setup guide
- `supabase/migrations/001_initial_schema.sql` - Database schema

### Support
For issues or questions:
1. Check this documentation
2. Review error messages in console/logs
3. Check Supabase and Stripe dashboards
4. Verify environment variables

---

**Last Updated:** 2024
**Version:** 1.0.0

