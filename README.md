# Give & Grow

Give & Grow is a transparency-first donation intelligence platform built to help donors discover charities, understand likely impact, and make more informed giving decisions.

The project combines a public-facing donation experience with AI-assisted charity matching, explainable impact summaries, verified Stripe Checkout flows, and a roadmap for donor transparency tools.

The goal is not just to process donations. The goal is to make giving feel clearer, more trustworthy, and more engaging.

## Problem

Many donation platforms make it easy to give, but they do not always help donors understand:

- which charities best match their interests
- how urgent or transparent a campaign appears
- what their donation may contribute toward
- whether a payment has been verified
- how their giving history connects to real causes over time

Give & Grow explores how AI, verified payment flows, and transparent campaign data can make the donation experience more informed and accountable.

## Current Product Scope

The current codebase supports a donation platform foundation with:

- public charity and campaign discovery
- donor-facing donation flows
- Stripe Checkout integration for one-time donations
- server-side checkout session creation
- donation records that start as `pending`
- webhook-based payment verification
- Supabase-backed user, profile, and donation infrastructure
- AI Edge Functions for recommendation, chat, impact summary, and charity matching features
- Cloudflare Pages deployment support

Recurring billing is not implemented yet.

## Key Product Ideas

### AI Charity Matcher

The charity matcher is intended to help donors find campaigns that fit their interests, giving preferences, and impact goals.

A useful match should explain:

- why a charity or campaign was recommended
- which cause areas it aligns with
- what evidence supports the recommendation
- whether the match is based on urgency, location, category, or donor preference

The intention is to make recommendations explainable rather than opaque.

### Impact Summaries

Impact summaries translate campaign and donation data into plain-English explanations for donors.

Example:

```text
Your £10 donation supports an emergency food campaign that is 72% funded.
Based on the campaign target, your contribution helps close part of the remaining funding gap.
```

These summaries are designed to improve donor understanding, not to make unverifiable claims about guaranteed outcomes.

### Verified Donation Flow

The current donation model is designed around payment verification:

```text
donor selects campaign
  -> server creates Stripe Checkout session
  -> donation row is created as pending
  -> Stripe webhook confirms outcome
  -> donation is marked completed or expired
```

This keeps payment confirmation on the backend and avoids treating unverified checkout attempts as completed donations.

### Transparency Roadmap

Give & Grow can be extended with a transparency layer that helps donors assess campaign quality without pretending to provide a formal financial rating.

Possible indicators include:

- campaign profile completeness
- update frequency
- verified donation records
- impact summary availability
- campaign urgency
- reporting history

These should be presented as transparency indicators, not official trust ratings.

## Technical Architecture

```text
React + Vite frontend
  -> Supabase Auth / Database / Storage
  -> Supabase Edge Functions
  -> Stripe Checkout / Webhooks
  -> AI-assisted matching and impact summaries
  -> Cloudflare Pages deployment
```

## Technology Stack

- Frontend: React, TypeScript, Vite
- UI: Tailwind CSS, shadcn/ui, Radix UI
- Backend platform: Supabase
- Payments: Stripe Checkout and Stripe webhooks
- AI functions: Supabase Edge Functions
- Hosting: Cloudflare Pages
- Legacy/demo content: Firebase-backed charity content where still used
- Testing: Vitest

## My Contribution

This project demonstrates product and technical work around social-impact technology, including:

- shaping the donation platform concept
- connecting the frontend to backend donation infrastructure
- preparing the deployment path for Cloudflare Pages
- designing AI-assisted donor support features
- documenting payment verification and backend deployment requirements
- identifying a roadmap for transparency and impact-reporting features

## Local Setup

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

### Build Settings

Use these values in Cloudflare Pages:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

### Pages Environment Variables

Add these in both Preview and Production:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Do not place service-role or AI provider secrets in Cloudflare Pages for this frontend.

## Supabase Deployment Steps

Before exposing the Cloudflare domain publicly, deploy the backend changes:

1. Run the migration:
   - [supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql](./supabase/migrations/20260413173000_harden_profiles_and_demo_donations.sql)
2. Redeploy Edge Functions:
   - `ai-recommend`
   - `ai-chat`
   - `ai-impact-summary`
   - `ai-charity-matcher`
   - `public-api`
3. Make sure these Supabase secrets exist:
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `LOVABLE_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `PUBLIC_SITE_URL`
4. Configure the Stripe webhook endpoint to point at:
   - `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
5. Subscribe the webhook to:
   - `checkout.session.completed`
   - `checkout.session.expired`

## Supabase Auth Settings

After Cloudflare Pages gives you a project URL such as `https://give-and-grow-76.pages.dev`, update Supabase Auth:

- Site URL:
  - `https://give-and-grow-76.pages.dev`
- Redirect URLs:
  - `https://give-and-grow-76.pages.dev`
  - `https://give-and-grow-76.pages.dev/reset-password`
  - your custom production domain
  - your custom production domain `/reset-password`

If you use Google OAuth, add the same Cloudflare Pages and custom-domain callback URLs in the provider settings.

## Recommended Cloudflare Settings

At the zone level:

- Enable `Always Use HTTPS`
- Set SSL/TLS mode to `Full` or `Full (strict)` if your origin supports it
- Enable `Auto Minify` if you want lightweight asset optimization
- Add a WAF/rate-limit rule for the frontend if you expect abuse

## Current State

Give & Grow is best described as a working social-impact donation platform foundation with AI-assisted donor support features and production-oriented payment infrastructure.

The strongest areas are:

- clear social-impact product direction
- verified payment-flow architecture
- AI-assisted matching and impact-summary direction
- Supabase and Cloudflare deployment readiness
- potential for donor transparency and reporting features

The next stage is to strengthen the product evidence layer with screenshots, a technical summary, an assessor evidence summary, tests, and a more visible donor dashboard.

## Roadmap

High-value next steps:

- add a donor dashboard showing donation history and impact summaries
- add a verified impact ledger for completed donations
- improve AI charity matching with explainable match reasons
- add campaign transparency indicators
- add charity/admin campaign management views
- add tests for donation records, matcher output, and webhook-driven status changes
- add documentation under `docs/` for architecture, technical summary, and evidence review
