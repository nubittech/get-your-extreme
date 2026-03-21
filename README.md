<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Get Your Extreme

React + Vite frontend for booking and managing water sports reservations.

## Run Locally

Prerequisite: Node.js

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

## Reservation Data Mode

The app is now backend-ready with a service layer in `/services/reservations.ts`.

- Default mode: `local` (uses browser `localStorage`)
- Remote REST mode: `remote` (uses your own API endpoint)
- Supabase mode: `supabase` (direct `@supabase/supabase-js` integration)

Configure with `.env.local`:

```env
VITE_RESERVATIONS_API_MODE=local
VITE_RESERVATIONS_API_URL=http://localhost:3001
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_RESERVATIONS_TABLE=reservations
VITE_SUPABASE_EVENTS_TABLE=events
VITE_SUPABASE_QR_TABLE=qr_codes
VITE_PAYMENTS_API_URL=
```

## Iyzico Checkout (Payment)

Checkout form integration uses Vercel serverless functions under `api/iyzico`.

Set the following environment variables in your hosting provider (or `.env.local` for local dev):

```env
# IyziPay credentials
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://api.iyzipay.com

# Optional: force callback base URL (recommended in production)
IYZICO_CALLBACK_BASE_URL=https://your-domain.com
```

Notes:
- `VITE_PAYMENTS_API_URL` is optional. Leave empty to call `/api/iyzico/checkout-form` on the same origin.
- For local dev, you need a serverless runtime (e.g. `vercel dev`) to serve `/api/*`.

When you are ready to connect backend with your own API:

1. Set `VITE_RESERVATIONS_API_MODE=remote`
2. Set `VITE_RESERVATIONS_API_URL` to your backend base URL
3. Implement these endpoints:
   - `GET /reservations`
   - `POST /reservations`
   - `DELETE /reservations/:id`

When you are ready to connect Supabase:

1. Set `VITE_RESERVATIONS_API_MODE=supabase`
2. Set `VITE_SUPABASE_URL`
3. Set `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Create `reservations` table (or set `VITE_SUPABASE_RESERVATIONS_TABLE`) with fields:
   - `id` bigint generated identity primary key
   - `customer_name` text
   - `customer_phone` text
   - `activity` text
   - `route` text
   - `date` date or text
   - `status` text
   - `timestamp` timestamptz
   - `source` text (`event` or `special`)
   - `amount` numeric (nullable)
   - `event_id` text (nullable)
5. Create `events` table (or set `VITE_SUPABASE_EVENTS_TABLE`) with fields:
   - `id` bigint generated identity primary key
   - `category` text (`SUP`, `BIKE`, `SKI`)
   - `date` date or text
   - `time` text
   - `duration_hours` numeric
   - `capacity` integer
   - `booked` integer default `0`
   - `price` numeric
   - `title` text
   - `summary` text
   - `details` text
   - `service_stops` text[] (or jsonb)

6. Create `qr_codes` table (or set `VITE_SUPABASE_QR_TABLE`) with fields:
   - `id` uuid default gen_random_uuid() primary key
   - `key` text unique
   - `url` text
   - `data_url` text
   - `updated_at` timestamptz default now()
