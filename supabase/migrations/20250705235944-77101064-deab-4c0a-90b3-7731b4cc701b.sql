
-- Remove RLS policies from definitions table
DROP POLICY IF EXISTS "Users can manage their own definitions" ON public.definitions;

-- Remove RLS policies from user_wallets table  
DROP POLICY IF EXISTS "Users can manage their own wallets" ON public.user_wallets;

-- Disable RLS on both tables
ALTER TABLE public.definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets DISABLE ROW LEVEL SECURITY;

-- Drop the user context function since we won't need it anymore
DROP FUNCTION IF EXISTS public.set_user_context(text);
