
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { WalletCard } from "./WalletCard";

interface WalletListProps {
  wallets: any[];
  defaultWallet: string | null;
  isLoading: boolean;
  onSetDefault: (address: string) => void;
  onFund: (wallet: any) => void;
  onWalletAction: (wallet: any, action: 'unlink' | 'delete') => void;
}

export const WalletList = ({ 
  wallets, 
  defaultWallet, 
  isLoading, 
  onSetDefault, 
  onFund, 
  onWalletAction 
}: WalletListProps) => {
  return (
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
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.address}
                wallet={wallet}
                isDefault={defaultWallet === wallet.address}
                isLoading={isLoading}
                onSetDefault={onSetDefault}
                onFund={onFund}
                onWalletAction={onWalletAction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
