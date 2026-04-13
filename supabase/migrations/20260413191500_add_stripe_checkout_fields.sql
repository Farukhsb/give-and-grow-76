ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'usd',
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

UPDATE public.donations
SET payment_provider = COALESCE(payment_provider, 'demo')
WHERE payment_provider IS NULL;

ALTER TABLE public.donations
  ALTER COLUMN payment_provider SET DEFAULT 'stripe';

CREATE UNIQUE INDEX IF NOT EXISTS donations_stripe_session_id_key
  ON public.donations (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS donations_stripe_payment_intent_id_key
  ON public.donations (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

DROP POLICY IF EXISTS "Authenticated users can create donations" ON public.donations;
