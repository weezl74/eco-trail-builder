-- Create table to store user questionnaire responses
CREATE TABLE public.user_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  impact_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own responses" 
ON public.user_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own responses" 
ON public.user_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses" 
ON public.user_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate responses to same question
CREATE UNIQUE INDEX idx_user_responses_unique ON public.user_responses (user_id, category, question_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_responses_updated_at
BEFORE UPDATE ON public.user_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();