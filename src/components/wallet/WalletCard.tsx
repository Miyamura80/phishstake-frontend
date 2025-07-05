
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Check, Unlink, Trash2 } from "lucide-react";

interface WalletCardProps {
  wallet: any;
  isDefault: boolean;
  isLoading: boolean;
  onSetDefault: (address: string) => void;
  onFund: (wallet: any) => void;
  onWalletAction: (wallet: any, action: 'unlink' | 'delete') => void;
}

export const WalletCard = ({ 
  wallet, 
  isDefault, 
  isLoading, 
  onSetDefault, 
  onFund, 
  onWalletAction 
}: WalletCardProps) => {
  const isEmbedded = wallet.walletClientType === 'privy';
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletType = (wallet: any) => {
    return wallet.walletClientType === 'privy' ? 'Embedded' : 'External';
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-700 rounded-lg gap-4">
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
            onClick={() => onSetDefault(wallet.address)}
            className="border-slate-600 text-slate-300 hover:bg-slate-600 text-xs whitespace-nowrap"
          >
            <Check className="h-3 w-3 mr-1" />
            Set Default
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => onFund(wallet)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs whitespace-nowrap"
        >
          Fund
        </Button>
        {!isEmbedded ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onWalletAction(wallet, 'unlink')}
            disabled={isLoading}
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs whitespace-nowrap"
          >
            <Unlink className="h-3 w-3 mr-1" />
            Unlink
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onWalletAction(wallet, 'delete')}
            disabled={isLoading}
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-xs whitespace-nowrap"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
