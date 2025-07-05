import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWalletManagement = () => {
  const { user, unlinkWallet } = usePrivy();
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

  const validateWalletInPrivy = (walletAddress: string) => {
    return wallets.find(w => w.address.toLowerCase() === walletAddress.toLowerCase());
  };

  const syncLocalStateWithPrivy = async () => {
    if (!user) return;

    // Get wallets from database
    const { data: dbWallets } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('user_id', user.id);

    if (!dbWallets) return;

    // Remove wallets from DB that are no longer in Privy
    const privyAddresses = wallets.map(w => w.address.toLowerCase());
    const orphanedWallets = dbWallets.filter(
      dbWallet => !privyAddresses.includes(dbWallet.wallet_address.toLowerCase())
    );

    for (const orphaned of orphanedWallets) {
      console.log('Removing orphaned wallet from DB:', orphaned.wallet_address);
      await removeWalletFromDB(orphaned.wallet_address);
    }
  };

  const unlinkExternalWallet = async (walletAddress: string) => {
    setIsLoading(true);
    console.log('Starting unlink process for wallet:', walletAddress);
    
    try {
      // First validate the wallet exists in Privy and get the exact wallet object
      const wallet = validateWalletInPrivy(walletAddress);
      if (!wallet) {
        console.log('Wallet not found in Privy, removing from local records only');
        await removeWalletFromDB(walletAddress);
        toast.success('Wallet removed from local records');
        return;
      }

      console.log('Found wallet in Privy:', wallet);

      if (wallet.walletClientType === 'privy') {
        throw new Error('Cannot unlink embedded wallets');
      }

      // Use the exact address from the Privy wallet object
      const privyWalletAddress = wallet.address;
      console.log('Using exact Privy address for unlinking:', privyWalletAddress);

      // Attempt to unlink from Privy using the exact address format
      try {
        await unlinkWallet(privyWalletAddress);
        console.log('Successfully unlinked wallet from Privy');
        toast.success('External wallet unlinked successfully');
      } catch (privyError: any) {
        console.error('Privy unlink error:', privyError);
        console.error('Error details:', {
          message: privyError?.message,
          code: privyError?.code,
          status: privyError?.status
        });
        
        // Handle specific Privy errors more robustly
        const errorMessage = privyError?.message?.toLowerCase() || '';
        const isWalletNotFound = 
          errorMessage.includes('linked_account_not_found') || 
          errorMessage.includes('account not found') ||
          errorMessage.includes('wallet not found') ||
          privyError?.code === 'linked_account_not_found';
        
        if (isWalletNotFound) {
          console.log('Wallet not found in Privy, proceeding with local cleanup');
          toast.info('Wallet was not linked in Privy, removing from local records');
        } else {
          // Re-throw other errors to be handled in the outer catch
          throw privyError;
        }
      }
      
      // Always remove from database regardless of Privy result
      console.log('Removing wallet from local database');
      await removeWalletFromDB(walletAddress);
      
    } catch (error: any) {
      console.error('Error in unlinkExternalWallet:', error);
      
      // Provide specific error messages
      if (error.message === 'Cannot unlink embedded wallets') {
        toast.error('Cannot unlink embedded wallets. Use delete instead.');
      } else {
        // For any other error, still try to remove from local DB as a fallback
        console.log('Attempting to remove from local DB as fallback');
        try {
          await removeWalletFromDB(walletAddress);
          toast.info('Wallet removed from local records, but may still exist in Privy');
        } catch (dbError) {
          console.error('Failed to remove from local DB:', dbError);
          toast.error(`Failed to unlink wallet: ${error.message || 'Unknown error'}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmbeddedWallet = async (walletAddress: string) => {
    setIsLoading(true);
    try {
      // First validate the wallet exists in Privy
      const wallet = validateWalletInPrivy(walletAddress);
      if (!wallet) {
        console.log('Embedded wallet not found in Privy, removing from local records only');
        await removeWalletFromDB(walletAddress);
        toast.success('Wallet removed from local records');
        return;
      }

      if (wallet.walletClientType !== 'privy') {
        throw new Error('Can only delete embedded wallets');
      }

      // For embedded wallets, we can only remove from our database records
      // Privy doesn't allow deleting embedded wallets via SDK
      await removeWalletFromDB(walletAddress);
      
      toast.success('Embedded wallet removed from records');
      toast.info('Note: The embedded wallet still exists in Privy but is no longer tracked');
    } catch (error: any) {
      console.error('Error deleting embedded wallet:', error);
      
      if (error.message === 'Can only delete embedded wallets') {
        toast.error('Can only delete embedded wallets. Use unlink for external wallets.');
      } else {
        toast.error(`Failed to delete embedded wallet: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    storeWalletInDB,
    removeWalletFromDB,
    syncWalletsWithDB,
    syncLocalStateWithPrivy,
    validateWalletInPrivy,
    unlinkExternalWallet,
    deleteEmbeddedWallet,
    isLoading
  };
};
