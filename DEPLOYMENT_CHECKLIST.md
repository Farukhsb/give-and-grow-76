# Deployment Checklist

## 1. Push code

- Push the current branch to GitHub.
- Confirm the repo contains:
  - [`.env.example`](./.env.example)
  - [public/_redirects](./public/_redirects)
  - [public/_headers](./public/_headers)
  - [wrangler.toml](./wrangler.toml)
  - [supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql](./supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql)

## 2. Cloudflare Pages

- Create a new Pages project from the GitHub repo.
- Use these build settings:
  - Framework preset: `Vite`
  - Build command: `npm run build`
  - Output directory: `dist`

## 3. Cloudflare Pages environment variables

- Add in Preview and Production:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`

## 4. Supabase secrets

- In Supabase Edge Functions secrets, set:
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `LOVABLE_API_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `PUBLIC_SITE_URL`

## 5. Supabase migration

- Apply:
  - [supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql](./supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql)
  - [supabase/migrations/20260413191500_add_stripe_checkout_fields.sql](./supabase/migrations/20260413191500_add_stripe_checkout_fields.sql)

## 6. Redeploy edge functions

- Redeploy:
  - `create-checkout-session`
  - `stripe-webhook`
  - `ai-recommend`
  - `ai-chat`
  - `ai-impact-summary`
  - `ai-charity-matcher`
  - `public-api`

## 7. Stripe webhook

- In Stripe, create a webhook endpoint:
  - `https://xblwzkguacthayypbqfe.supabase.co/functions/v1/stripe-webhook`
- Subscribe it to:
  - `checkout.session.completed`
  - `checkout.session.expired`
- Store the returned signing secret as `STRIPE_WEBHOOK_SECRET` in Supabase.

## 8. Supabase Auth URLs

- Set Site URL to your Cloudflare Pages or custom domain.
- Add Redirect URLs for:
  - `/`
  - `/reset-password`
- If Google OAuth is enabled, add the same URLs there too.

## 9. Smoke test after deploy

- Sign up and sign in.
- Reset password.
- Confirm `/admin` is hidden for non-admin users.
- Confirm AI recommendations only work when signed in.
- Start a Stripe checkout session and confirm a pending donation row is created.
- Complete a Stripe payment and confirm the webhook changes the donation to `completed`.
- Confirm public stats exclude pending or failed donations.
