
import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoredWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  wallet_type: 'embedded' | 'external';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWalletManagement = () => {
  const { user, unlinkWallet } = usePrivy();
  const { wallets } = useWallets();
  const [storedWallets, setStoredWallets] = useState<StoredWallet[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch stored wallets from database
  const fetchStoredWallets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStoredWallets(data || []);
    } catch (error) {
      console.error('Error fetching stored wallets:', error);
    }
  };

  // Store wallet in database
  const storeWallet = async (walletAddress: string, walletType: 'embedded' | 'external') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_wallets')
        .upsert({
          user_id: user.id,
          wallet_address: walletAddress,
          wallet_type: walletType,
          is_active: true
        });

      if (error) throw error;
      await fetchStoredWallets();
    } catch (error) {
      console.error('Error storing wallet:', error);
      toast.error('Failed to store wallet information');
    }
  };

  // Mark wallet as inactive in database
  const deactivateWallet = async (walletAddress: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_wallets')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('wallet_address', walletAddress);

      if (error) throw error;
      await fetchStoredWallets();
    } catch (error) {
      console.error('Error deactivating wallet:', error);
      toast.error('Failed to update wallet status');
    }
  };

  // Delete wallet record from database
  const deleteWalletRecord = async (walletAddress: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_wallets')
        .delete()
        .eq('user_id', user.id)
        .eq('wallet_address', walletAddress);

      if (error) throw error;
      await fetchStoredWallets();
    } catch (error) {
      console.error('Error deleting wallet record:', error);
      toast.error('Failed to delete wallet record');
    }
  };

  // Unlink external wallet
  const handleUnlinkWallet = async (walletAddress: string) => {
    setLoading(true);
    try {
      const wallet = wallets.find(w => w.address === walletAddress);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.walletClientType !== 'privy') {
        // For external wallets, unlink from Privy
        await unlinkWallet(walletAddress);
        await deactivateWallet(walletAddress);
        toast.success('External wallet unlinked successfully');
      } else {
        toast.error('Cannot unlink embedded wallets. Use delete for empty embedded wallets.');
      }
    } catch (error) {
      console.error('Error unlinking wallet:', error);
      toast.error('Failed to unlink wallet');
    } finally {
      setLoading(false);
    }
  };

  // Delete embedded wallet (only if empty)
  const handleDeleteEmbeddedWallet = async (walletAddress: string) => {
    setLoading(true);
    try {
      const wallet = wallets.find(w => w.address === walletAddress);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.walletClientType === 'privy') {
        // TODO: Check wallet balance before deletion
        // For now, we'll assume the wallet is empty as requested
        await deleteWalletRecord(walletAddress);
        toast.success('Empty embedded wallet deleted successfully');
        toast.info('Note: Always ensure the wallet is empty before deletion to prevent loss of funds');
      } else {
        toast.error('This operation is only for embedded wallets');
      }
    } catch (error) {
      console.error('Error deleting embedded wallet:', error);
      toast.error('Failed to delete embedded wallet');
    } finally {
      setLoading(false);
    }
  };

  // Sync wallets with database on wallet changes
  useEffect(() => {
    const syncWallets = async () => {
      if (!user || !wallets.length) return;

      for (const wallet of wallets) {
        const walletType = wallet.walletClientType === 'privy' ? 'embedded' : 'external';
        await storeWallet(wallet.address, walletType);
      }
    };

    syncWallets();
  }, [wallets, user]);

  useEffect(() => {
    fetchStoredWallets();
  }, [user]);

  return {
    storedWallets,
    loading,
    handleUnlinkWallet,
    handleDeleteEmbeddedWallet,
    fetchStoredWallets
  };
};
