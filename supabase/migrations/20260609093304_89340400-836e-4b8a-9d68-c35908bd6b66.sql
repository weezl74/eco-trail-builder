CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  username text,
  display_name text,
  first_name text,
  last_name text,
  address text,
  postcode text,
  phone text,
  age text,
  avatar_level integer NOT NULL DEFAULT 1,
  total_points integer NOT NULL DEFAULT 0,
  current_footprint numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in residents can view profile basics" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Residents can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_pledges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  category text NOT NULL,
  action text NOT NULL,
  points_earned integer NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_pledges TO authenticated;
GRANT ALL ON public.user_pledges TO service_role;
ALTER TABLE public.user_pledges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Residents can view their own pledges" ON public.user_pledges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Residents can create their own pledges" ON public.user_pledges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can update their own pledges" ON public.user_pledges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can delete their own pledges" ON public.user_pledges FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_renewables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  technology_type text NOT NULL,
  points_cost integer NOT NULL,
  purchased_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_renewables TO authenticated;
GRANT ALL ON public.user_renewables TO service_role;
ALTER TABLE public.user_renewables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Residents can view their own renewables" ON public.user_renewables FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Residents can add their own renewables" ON public.user_renewables FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can update their own renewables" ON public.user_renewables FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can delete their own renewables" ON public.user_renewables FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  category text NOT NULL,
  question_id text NOT NULL,
  answer_value text NOT NULL,
  impact_value integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, category, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_responses TO authenticated;
GRANT ALL ON public.user_responses TO service_role;
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Residents can view their own responses" ON public.user_responses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Residents can create their own responses" ON public.user_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can update their own responses" ON public.user_responses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can delete their own responses" ON public.user_responses FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  run_type text NOT NULL,
  points_earned integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stories TO authenticated;
GRANT ALL ON public.user_stories TO service_role;
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Residents can view community stories" ON public.user_stories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Residents can create their own stories" ON public.user_stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can update their own stories" ON public.user_stories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can delete their own stories" ON public.user_stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.story_kudos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id uuid NOT NULL REFERENCES public.user_stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (story_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_kudos TO authenticated;
GRANT ALL ON public.story_kudos TO service_role;
ALTER TABLE public.story_kudos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Residents can view story kudos" ON public.story_kudos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Residents can give kudos" ON public.story_kudos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can remove their own kudos" ON public.story_kudos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.tree_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  points_used integer NOT NULL DEFAULT 500,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'planted', 'cancelled')),
  what3words_location text,
  planting_date date,
  tree_species text NOT NULL DEFAULT 'Native Oak',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tree_requests TO authenticated;
GRANT ALL ON public.tree_requests TO service_role;
ALTER TABLE public.tree_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Residents can view their own tree requests" ON public.tree_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Residents can create their own tree requests" ON public.tree_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can update their own tree requests" ON public.tree_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Residents can delete their own tree requests" ON public.tree_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_responses_updated_at BEFORE UPDATE ON public.user_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_stories_updated_at BEFORE UPDATE ON public.user_stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tree_requests_updated_at BEFORE UPDATE ON public.tree_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_pledges_user_id ON public.user_pledges(user_id);
CREATE INDEX idx_user_renewables_user_id ON public.user_renewables(user_id);
CREATE INDEX idx_user_responses_user_id_category ON public.user_responses(user_id, category);
CREATE INDEX idx_user_stories_created_at ON public.user_stories(created_at DESC);
CREATE INDEX idx_story_kudos_story_id ON public.story_kudos(story_id);
CREATE INDEX idx_tree_requests_user_id ON public.tree_requests(user_id);