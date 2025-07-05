
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet } from "lucide-react";

interface WalletActionsProps {
  loading: boolean;
  onCreateEmbedded: () => void;
  onLinkExternal: () => void;
}

export const WalletActions = ({ loading, onCreateEmbedded, onLinkExternal }: WalletActionsProps) => {
  return (
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
            onClick={onCreateEmbedded}
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
            onClick={onLinkExternal}
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
  );
};
