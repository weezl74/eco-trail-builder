-- Create table for tracking user tree planting requests
CREATE TABLE public.tree_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points_used INTEGER NOT NULL DEFAULT 500,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'planted', 'cancelled')),
  what3words_location TEXT,
  planting_date DATE,
  tree_species TEXT DEFAULT 'Native Oak',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tree_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tree requests" 
ON public.tree_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tree requests" 
ON public.tree_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tree requests" 
ON public.tree_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tree_requests_updated_at
BEFORE UPDATE ON public.tree_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();