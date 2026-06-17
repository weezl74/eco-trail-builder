
ALTER TABLE public.business_cards
  ADD COLUMN IF NOT EXISTS sector_icon text,
  ADD COLUMN IF NOT EXISTS stamps_required integer NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS reward_text text;

ALTER TABLE public.business_cards
  DROP CONSTRAINT IF EXISTS business_cards_stamps_required_check;
ALTER TABLE public.business_cards
  ADD CONSTRAINT business_cards_stamps_required_check
  CHECK (stamps_required BETWEEN 3 AND 12);

DROP VIEW IF EXISTS public.business_cards_public;
CREATE VIEW public.business_cards_public
WITH (security_invoker = on) AS
  SELECT
    id,
    user_id,
    business_name,
    tagline,
    sector,
    sector_icon,
    website,
    logo_url,
    pen_portrait,
    climate_goals,
    offer_to_residents,
    offer_to_businesses,
    reward_text,
    stamps_required,
    latitude,
    longitude,
    status,
    created_at,
    updated_at
  FROM public.business_cards
  WHERE status = 'approved';

GRANT SELECT ON public.business_cards_public TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.user_business_stamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_card_id uuid NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  stamps integer NOT NULL DEFAULT 0,
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, business_card_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_business_stamps TO authenticated;
GRANT ALL ON public.user_business_stamps TO service_role;

ALTER TABLE public.user_business_stamps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own stamps" ON public.user_business_stamps;
CREATE POLICY "Users manage their own stamps"
  ON public.user_business_stamps
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_business_stamps_updated_at ON public.user_business_stamps;
CREATE TRIGGER update_user_business_stamps_updated_at
  BEFORE UPDATE ON public.user_business_stamps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_business_stamps_user ON public.user_business_stamps(user_id);
