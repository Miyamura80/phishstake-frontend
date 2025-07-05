
import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { setUserContext } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const { user, authenticated } = usePrivy();

  useEffect(() => {
    const setupAuth = async () => {
      if (authenticated && user) {
        // Set user context for RLS policies
        await setUserContext(user.id);
      }
    };

    setupAuth();
  }, [authenticated, user]);

  return { authenticated, user };
};
