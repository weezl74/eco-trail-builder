-- Create storage bucket for story images
INSERT INTO storage.buckets (id, name, public) VALUES ('story-images', 'story-images', true);

-- Create policy for public access to story images
CREATE POLICY "Story images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'story-images');

-- Create policy for users to upload story images
CREATE POLICY "Users can upload story images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'story-images' AND auth.uid() IS NOT NULL);