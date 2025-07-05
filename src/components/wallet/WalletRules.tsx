
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const WalletRules = () => {
  return (
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
          <p>• Use the Sync button if wallets appear out of sync between Privy and local records</p>
        </div>
      </CardContent>
    </Card>
  );
};
