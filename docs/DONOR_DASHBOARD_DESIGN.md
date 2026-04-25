# Give & Grow - Donor Dashboard Design Specification

## 1. Purpose

The Donor Dashboard turns Give & Grow from a simple donation flow into a donor relationship and transparency platform.

Instead of only allowing a user to donate once, the dashboard helps donors understand:

- how much they have given
- which causes they support most
- which donations are verified
- what impact summaries are available
- which campaigns match their interests
- what actions they may want to take next

This feature strengthens the product because it creates an ongoing donor experience rather than a one-off checkout journey.

## 2. Product Goals

The dashboard should help donors answer four questions:

1. What have I donated?
2. Which causes have I supported?
3. What impact did my donations contribute toward?
4. What should I support next?

The design should prioritise transparency, clarity, and trust. It should avoid making unverifiable claims about guaranteed outcomes.

## 3. User Stories

### Donor

As a donor, I want to:

- see my total donated amount
- see how many completed donations I have made
- view my recent donations
- know whether each donation was verified by Stripe
- read plain-English impact summaries
- see which causes I support most
- receive suggested campaigns based on my interests and past donations
- access receipts or donation records where available

### Admin / Charity Operator

As an admin or charity operator, I want to:

- understand donor engagement patterns
- see which campaigns attract repeat support
- ensure only verified donations appear as completed
- avoid exposing private donor data publicly

## 4. Main Dashboard Sections

### 4.1 Summary Cards

At the top of the donor dashboard, show four cards:

1. **Total Donated**
   - Sum of completed donations only
   - Pending or expired donations should not count

2. **Completed Donations**
   - Count of donations with `status = completed`

3. **Causes Supported**
   - Number of distinct campaign categories supported

4. **Estimated Impact Summaries**
   - Count of completed donations with generated impact summaries

Example layout:

```text
[Total Donated]   [Completed Donations]   [Causes Supported]   [Impact Summaries]
```

### 4.2 Donation History

A table or card list showing recent donations.

Fields:

- charity / campaign name
- amount
- currency
- date
- payment status
- verification source
- receipt link if available
- impact summary status

Suggested statuses:

- `pending` - checkout started but not verified yet
- `completed` - Stripe webhook verified payment
- `expired` - checkout expired or was abandoned
- `refunded` - optional future state

Only completed donations should contribute to totals.

### 4.3 Impact Timeline

A timeline of completed donations with plain-English summaries.

Each item should show:

- donation amount
- campaign supported
- campaign category
- impact summary
- generated date

Example:

```text
£10 donated to Emergency Food Support
Impact summary: This donation helped close part of the campaign funding gap and supports short-term relief activity.
Verified by Stripe webhook on 13 April 2026.
```

Important: summaries should say “supports”, “contributes to”, or “helps fund”. Avoid “guarantees”, “directly saved”, or other unverifiable claims.

### 4.4 Cause Breakdown

Show a simple breakdown of the donor's giving by cause/category.

Examples:

- Food relief: £45
- Education: £20
- Health: £15

UI options:

- small bar chart
- category cards
- simple list for first version

### 4.5 Recommended Campaigns

Show recommended campaigns based on:

- previous donation categories
- donor selected interests
- campaign urgency
- campaign transparency indicators
- campaigns that are close to target

Each recommendation card should include:

- campaign name
- category
- reason for recommendation
- urgency indicator
- donation CTA

Example:

```text
Recommended because you previously supported food relief and this campaign is close to its funding target.
```

### 4.6 Transparency Indicators

Optional but high-value section.

Display campaign transparency indicators such as:

- profile completeness
- recent update available
- verified donation flow enabled
- impact summary available
- campaign target and progress visible

Important: call these “transparency indicators”, not “trust scores” or “official ratings”.

## 5. Suggested Routes

Add route:

```text
/dashboard/donor
```

Alternative route if the app already has an account area:

```text
/account/dashboard
```

Navigation label:

```text
My Giving
```

## 6. Data Model

The dashboard should use existing donation and campaign tables where possible. If the current schema does not already support these fields, add them through a Supabase migration.

### 6.1 donations

Expected fields:

```sql
id uuid primary key default gen_random_uuid(),
donor_id uuid references auth.users(id),
charity_id uuid,
campaign_id uuid,
amount numeric not null,
currency text default 'gbp',
status text not null default 'pending',
stripe_checkout_session_id text,
stripe_payment_intent_id text,
receipt_url text,
created_at timestamptz default now(),
completed_at timestamptz,
updated_at timestamptz default now()
```

Suggested status constraint:

```sql
status in ('pending', 'completed', 'expired', 'refunded')
```

### 6.2 donation_impact_summaries

Create this if it does not already exist.

```sql
create table if not exists public.donation_impact_summaries (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.donations(id) on delete cascade,
  donor_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid,
  summary text not null,
  summary_source text not null default 'ai',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
```

RLS intent:

- donors can read impact summaries for their own donations
- admins can read all summaries
- only trusted backend functions should insert generated summaries

### 6.3 donor_preferences

Create this if donor matching needs persistent preferences.

```sql
create table if not exists public.donor_preferences (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references auth.users(id) on delete cascade unique,
  preferred_categories text[] default '{}',
  preferred_locations text[] default '{}',
  giving_frequency text,
  max_suggested_amount numeric,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
```

RLS intent:

- donors can read and update only their own preferences
- admins can read aggregate patterns only, not unnecessary private donor preference details

### 6.4 donor_dashboard_view

Optional view for frontend simplicity.

```sql
create or replace view public.donor_dashboard_view as
select
  d.donor_id,
  count(*) filter (where d.status = 'completed') as completed_donation_count,
  coalesce(sum(d.amount) filter (where d.status = 'completed'), 0) as total_donated,
  count(distinct c.category) filter (where d.status = 'completed') as causes_supported,
  count(dis.id) as impact_summary_count
from public.donations d
left join public.campaigns c on c.id = d.campaign_id
left join public.donation_impact_summaries dis on dis.donation_id = d.id
group by d.donor_id;
```

If RLS on views becomes awkward, calculate these values in the frontend from RLS-protected donation rows instead.

## 7. RLS Requirements

The dashboard must not expose one donor's data to another donor.

Minimum policies:

### donations

- donor can select own donations
- donor cannot update completed payment status directly
- backend/service role handles webhook updates
- admin can view operational donation records if an admin role model exists

### donation_impact_summaries

- donor can select summaries where `donor_id = auth.uid()`
- backend inserts summaries
- donor should not edit generated summaries directly

### donor_preferences

- donor can select, insert, and update own preference row
- donor cannot read other donor preferences

## 8. Frontend Logic

### 8.1 Data Fetching

Use React Query or the app's existing data-loading pattern.

Queries:

1. `getDonorSummary(user.id)`
2. `getDonationHistory(user.id)`
3. `getImpactSummaries(user.id)`
4. `getCauseBreakdown(user.id)`
5. `getRecommendedCampaigns(user.id)`

### 8.2 Summary Calculation

Only use completed donations:

```ts
const completedDonations = donations.filter((donation) => donation.status === 'completed');

const totalDonated = completedDonations.reduce((sum, donation) => sum + donation.amount, 0);
```

### 8.3 Empty States

If a donor has no donations:

```text
You have not made a verified donation yet. Explore campaigns to start your giving journey.
```

If donations are pending:

```text
Some donations are still pending verification. Completed donations will appear in your impact summary once confirmed.
```

If impact summaries are missing:

```text
Impact summaries will appear here after your completed donations are processed.
```

### 8.4 Error States

Use clear messages:

- “We could not load your donation history.”
- “We could not load impact summaries.”
- “Try refreshing the page, or check back shortly.”

Do not show raw Supabase or Stripe errors to users.

## 9. Suggested Component Structure

```text
src/pages/DonorDashboard.tsx
src/components/donor/DonorSummaryCards.tsx
src/components/donor/DonationHistoryTable.tsx
src/components/donor/ImpactTimeline.tsx
src/components/donor/CauseBreakdown.tsx
src/components/donor/RecommendedCampaigns.tsx
src/components/donor/TransparencyIndicatorCard.tsx
src/lib/donorDashboard.ts
```

## 10. UI Wireframe

```text
Donor Dashboard / My Giving

[Total Donated] [Completed Donations] [Causes Supported] [Impact Summaries]

Recent Donations
--------------------------------------------------
Campaign        Amount      Status       Date
Food Relief     £10.00      Completed    13 Apr
Education Fund  £5.00       Pending      14 Apr

Impact Timeline
--------------------------------------------------
£10 to Food Relief
This donation supports emergency food distribution...
Verified by Stripe webhook.

Cause Breakdown
--------------------------------------------------
Food Relief     £45
Education       £20
Health          £15

Recommended For You
--------------------------------------------------
[Campaign Card] Recommended because...
```

## 11. AI and Edge Function Touchpoints

### ai-impact-summary

Use after a donation is confirmed as completed.

Input:

```json
{
  "donation_id": "uuid",
  "campaign_id": "uuid",
  "amount": 10,
  "currency": "gbp"
}
```

Output:

```json
{
  "summary": "Your donation supports...",
  "confidence": "medium",
  "limitations": "This is an estimate based on campaign information."
}
```

Store output in `donation_impact_summaries`.

### ai-charity-matcher

Use for recommendations.

Input:

```json
{
  "donor_id": "uuid",
  "preferred_categories": ["food", "education"],
  "recent_donation_categories": ["food"],
  "available_campaigns": []
}
```

Output:

```json
{
  "recommendations": [
    {
      "campaign_id": "uuid",
      "reason": "Recommended because you previously supported food relief and this campaign is close to target.",
      "match_factors": ["category", "urgency", "funding_gap"]
    }
  ]
}
```

Validate AI outputs before rendering.

## 12. Tests To Add

Add tests for:

- completed donations count excludes pending/expired donations
- total donated excludes pending/expired donations
- cause breakdown groups completed donations by campaign category
- empty state displays when donor has no donations
- pending donation message displays correctly
- impact summary card renders safely
- recommendation cards show explanation text
- donors cannot query other donors' donation records through RLS checks where test setup supports it

## 13. Implementation Phases

### Phase 1 - Frontend dashboard with existing data

- create route and page
- fetch current donor donations
- show summary cards
- show donation history
- add empty states

### Phase 2 - Impact summaries

- create `donation_impact_summaries` table
- generate summaries after completed donations
- show impact timeline

### Phase 3 - Recommendations

- add donor preferences
- connect `ai-charity-matcher`
- show explainable campaign recommendations

### Phase 4 - Transparency indicators

- add campaign transparency indicator logic
- show indicators on campaign and recommendation cards

## 14. Acceptance Criteria

The feature is ready when:

- donor dashboard route is protected
- donor only sees their own donations
- totals only count completed donations
- pending and expired donations are labelled clearly
- impact summaries avoid unverifiable claims
- recommendations include reasons
- dashboard has useful empty states
- tests cover summary calculations and basic rendering
- no service-role secrets are exposed to the frontend

## 15. Product Evidence Value

For visa and portfolio purposes, this feature strengthens Give & Grow because it demonstrates:

- donor-facing product design
- data-backed dashboards
- verified payment workflow awareness
- AI used for explanation and matching
- transparency-first thinking
- responsible handling of user-specific records

It also creates strong screenshots for evidence:

- donor summary dashboard
- donation history
- impact timeline
- recommendations panel
- transparency indicators
