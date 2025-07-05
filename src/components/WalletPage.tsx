
import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useWalletManagement } from "@/hooks/useWalletManagement";
import { WalletPageHeader } from "./wallet/WalletPageHeader";
import { WalletList } from "./wallet/WalletList";
import { WalletActions } from "./wallet/WalletActions";
import { WalletRules } from "./wallet/WalletRules";

const WalletPage = () => {
  const { user, createWallet, linkWallet } = usePrivy();
  const { wallets, ready } = useWallets();
  const [defaultWallet, setDefaultWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const {
    unlinkExternalWallet,
    deleteEmbeddedWallet,
    syncLocalStateWithPrivy,
    isLoading: walletManagementLoading
  } = useWalletManagement();

  useEffect(() => {
    // Load default wallet from local storage
    const saved = localStorage.getItem(`defaultWallet_${user?.id}`);
    if (saved && wallets.find(w => w.address === saved)) {
      setDefaultWallet(saved);
    }
  }, [wallets, user]);

  // Sync local state with Privy on component mount
  useEffect(() => {
    if (ready && user && wallets.length > 0) {
      syncLocalStateWithPrivy().catch(console.error);
    }
  }, [ready, user, wallets.length, syncLocalStateWithPrivy]);

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
    localStorage.setItem(`defaultWallet_${user?.id}`, walletAddress);
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
    const isOperationInProgress = loading || walletManagementLoading;
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

  if (!ready) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <WalletPageHeader 
        onSync={handleSyncWallets}
        isLoading={loading || walletManagementLoading}
      />

      <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
        <WalletList
          wallets={wallets}
          defaultWallet={defaultWallet}
          isLoading={loading || walletManagementLoading}
          onSetDefault={handleSetDefault}
          onFund={handleFundWallet}
          onWalletAction={handleWalletAction}
        />

        <WalletActions
          loading={loading}
          onCreateEmbedded={handleCreateEmbeddedWallet}
          onLinkExternal={handleLinkExternalWallet}
        />
      </div>

      {wallets.length > 0 && <WalletRules />}
    </div>
  );
};

export default WalletPage;
