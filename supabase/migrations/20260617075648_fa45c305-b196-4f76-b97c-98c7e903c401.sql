
-- Shared updated_at trigger function already exists (public.update_updated_at_column)

-- =========================================================
-- user_state (single row per user, JSONB blob)
-- =========================================================
CREATE TABLE public.user_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_state TO authenticated;
GRANT ALL ON public.user_state TO service_role;
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_state owner all" ON public.user_state
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_state_updated BEFORE UPDATE ON public.user_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- user_wallet (many rows per user)
-- =========================================================
CREATE TABLE public.user_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, business_id)
);
CREATE INDEX user_wallet_user_idx ON public.user_wallet(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_wallet TO authenticated;
GRANT ALL ON public.user_wallet TO service_role;
ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_wallet owner all" ON public.user_wallet
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_wallet_updated BEFORE UPDATE ON public.user_wallet
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- user_bin_day (single row per user)
-- =========================================================
CREATE TABLE public.user_bin_day (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_bin_day TO authenticated;
GRANT ALL ON public.user_bin_day TO service_role;
ALTER TABLE public.user_bin_day ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_bin_day owner all" ON public.user_bin_day
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_bin_day_updated BEFORE UPDATE ON public.user_bin_day
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- user_preferences (single row per user)
-- =========================================================
CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sheep_head text,
  learning_preferences jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_preferences owner all" ON public.user_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_preferences_updated BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- user_sprints (many rows per user, keyed by sprint id)
-- =========================================================
CREATE TABLE public.user_sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_key text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sprint_key)
);
CREATE INDEX user_sprints_user_idx ON public.user_sprints(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sprints TO authenticated;
GRANT ALL ON public.user_sprints TO service_role;
ALTER TABLE public.user_sprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_sprints owner all" ON public.user_sprints
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_sprints_updated BEFORE UPDATE ON public.user_sprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- user_walk_stamps (single row per user)
-- =========================================================
CREATE TABLE public.user_walk_stamps (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stamps integer NOT NULL DEFAULT 0,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_walk_stamps TO authenticated;
GRANT ALL ON public.user_walk_stamps TO service_role;
ALTER TABLE public.user_walk_stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_walk_stamps owner all" ON public.user_walk_stamps
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_walk_stamps_updated BEFORE UPDATE ON public.user_walk_stamps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- user_calc_categories (single row per user, JSONB)
-- =========================================================
CREATE TABLE public.user_calc_categories (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_calc_categories TO authenticated;
GRANT ALL ON public.user_calc_categories TO service_role;
ALTER TABLE public.user_calc_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_calc_categories owner all" ON public.user_calc_categories
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_calc_categories_updated BEFORE UPDATE ON public.user_calc_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
