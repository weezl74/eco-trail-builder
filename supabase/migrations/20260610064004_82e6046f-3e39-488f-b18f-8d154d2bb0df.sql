DROP POLICY IF EXISTS "Pledges are viewable by everyone" ON public.pledges;
DROP POLICY IF EXISTS "Public can view pledges" ON public.pledges;
DROP POLICY IF EXISTS "Anyone can view pledges" ON public.pledges;
DROP POLICY IF EXISTS "Pledges viewable by public" ON public.pledges;

CREATE POLICY "Authenticated users can view pledges"
ON public.pledges
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.pledges FROM anon;
GRANT SELECT ON public.pledges TO authenticated;
GRANT ALL ON public.pledges TO service_role;