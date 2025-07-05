
import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { useWalletSync } from './useWalletSync';

export const useWalletOperations = () => {
  const { user, unlinkWallet } = usePrivy();
  const { wallets } = useWallets();
  const { removeWalletFromDB } = useWalletSync();
  const [isLoading, setIsLoading] = useState(false);

  const validateWalletInPrivy = (walletAddress: string) => {
    return wallets.find(w => w.address.toLowerCase() === walletAddress.toLowerCase());
  };

  const unlinkExternalWallet = async (walletAddress: string) => {
    setIsLoading(true);
    console.log('Starting unlink process for wallet:', walletAddress);
    
    try {
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

      const privyWalletAddress = wallet.address;
      console.log('Using exact Privy address for unlinking:', privyWalletAddress);

      try {
        await unlinkWallet(privyWalletAddress);
        console.log('Successfully unlinked wallet from Privy');
        toast.success('External wallet unlinked successfully');
      } catch (privyError: any) {
        console.error('Privy unlink error:', privyError);
        
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
          throw privyError;
        }
      }
      
      console.log('Removing wallet from local database');
      await removeWalletFromDB(walletAddress);
      
    } catch (error: any) {
      console.error('Error in unlinkExternalWallet:', error);
      
      if (error.message === 'Cannot unlink embedded wallets') {
        toast.error('Cannot unlink embedded wallets. Use delete instead.');
      } else {
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

      // Remove from database first
      await removeWalletFromDB(walletAddress);
      
      toast.success('Embedded wallet removed from records');
      toast.info('Note: The embedded wallet still exists in Privy but is no longer tracked');
      
      // Force a page refresh to ensure the UI updates properly
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
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
    validateWalletInPrivy,
    unlinkExternalWallet,
    deleteEmbeddedWallet,
    isLoading
  };
};
