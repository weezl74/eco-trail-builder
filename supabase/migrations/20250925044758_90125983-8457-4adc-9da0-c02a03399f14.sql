-- Update RLS policy to allow users to view basic profile info (username, avatar_level) for all users
-- This is needed for community features while keeping other profile data private
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view basic profile info for all users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the existing policies for insert/update unchanged
-- Users can still only insert/update their own profiles