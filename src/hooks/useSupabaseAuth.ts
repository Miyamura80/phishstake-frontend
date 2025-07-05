
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { setUserContext } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const { user, authenticated, ready } = usePrivy();
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    const setupAuth = async () => {
      if (!ready) {
        console.log('Privy not ready yet, waiting...');
        return;
      }

      if (authenticated && user) {
        console.log('Setting up auth for user:', user.id);
        setIsSettingUp(true);
        
        try {
          // Set user context for RLS policies
          await setUserContext(user.id);
          console.log('Auth setup completed successfully');
        } catch (error) {
          console.error('Error setting up auth:', error);
        } finally {
          setIsSettingUp(false);
        }
      } else {
        console.log('User not authenticated or user data not available');
      }
    };

    setupAuth();
  }, [authenticated, user, ready]);

  return { 
    authenticated: authenticated && ready, 
    user, 
    ready,
    isSettingUp 
  };
};
