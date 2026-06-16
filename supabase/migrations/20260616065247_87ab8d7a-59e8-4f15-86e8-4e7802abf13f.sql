
-- 1. profiles: account_type
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'resident'
  CHECK (account_type IN ('resident','business'));

-- 2. business_cards table
CREATE TABLE public.business_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  tagline text,
  sector text,
  website text,
  phone text,
  address text,
  postcode text,
  latitude numeric,
  longitude numeric,
  logo_url text,
  pen_portrait text,
  climate_goals text,
  offer_to_residents text,
  offer_to_businesses text,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.business_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_cards TO authenticated;
GRANT ALL ON public.business_cards TO service_role;

ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved business cards"
  ON public.business_cards FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Owners can insert their own business card"
  ON public.business_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their own business card"
  ON public.business_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete their own business card"
  ON public.business_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_business_cards_updated_at
  BEFORE UPDATE ON public.business_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_business_cards_status ON public.business_cards(status);
CREATE INDEX idx_business_cards_user_id ON public.business_cards(user_id);
