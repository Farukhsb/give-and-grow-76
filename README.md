# Give & Grow

A behaviour-focused donation platform built with `React`, `Vite`, `Supabase`, and Firebase-backed charity content.

## Local setup

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Create a local env file from the example:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
4. Start the app:
   ```powershell
   npm run dev
   ```

## Cloudflare Pages

This repo is prepared for Cloudflare Pages:
- SPA fallback is in [public/_redirects](./public/_redirects)
- security/cache headers are in [public/_headers](./public/_headers)
- Pages output is declared in [wrangler.toml](./wrangler.toml)

### Build settings

Use these values in Cloudflare Pages:
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

### Pages environment variables

Add these in both Preview and Production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Do not place service-role or AI provider secrets in Cloudflare Pages for this frontend.

## Supabase deployment steps

Before exposing the Cloudflare domain publicly, deploy the backend changes:

1. Run the new migration:
   - [supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql](./supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql)
2. Redeploy edge functions:
   - `ai-recommend`
   - `ai-chat`
   - `ai-impact-summary`
   - `ai-charity-matcher`
   - `public-api`
3. Make sure these Supabase secrets exist:
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `LOVABLE_API_KEY`

## Supabase auth settings

After Cloudflare Pages gives you a project URL such as `https://give-and-grow-76.pages.dev`, update Supabase Auth:

- Site URL:
  - `https://give-and-grow-76.pages.dev`
- Redirect URLs:
  - `https://give-and-grow-76.pages.dev`
  - `https://give-and-grow-76.pages.dev/reset-password`
  - your custom production domain
  - your custom production domain `/reset-password`

If you use Google OAuth, add the same Cloudflare Pages and custom-domain callback URLs in the provider settings.

## Recommended Cloudflare settings

At the zone level:
- Enable `Always Use HTTPS`
- Set SSL/TLS mode to `Full` or `Full (strict)` if your origin supports it
- Enable `Auto Minify` if you want lightweight asset optimization
- Add a WAF/rate-limit rule for the frontend if you expect abuse

## Current donation flow

The current codebase stores demo pledges as `pending`. It does not process real payments yet.

That means:
- no official tax receipts
- no verified payment capture
- no server-confirmed completed donations

Before launching for real donations, connect a payment processor and move completion logic server-side.
