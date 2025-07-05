
import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useWalletManagement } from "@/hooks/useWalletManagement";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { WalletPageHeader } from "./wallet/WalletPageHeader";
import { WalletList } from "./wallet/WalletList";
import { WalletActions } from "./wallet/WalletActions";
import { WalletRules } from "./wallet/WalletRules";

const WalletPage = () => {
  const { createWallet, linkWallet } = usePrivy();
  const { wallets, ready } = useWallets();
  const { authenticated, isSettingUp } = useSupabaseAuth();
  const [defaultWallet, setDefaultWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasInitialSync, setHasInitialSync] = useState(false);
  
  const {
    unlinkExternalWallet,
    deleteEmbeddedWallet,
    syncWalletsWithDB,
    syncLocalStateWithPrivy,
    isLoading: walletManagementLoading,
    isSyncing
  } = useWalletManagement();

  // Load default wallet from local storage
  useEffect(() => {
    if (ready && wallets.length > 0) {
      const savedWalletId = `defaultWallet_${authenticated ? 'authenticated' : 'anonymous'}`;
      const saved = localStorage.getItem(savedWalletId);
      if (saved && wallets.find(w => w.address === saved)) {
        setDefaultWallet(saved);
      }
    }
  }, [wallets, ready, authenticated]);

  // Initial sync when wallets are ready and auth is complete
  useEffect(() => {
    const performInitialSync = async () => {
      if (!ready || !authenticated || isSettingUp || hasInitialSync) {
        console.log('Skipping initial sync:', { ready, authenticated, isSettingUp, hasInitialSync });
        return;
      }

      if (wallets.length === 0) {
        console.log('No wallets to sync');
        setHasInitialSync(true);
        return;
      }

      console.log('Performing initial wallet sync');
      try {
        await syncWalletsWithDB();
        await syncLocalStateWithPrivy();
        setHasInitialSync(true);
        console.log('Initial sync completed');
      } catch (error) {
        console.error('Error during initial sync:', error);
        toast.error('Failed to sync wallet state');
      }
    };

    performInitialSync();
  }, [ready, authenticated, isSettingUp, wallets.length, syncWalletsWithDB, syncLocalStateWithPrivy, hasInitialSync]);

  const handleCreateEmbeddedWallet = async () => {
    setLoading(true);
    try {
      await createWallet();
      toast.success('Embedded wallet created successfully');
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast.error('Failed to create embedded wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkExternalWallet = async () => {
    setLoading(true);
    try {
      await linkWallet();
      toast.success('External wallet linked successfully');
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast.error('Failed to link external wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWallets = async () => {
    setLoading(true);
    try {
      await syncWalletsWithDB();
      await syncLocalStateWithPrivy();
      toast.success('Wallet state synchronized');
    } catch (error) {
      console.error('Error syncing wallets:', error);
      toast.error('Failed to sync wallet state');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (walletAddress: string) => {
    setDefaultWallet(walletAddress);
    const walletId = `defaultWallet_${authenticated ? 'authenticated' : 'anonymous'}`;
    localStorage.setItem(walletId, walletAddress);
    toast.success('Default wallet updated');
  };

  const handleFundWallet = (wallet: any) => {
    if (wallet.walletClientType === 'privy') {
      toast.info('Funding options will be integrated with Privy SDK');
    } else {
      toast.info('Please fund your external wallet through your wallet provider');
    }
  };

  const handleWalletAction = async (wallet: any, action: 'unlink' | 'delete') => {
    const isOperationInProgress = loading || walletManagementLoading || isSyncing;
    if (isOperationInProgress) {
      toast.error('Please wait for the current operation to complete');
      return;
    }

    if (action === 'unlink' && wallet.walletClientType !== 'privy') {
      await unlinkExternalWallet(wallet.address);
    } else if (action === 'delete' && wallet.walletClientType === 'privy') {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this embedded wallet? This action cannot be undone. Make sure the wallet is empty to prevent loss of funds.'
      );
      if (confirmDelete) {
        await deleteEmbeddedWallet(wallet.address);
      }
    } else {
      toast.error('Invalid operation for this wallet type');
    }
  };

  // Show loading while authentication is being set up
  if (!ready || isSettingUp) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Setting up authentication...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-slate-400">Please log in to access wallet management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <WalletPageHeader 
        onSync={handleSyncWallets}
        isLoading={loading || walletManagementLoading || isSyncing}
      />

      {isSyncing && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-blue-300 text-sm">Synchronizing wallets...</p>
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
        <WalletList
          wallets={wallets}
          defaultWallet={defaultWallet}
          isLoading={loading || walletManagementLoading || isSyncing}
          onSetDefault={handleSetDefault}
          onFund={handleFundWallet}
          onWalletAction={handleWalletAction}
        />

        <WalletActions
          loading={loading || isSyncing}
          onCreateEmbedded={handleCreateEmbeddedWallet}
          onLinkExternal={handleLinkExternalWallet}
        />
      </div>

      {wallets.length > 0 && <WalletRules />}
    </div>
  );
};

export default WalletPage;
