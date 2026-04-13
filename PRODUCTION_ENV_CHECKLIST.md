# Production Env Checklist

## Cloudflare Pages

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

These are public frontend values and belong in Pages project environment variables.

## Supabase Edge Functions secrets

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY`
 - `STRIPE_SECRET_KEY`
 - `STRIPE_WEBHOOK_SECRET`
 - `PUBLIC_SITE_URL`

These must remain server-side only.

## Do not place in the frontend

- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY`

## Auth URL alignment

Make sure these match the production domain exactly:
- Cloudflare Pages project URL
- custom domain
- Supabase Site URL
- Supabase Redirect URLs
- OAuth provider callback configuration

## Before launch

- Remove any demo/test content you do not want visible publicly.
- Verify only real admins have rows in `public.user_roles`.
- Verify the Stripe webhook is pointing to `/functions/v1/stripe-webhook` on the correct Supabase project.
