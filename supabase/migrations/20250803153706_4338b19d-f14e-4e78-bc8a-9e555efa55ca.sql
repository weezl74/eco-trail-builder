-- Create table for user success stories
CREATE TABLE public.user_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  run_type TEXT NOT NULL, -- 'sprint', 'challenge', etc.
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for user stories
CREATE POLICY "Stories are viewable by everyone" 
ON public.user_stories 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own stories" 
ON public.user_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" 
ON public.user_stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.user_stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for story kudos
CREATE TABLE public.story_kudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.user_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.story_kudos ENABLE ROW LEVEL SECURITY;

-- Create policies for kudos
CREATE POLICY "Kudos are viewable by everyone" 
ON public.story_kudos 
FOR SELECT 
USING (true);

CREATE POLICY "Users can give kudos" 
ON public.story_kudos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own kudos" 
ON public.story_kudos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates on stories
CREATE TRIGGER update_user_stories_updated_at
BEFORE UPDATE ON public.user_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();