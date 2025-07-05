
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { Wallet, Plus, Check } from "lucide-react";

const WalletPage = () => {
  const { user, createWallet, linkWallet } = usePrivy();
  const { wallets, ready } = useWallets();
  const [defaultWallet, setDefaultWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      // For embedded wallets, we can use Privy's funding options
      toast.info('Funding options will be integrated with Privy SDK');
    } else {
      toast.info('Please fund your external wallet through your wallet provider');
    }
  };

  if (!ready) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Wallet Management</h1>
        <p className="text-slate-400">Manage your USDC wallets for staking on definitions</p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Connected Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wallets.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">
                  No wallets connected
                </h3>
                <p className="text-slate-500 mb-6">
                  Create an embedded wallet or link an external wallet to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.address}
                    className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">
                            {formatAddress(wallet.address)}
                          </span>
                          <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                            {getWalletType(wallet)}
                          </Badge>
                          {defaultWallet === wallet.address && (
                            <Badge className="bg-green-600 text-white">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {wallet.chainId ? `Chain ID: ${wallet.chainId}` : 'Multi-chain'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {defaultWallet !== wallet.address && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(wallet.address)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-600"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleFundWallet(wallet)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Fund
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Embedded Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">
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
              <p className="text-slate-400 mb-4">
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
            <CardTitle className="text-white">Wallet Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-slate-400">
              <p>• You can have multiple wallets connected, but only one default wallet for staking</p>
              <p>• Embedded wallets support Privy's built-in funding options</p>
              <p>• External wallets must be funded separately through your wallet provider</p>
              <p>• USDC is required for staking on phishing definitions</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletPage;
