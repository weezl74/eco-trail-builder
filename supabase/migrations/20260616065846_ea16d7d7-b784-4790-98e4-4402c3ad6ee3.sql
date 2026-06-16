
-- Restrict base table SELECT to owners only (removes anonymous access to sensitive fields)
DROP POLICY IF EXISTS "Anyone can view approved business cards" ON public.business_cards;

CREATE POLICY "Owners can view their own business card"
  ON public.business_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public-safe view: excludes phone, address, postcode, latitude, longitude
CREATE OR REPLACE VIEW public.business_cards_public
WITH (security_invoker = on) AS
  SELECT
    id,
    user_id,
    business_name,
    tagline,
    sector,
    website,
    logo_url,
    pen_portrait,
    climate_goals,
    offer_to_residents,
    offer_to_businesses,
    status,
    created_at,
    updated_at
  FROM public.business_cards
  WHERE status = 'approved';

GRANT SELECT ON public.business_cards_public TO anon, authenticated;
