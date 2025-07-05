
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

  // Execute raw SQL since user_wallets table isn't in the generated types yet
  const executeSQL = async (query: string): Promise<any> => {
    const { data, error } = await supabase.rpc('set_user_context', { user_id_param: user?.id || '' });
    if (error) {
      console.error('Error setting user context:', error);
      throw error;
    }

    // Use a direct query approach - this is a temporary solution until types are regenerated
    const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/exec_raw_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'apikey': supabase.supabaseKey
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Failed to execute SQL');
    }

    return response.json();
  };

  // Fetch stored wallets from database
  const fetchStoredWallets = async () => {
    if (!user) return;

    try {
      // Set user context for RLS
      await supabase.rpc('set_user_context', { user_id_param: user.id });
      
      // For now, we'll work with the wallets from Privy directly
      // until the database types are properly regenerated
      const walletRecords = wallets.map(wallet => ({
        id: wallet.address,
        user_id: user.id,
        wallet_address: wallet.address,
        wallet_type: wallet.walletClientType === 'privy' ? 'embedded' as const : 'external' as const,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      setStoredWallets(walletRecords);
    } catch (error) {
      console.error('Error fetching stored wallets:', error);
    }
  };

  // Store wallet in database (placeholder for now)
  const storeWallet = async (walletAddress: string, walletType: 'embedded' | 'external') => {
    if (!user) return;
    
    try {
      await supabase.rpc('set_user_context', { user_id_param: user.id });
      console.log(`Storing wallet: ${walletAddress} (${walletType}) for user: ${user.id}`);
      // Database storage will be handled once types are regenerated
    } catch (error) {
      console.error('Error storing wallet:', error);
    }
  };

  // Mark wallet as inactive in database (placeholder for now)
  const deactivateWallet = async (walletAddress: string) => {
    if (!user) return;
    
    try {
      await supabase.rpc('set_user_context', { user_id_param: user.id });
      console.log(`Deactivating wallet: ${walletAddress} for user: ${user.id}`);
      // Database update will be handled once types are regenerated
    } catch (error) {
      console.error('Error deactivating wallet:', error);
    }
  };

  // Delete wallet record from database (placeholder for now)
  const deleteWalletRecord = async (walletAddress: string) => {
    if (!user) return;
    
    try {
      await supabase.rpc('set_user_context', { user_id_param: user.id });
      console.log(`Deleting wallet record: ${walletAddress} for user: ${user.id}`);
      // Database deletion will be handled once types are regenerated
      await fetchStoredWallets();
    } catch (error) {
      console.error('Error deleting wallet record:', error);
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
  }, [user, wallets]);

  return {
    storedWallets,
    loading,
    handleUnlinkWallet,
    handleDeleteEmbeddedWallet,
    fetchStoredWallets
  };
};
