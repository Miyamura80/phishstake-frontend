import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { Wallet, Plus, Check, Unlink, Trash2 } from "lucide-react";
import { useWalletManagement } from "@/hooks/useWalletManagement";

const WalletPage = () => {
  const { user, createWallet, linkWallet } = usePrivy();
  const { wallets, ready } = useWallets();
  const [defaultWallet, setDefaultWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const {
    unlinkExternalWallet,
    deleteEmbeddedWallet,
    isLoading: walletManagementLoading
  } = useWalletManagement();

  useEffect(() => {
    // Load default wallet from local storage
    const saved = localStorage.getItem(`defaultWallet_${user?.id}`);
    if (saved && wallets.find(w => w.address === saved)) {
      setDefaultWallet(saved);
    }
  }, [wallets, user]);

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

  const handleSetDefault = (walletAddress: string) => {
    setDefaultWallet(walletAddress);
    localStorage.setItem(`defaultWallet_${user?.id}`, walletAddress);
    toast.success('Default wallet updated');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletType = (wallet: any) => {
    return wallet.walletClientType === 'privy' ? 'Embedded' : 'External';
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
      // Show confirmation dialog for embedded wallet deletion
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Wallet Management</h1>
        <p className="text-slate-400">Manage your USDC wallets for staking on definitions</p>
      </div>

      <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-lg sm:text-xl">
              <Wallet className="h-5 w-5 mr-2" />
              Connected Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wallets.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Wallet className="h-12 sm:h-16 w-12 sm:w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">
                  No wallets connected
                </h3>
                <p className="text-slate-500 mb-4 sm:mb-6 text-sm sm:text-base">
                  Create an embedded wallet or link an external wallet to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {wallets.map((wallet) => {
                  const isEmbedded = wallet.walletClientType === 'privy';
                  const isDefault = defaultWallet === wallet.address;
                  
                  return (
                    <div
                      key={wallet.address}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-700 rounded-lg gap-4"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm sm:text-base break-all">
                              {formatAddress(wallet.address)}
                            </span>
                            <Badge variant="secondary" className="bg-slate-600 text-slate-300 text-xs whitespace-nowrap">
                              {getWalletType(wallet)}
                            </Badge>
                            {isDefault && (
                              <Badge className="bg-green-600 text-white text-xs whitespace-nowrap">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs sm:text-sm">
                            {wallet.chainId ? `Chain ID: ${wallet.chainId}` : 'Multi-chain'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                        {!isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefault(wallet.address)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-600 text-xs whitespace-nowrap"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleFundWallet(wallet)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs whitespace-nowrap"
                        >
                          Fund
                        </Button>
                        {!isEmbedded ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWalletAction(wallet, 'unlink')}
                            disabled={loading || walletManagementLoading}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs whitespace-nowrap"
                          >
                            <Unlink className="h-3 w-3 mr-1" />
                            Unlink
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWalletAction(wallet, 'delete')}
                            disabled={loading || walletManagementLoading}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs whitespace-nowrap"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Embedded Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4 text-sm">
                Create a secure embedded wallet managed by Privy with built-in funding options.
              </p>
              <Button
                onClick={handleCreateEmbeddedWallet}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Embedded Wallet'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">External Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4 text-sm">
                Link your existing wallet (MetaMask, WalletConnect, etc.) for USDC staking.
              </p>
              <Button
                onClick={handleLinkExternalWallet}
                disabled={loading}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {loading ? 'Linking...' : 'Link External Wallet'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {wallets.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Wallet Rules & Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-slate-400 text-sm">
              <p>• You can have multiple wallets connected, but only one default wallet for staking</p>
              <p>• Embedded wallets are stored in the database to prevent accidental loss</p>
              <p>• External wallets can be unlinked safely without losing access</p>
              <p>• Only delete embedded wallets that are confirmed empty to prevent fund loss</p>
              <p>• USDC is required for staking on phishing definitions</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletPage;
