@AGENTS.md

# Elevate Salon — Project State

## Stack
- **Next.js 16.2.3** App Router (`.js` files, not TypeScript)
- **Supabase** — database + image storage (`product-images` bucket)
- **Stripe** — hosted Checkout, webhook for order logging
- **Framer Motion 12** — all animations
- **Tailwind CSS v4** — utility classes available but most styles are inline CSS variables
- **Vercel** — deployment target

## What's built

### Pages
| Route | Type | File |
|---|---|---|
| `/` | Static | `app/page.js` → `app/components/HomeHero.js` |
| `/shop` | Static | `app/shop/page.js` |
| `/shop/[id]` | Dynamic | `app/shop/[id]/page.js` |
| `/shop/success` | Static | `app/shop/success/page.js` |
| `/admin` | Dynamic (auth-gated) | `app/admin/page.js` → `app/admin/AdminDashboard.js` |
| `/admin/login` | Dynamic | `app/admin/login/page.js` |

### API Routes
| Route | Method(s) | Purpose |
|---|---|---|
| `/api/admin/login` | POST | Set `admin_session` cookie |
| `/api/admin/logout` | POST | Clear cookie |
| `/api/admin/products` | GET, POST | List / create products |
| `/api/admin/products/[id]` | GET, PUT, DELETE | Single product CRUD |
| `/api/admin/variants` | POST | Create variant (also creates Stripe product + price) |
| `/api/admin/variants/[id]` | PUT, DELETE | Update (price change → archives old Stripe price, creates new) / delete |
| `/api/admin/upload` | POST | Multipart image → Supabase Storage |
| `/api/checkout` | POST | Create Stripe hosted Checkout session |
| `/api/webhooks/stripe` | POST | `checkout.session.completed` → insert into `orders` |

### Key lib files
- `lib/supabase.js` — `supabase` (public anon client) + `getAdminClient()` (service role)
- `lib/stripe.js` — `stripe` instance
- `lib/adminAuth.js` — `isAdminAuthorized(request)` checks `admin_session` cookie or `Authorization: Bearer` header

## Auth pattern
Cookie-based. `ADMIN_PASSWORD` env var is the secret.
- Login: POST `/api/admin/login` → sets `HttpOnly` cookie `admin_session=<password>`
- Protected pages: `app/admin/page.js` reads cookie with `await cookies()` and `redirect('/admin/login')` if missing/wrong
- Protected API routes: call `isAdminAuthorized(request)` at the top, return 401 if false

## Stripe price update flow
When a variant's price is changed via PUT `/api/admin/variants/[id]`:
1. Archive old `stripe_price_id` via `stripe.prices.update(id, { active: false })`
2. Create new price via `stripe.prices.create({ product: stripe_product_id, unit_amount, currency: 'eur' })`
3. Save new `stripe_price_id` to Supabase `variants` table

## Database schema
Run `supabase/schema.sql` in the Supabase SQL editor.

```
products: id (uuid), name, description, image_url, active (bool), created_at
variants:  id (uuid), product_id (fk → products), label, price (numeric), stripe_price_id, stripe_product_id, in_stock (bool), created_at
orders:    id (uuid), stripe_session_id (unique), items (jsonb), total (int cents), email, created_at
```

RLS: products + variants are publicly readable. Orders are service-role only.
Storage: public bucket `product-images`.

## Animation system
All animations use **Framer Motion 12**. Key patterns in use:

- `whileInView` + `viewport={{ once: true }}` for scroll-triggered reveals
- `useScroll` + `useTransform` for parallax (shop hero, home hero parallax)
- `AnimatePresence` for the intro overlay exit
- `useMotionValue` + `useSpring` for the magnetic CTA button
- `useSpring` for the custom cursor ring lag
- Canvas `requestAnimationFrame` loop for the wave background (`WaveCanvas.js`)

### Hydration rules (critical)
- **Never call `Math.random()` at render time in Client Components.** Use `useEffect` + `useState` to generate random values after mount. See `Particles` component in `HomeHero.js`.
- **`sessionStorage` access only in `useEffect`** — used for the one-time intro overlay flag (`elevate_intro`).
- `Date.now()` in file upload naming (`app/api/admin/upload/route.js`) is server-side only — fine.

## Component structure
```
app/
  components/
    HomeHero.js       'use client' — full home page (intro, hero, marquee, features, CTA)
    WaveCanvas.js     'use client' — canvas sine wave animation
    CustomCursor.js   'use client' — gold dot + lagging ring cursor
    ScrollProgress.js 'use client' — top-of-page gold progress bar
  shop/
    ProductCard.js    'use client' — 3D tilt + holographic shine on hover
    ShopHero.js       'use client' — parallax hero for /shop
  admin/
    AdminDashboard.js 'use client' — full CRUD dashboard
```

## Design system
CSS custom properties defined in `app/globals.css`:
```
--bg: #090909          --surface: #111111      --surface-2: #1a1a1a
--border: #222222      --border-2: #2e2e2e
--gold: #c9a84c        --gold-light: #e0bb72   --gold-dim: #8a6e2a
--text: #f0ede8        --text-muted: #888888   --text-dim: #555555
--error: #e05252       --success: #4caf80
```
Typography: `var(--font-geist-sans)` for body, `var(--font-geist-mono)` for labels/numbers/mono UI.
Named CSS classes: `.hero-cta` (gold button with light-sweep hover), `.nav-shop-link` (muted hover), `.shimmer-placeholder` (animated gold shimmer for image placeholders).

## Environment variables
Copy `.env.local.example` → `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
ADMIN_PASSWORD
```

## Next.js 16 API notes (breaking changes vs 14)
- `params` in pages/route handlers is a **Promise**: `const { id } = await params`
- `cookies()` and `headers()` are **async**: `const store = await cookies()`
- Route handlers return `Response.json(data)` — not `NextResponse.json(data)`
- `'use client'` components cannot receive event handler props from Server Components
- `Math.random()` / `Date.now()` in Client Component render bodies cause hydration errors — move to `useEffect`
