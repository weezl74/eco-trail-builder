
-- Restrict profiles SELECT to own row
DROP POLICY IF EXISTS "Signed-in residents can view profile basics" ON public.profiles;
CREATE POLICY "Residents can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Public-safe projection for community/leaderboard reads (no sensitive PII)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
  WITH (security_invoker = off, security_barrier = on) AS
SELECT user_id, username, display_name, avatar_level, total_points
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;
