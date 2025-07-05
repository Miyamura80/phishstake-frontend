
-- Update RLS policies to work with Privy user IDs (string) instead of auth.uid()
DROP POLICY IF EXISTS "Users can manage their own definitions" ON public.definitions;

-- Create new policy that works with string user_id from Privy
CREATE POLICY "Users can manage their own definitions" 
  ON public.definitions 
  FOR ALL 
  USING (user_id = current_setting('app.user_id', true));

-- Create function to set user context
CREATE OR REPLACE FUNCTION public.set_user_context(user_id_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.user_id', user_id_param, false);
END;
$$;
