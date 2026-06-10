
-- map_locations
CREATE TABLE public.map_locations (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  street_address TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  category TEXT,
  carbon_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.map_locations TO anon, authenticated;
GRANT ALL ON public.map_locations TO service_role;
ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Map locations are publicly viewable" ON public.map_locations FOR SELECT USING (true);

-- translations
CREATE TABLE public.translations (
  id INTEGER PRIMARY KEY,
  translation TEXT NOT NULL,
  source_table TEXT,
  type_id INTEGER,
  language_code TEXT NOT NULL,
  english_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.translations TO anon, authenticated;
GRANT ALL ON public.translations TO service_role;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translations are publicly viewable" ON public.translations FOR SELECT USING (true);

CREATE INDEX idx_translations_lang_english ON public.translations(language_code, english_version);
CREATE INDEX idx_map_locations_category ON public.map_locations(category);
