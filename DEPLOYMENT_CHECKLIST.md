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

## 5. Supabase migration

- Apply:
  - [supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql](./supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql)

## 6. Redeploy edge functions

- Redeploy:
  - `ai-recommend`
  - `ai-chat`
  - `ai-impact-summary`
  - `ai-charity-matcher`
  - `public-api`

## 7. Supabase Auth URLs

- Set Site URL to your Cloudflare Pages or custom domain.
- Add Redirect URLs for:
  - `/`
  - `/reset-password`
- If Google OAuth is enabled, add the same URLs there too.

## 8. Smoke test after deploy

- Sign up and sign in.
- Reset password.
- Confirm `/admin` is hidden for non-admin users.
- Confirm AI recommendations only work when signed in.
- Confirm donations are stored as `pending`, not `completed`.
- Confirm public stats exclude pending demo pledges.
