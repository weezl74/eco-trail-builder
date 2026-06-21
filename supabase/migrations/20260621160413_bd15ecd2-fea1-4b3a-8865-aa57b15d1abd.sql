CREATE TABLE public.user_points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL,
  points_type text NOT NULL CHECK (points_type IN ('wool','tree')),
  source text NOT NULL,
  reference_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.user_points_ledger TO authenticated;
GRANT ALL ON public.user_points_ledger TO service_role;

ALTER TABLE public.user_points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ledger entries"
  ON public.user_points_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ledger entries"
  ON public.user_points_ledger FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_points_ledger_user_id ON public.user_points_ledger(user_id);
CREATE INDEX idx_user_points_ledger_created_at ON public.user_points_ledger(created_at DESC);