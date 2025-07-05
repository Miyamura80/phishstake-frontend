
import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const { getAccessToken, authenticated } = usePrivy();

  useEffect(() => {
    const setupAuth = async () => {
      if (authenticated) {
        try {
          const token = await getAccessToken();
          if (token) {
            // Set the Authorization header for Supabase requests
            supabase.realtime.setAuth(token);
            // Also set it in the default headers
            supabase.rest.headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error setting up Supabase auth:', error);
        }
      } else {
        // Clear auth when not authenticated
        delete supabase.rest.headers['Authorization'];
      }
    };

    setupAuth();
  }, [authenticated, getAccessToken]);

  return { supabase };
};
