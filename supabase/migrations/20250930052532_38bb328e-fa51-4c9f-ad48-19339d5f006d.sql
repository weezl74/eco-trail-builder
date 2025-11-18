-- Create business pledges table
CREATE TABLE IF NOT EXISTS public.business_pledges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  impact_value INTEGER NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_pledges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Business owners can view their own pledges"
ON public.business_pledges
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Business owners can create their own pledges"
ON public.business_pledges
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Pledges are viewable by everyone"
ON public.business_pledges
FOR SELECT
USING (true);

-- Add index for performance
CREATE INDEX idx_business_pledges_business_id ON public.business_pledges(business_id);
CREATE INDEX idx_business_pledges_category ON public.business_pledges(category);