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
- Keep demo pledges out of revenue reporting until a real payment processor is live.
- Verify only real admins have rows in `public.user_roles`.
