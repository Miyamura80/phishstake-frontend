
import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWalletSync = () => {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [isSyncing, setIsSyncing] = useState(false);

  const storeWalletInDB = async (walletAddress: string, walletType: 'embedded' | 'external') => {
    if (!user) {
      console.log('No user available for storing wallet');
      return;
    }

    console.log('Storing wallet in DB:', { walletAddress, walletType, userId: user.id });

    try {
      const { error } = await supabase
        .from('user_wallets')
        .upsert({
          user_id: user.id,
          wallet_address: walletAddress,
          wallet_type: walletType,
          is_active: true
        }, {
          onConflict: 'user_id,wallet_address'
        });

      if (error) {
        console.error('Error storing wallet:', error);
        throw error;
      } else {
        console.log('Wallet stored successfully');
      }
    } catch (error) {
      console.error('Error in storeWalletInDB:', error);
      throw error;
    }
  };

  const removeWalletFromDB = async (walletAddress: string) => {
    if (!user) return;

    console.log('Removing wallet from DB:', walletAddress);

    try {
      const { error } = await supabase
        .from('user_wallets')
        .delete()
        .eq('user_id', user.id)
        .eq('wallet_address', walletAddress);

      if (error) {
        console.error('Error removing wallet from DB:', error);
        throw error;
      } else {
        console.log('Wallet removed from DB successfully');
      }
    } catch (error) {
      console.error('Error in removeWalletFromDB:', error);
      throw error;
    }
  };

  const syncWalletsWithDB = useCallback(async () => {
    if (!user || !wallets.length) {
      console.log('Cannot sync - missing user or wallets:', { user: !!user, walletCount: wallets.length });
      return;
    }

    console.log('Starting wallet sync with DB. Privy wallets:', wallets.length);
    setIsSyncing(true);

    try {
      for (const wallet of wallets) {
        const walletType = wallet.walletClientType === 'privy' ? 'embedded' : 'external';
        console.log('Syncing wallet:', { address: wallet.address, type: walletType });
        await storeWalletInDB(wallet.address, walletType);
      }
      console.log('Wallet sync completed successfully');
    } catch (error) {
      console.error('Error during wallet sync:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [user, wallets]);

  const syncLocalStateWithPrivy = async () => {
    if (!user) {
      console.log('No user available for local state sync');
      return;
    }

    console.log('Syncing local state with Privy');

    try {
      const { data: dbWallets, error } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching DB wallets:', error);
        return;
      }

      if (!dbWallets) {
        console.log('No wallets found in DB');
        return;
      }

      console.log('DB wallets:', dbWallets.length, 'Privy wallets:', wallets.length);

      const privyAddresses = wallets.map(w => w.address.toLowerCase());
      const orphanedWallets = dbWallets.filter(
        dbWallet => !privyAddresses.includes(dbWallet.wallet_address.toLowerCase())
      );

      for (const orphaned of orphanedWallets) {
        console.log('Removing orphaned wallet from DB:', orphaned.wallet_address);
        await removeWalletFromDB(orphaned.wallet_address);
      }

      console.log('Local state sync completed');
    } catch (error) {
      console.error('Error in syncLocalStateWithPrivy:', error);
    }
  };

  return {
    storeWalletInDB,
    removeWalletFromDB,
    syncWalletsWithDB,
    syncLocalStateWithPrivy,
    isSyncing
  };
};
