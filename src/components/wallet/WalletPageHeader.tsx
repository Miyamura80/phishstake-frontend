
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface WalletPageHeaderProps {
  onSync: () => void;
  isLoading: boolean;
}

export const WalletPageHeader = ({ onSync, isLoading }: WalletPageHeaderProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Wallet Management</h1>
          <p className="text-slate-400">Manage your USDC wallets for staking on definitions</p>
        </div>
        <Button
          onClick={onSync}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync
        </Button>
      </div>
    </div>
  );
};
