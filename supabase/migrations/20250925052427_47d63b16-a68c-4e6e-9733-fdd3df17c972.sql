-- Update usernames to extract the part before @ from email addresses
-- This will make usernames shorter and more readable
UPDATE public.profiles 
SET username = SPLIT_PART(username, '@', 1)
WHERE username LIKE '%@%';