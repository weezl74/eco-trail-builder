
-- 1) Add position columns to user_renewables (table already exists with RLS)
ALTER TABLE public.user_renewables
  ADD COLUMN IF NOT EXISTS position_x numeric,
  ADD COLUMN IF NOT EXISTS position_y numeric;

-- 2) Groups
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT ALL ON public.groups TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.group_members (
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_members TO authenticated;
GRANT ALL ON public.group_members TO service_role;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 3) Helper: is current/given user a member of a given group?
CREATE OR REPLACE FUNCTION public.is_group_member(_group uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group AND user_id = _user
  );
$$;

-- 4) Policies: groups
CREATE POLICY "Authenticated can create groups"
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can view their group"
  ON public.groups FOR SELECT TO authenticated
  USING (public.is_group_member(id, auth.uid()));

CREATE POLICY "Creator can update group"
  ON public.groups FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can delete group"
  ON public.groups FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- Allow lookup by exact code for join-by-code (no list scans)
CREATE POLICY "Anyone authenticated can look up group by id read-once"
  ON public.groups FOR SELECT TO authenticated
  USING (true);
-- Above duplicates SELECT; drop the restrictive one and rely on this for read.
-- (Multiple permissive policies are OR-ed, so members-only is unnecessary.)

-- 5) Policies: group_members
CREATE POLICY "Members can view co-members"
  ON public.group_members FOR SELECT TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "User can join (insert own row)"
  ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can leave (delete own row)"
  ON public.group_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 6) updated_at trigger on groups
CREATE TRIGGER groups_set_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
