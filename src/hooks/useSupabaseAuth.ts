
import { usePrivy } from '@privy-io/react-auth';

export const useSupabaseAuth = () => {
  const { user, authenticated, ready } = usePrivy();

  return { 
    authenticated: authenticated && ready, 
    user, 
    ready,
    isSettingUp: false // No longer needed since we removed RLS
  };
};
