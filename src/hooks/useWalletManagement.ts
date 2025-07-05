
import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWalletManagement = () => {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);

  const storeWalletInDB = async (walletAddress: string, walletType: 'embedded' | 'external') => {
    if (!user) return;

    try {
      // Use a direct insert with conflict resolution
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
      }
    } catch (error) {
      console.error('Error in storeWalletInDB:', error);
    }
  };

  const removeWalletFromDB = async (walletAddress: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_wallets')
        .delete()
        .eq('user_id', user.id)
        .eq('wallet_address', walletAddress);

      if (error) {
        console.error('Error removing wallet from DB:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in removeWalletFromDB:', error);
      throw error;
    }
  };

  const syncWalletsWithDB = async () => {
    if (!user || !wallets.length) return;

    for (const wallet of wallets) {
      const walletType = wallet.walletClientType === 'privy' ? 'embedded' : 'external';
      await storeWalletInDB(wallet.address, walletType);
    }
  };

  const unlinkExternalWallet = async (walletAddress: string) => {
    setIsLoading(true);
    try {
      const wallet = wallets.find(w => w.address === walletAddress);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.walletClientType === 'privy') {
        throw new Error('Cannot unlink embedded wallets');
      }

      // Unlink from Privy
      await wallet.unlink();
      
      // Remove from database
      await removeWalletFromDB(walletAddress);
      
      toast.success('External wallet unlinked successfully');
    } catch (error) {
      console.error('Error unlinking wallet:', error);
      toast.error('Failed to unlink wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmbeddedWallet = async (walletAddress: string) => {
    setIsLoading(true);
    try {
      const wallet = wallets.find(w => w.address === walletAddress);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.walletClientType !== 'privy') {
        throw new Error('Can only delete embedded wallets');
      }

      // For now, we'll just remove from database since we can't actually delete embedded wallets
      // In a real implementation, you'd need to check if the wallet is empty first
      await removeWalletFromDB(walletAddress);
      
      toast.success('Embedded wallet removed from records');
    } catch (error) {
      console.error('Error deleting embedded wallet:', error);
      toast.error('Failed to delete embedded wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    storeWalletInDB,
    removeWalletFromDB,
    syncWalletsWithDB,
    unlinkExternalWallet,
    deleteEmbeddedWallet,
    isLoading
  };
};
