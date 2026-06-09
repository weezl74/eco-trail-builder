CREATE TABLE public.pledges (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  co2_saved NUMERIC DEFAULT 0,
  money_saved NUMERIC DEFAULT 0,
  water_saved NUMERIC DEFAULT 0,
  wool_points INTEGER DEFAULT 0,
  tag TEXT,
  key TEXT UNIQUE,
  reward TEXT,
  user_group TEXT,
  category TEXT,
  sub_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pledges TO anon, authenticated;
GRANT ALL ON public.pledges TO service_role;

ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pledges are viewable by everyone"
  ON public.pledges FOR SELECT
  USING (true);

CREATE TRIGGER update_pledges_updated_at
  BEFORE UPDATE ON public.pledges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();