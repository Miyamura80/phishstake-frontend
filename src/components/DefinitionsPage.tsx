import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useSmartContract } from "@/hooks/useSmartContract";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Shield, Wallet } from "lucide-react";

interface Definition {
  id: string;
  description: string;
  stake_amount: number;
  status: 'draft' | 'deployed';
  created_at: string;
  updated_at: string;
  transaction_hash?: string;
  definition_hash?: string;
  wallet_hash?: string;
}

const DefinitionsPage = () => {
  const { user, authenticated, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const { deployDefinition, isDeploying } = useSmartContract();
  useSupabaseAuth(); // This sets up the auth integration
  
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<Definition | null>(null);
  const [deployingDefinition, setDeployingDefinition] = useState<Definition | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [formData, setFormData] = useState({
    description: '',
    stake_amount: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authenticated && user) {
      fetchDefinitions();
    }
  }, [authenticated, user]);

  useEffect(() => {
    // Set default wallet if available
    const defaultWallet = localStorage.getItem(`defaultWallet_${user?.id}`);
    if (defaultWallet && wallets.find(w => w.address === defaultWallet)) {
      setSelectedWallet(defaultWallet);
    } else if (wallets.length > 0) {
      setSelectedWallet(wallets[0].address);
    }
  }, [wallets, user]);

  const fetchDefinitions = async () => {
    if (!authenticated || !user) return;
    
    try {
      // Ensure we have a valid token before making the request
      const token = await getAccessToken();
      if (token) {
        supabase.rest.headers['Authorization'] = `Bearer ${token}`;
      }

      const { data, error } = await supabase
        .from('definitions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Type cast the data to ensure status is properly typed
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'draft' | 'deployed'
      }));
      
      setDefinitions(typedData);
    } catch (error) {
      console.error('Error fetching definitions:', error);
      toast.error('Failed to fetch definitions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated || !user) {
      toast.error('Please log in to create definitions');
      return;
    }

    setLoading(true);
    try {
      // Ensure we have a valid token before making the request
      const token = await getAccessToken();
      if (token) {
        supabase.rest.headers['Authorization'] = `Bearer ${token}`;
      }

      const definitionData = {
        description: formData.description,
        stake_amount: formData.stake_amount,
        user_id: user.id,
        status: 'draft' as const
      };

      console.log('Attempting to save definition:', definitionData);

      if (editingDefinition) {
        const { error } = await supabase
          .from('definitions')
          .update(definitionData)
          .eq('id', editingDefinition.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success('Definition updated successfully');
      } else {
        const { error } = await supabase
          .from('definitions')
          .insert([definitionData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success('Definition created successfully');
      }

      setFormData({ description: '', stake_amount: 0 });
      setIsCreateDialogOpen(false);
      setEditingDefinition(null);
      fetchDefinitions();
    } catch (error) {
      console.error('Error saving definition:', error);
      toast.error('Failed to save definition. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('definitions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Definition deleted successfully');
      fetchDefinitions();
    } catch (error) {
      console.error('Error deleting definition:', error);
      toast.error('Failed to delete definition');
    }
  };

  const handleDeploy = async () => {
    if (!deployingDefinition || !selectedWallet) {
      toast.error('Please select a wallet and definition to deploy');
      return;
    }

    try {
      // Deploy to smart contract
      const result = await deployDefinition(
        deployingDefinition.description,
        deployingDefinition.stake_amount,
        selectedWallet
      );

      // Update database with deployment info
      const { error } = await supabase
        .from('definitions')
        .update({
          status: 'deployed',
          transaction_hash: result.transactionHash,
          definition_hash: result.definitionHash,
          wallet_hash: result.walletHash
        })
        .eq('id', deployingDefinition.id);

      if (error) throw error;

      toast.success('Definition deployed successfully!');
      setIsDeployDialogOpen(false);
      setDeployingDefinition(null);
      fetchDefinitions();
    } catch (error) {
      console.error('Error deploying definition:', error);
      toast.error('Failed to deploy definition');
    }
  };

  const openEditDialog = (definition: Definition) => {
    setEditingDefinition(definition);
    setFormData({
      description: definition.description,
      stake_amount: definition.stake_amount
    });
    setIsCreateDialogOpen(true);
  };

  const openDeployDialog = (definition: Definition) => {
    setDeployingDefinition(definition);
    setIsDeployDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ description: '', stake_amount: 0 });
    setEditingDefinition(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletType = (wallet: any) => {
    return wallet.walletClientType === 'privy' ? 'Embedded' : 'External';
  };

  // Show login prompt if not authenticated
  if (!authenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            Authentication Required
          </h3>
          <p className="text-slate-500 mb-6">
            Please log in to create and manage your anti-phishing definitions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Anti-Phishing Definitions</h1>
          <p className="text-slate-400">Create and manage your phishing detection definitions</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Definition
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingDefinition ? 'Edit Definition' : 'Create New Definition'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the phishing scenario..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stake_amount" className="text-slate-300">Stake Amount (USDC)</Label>
                <Input
                  id="stake_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.stake_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, stake_amount: parseFloat(e.target.value) || 0 }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Saving...' : (editingDefinition ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Deploy Dialog */}
        <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Deploy Definition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Definition</Label>
                <div className="p-3 bg-slate-700 rounded-md">
                  <p className="text-white text-sm">{deployingDefinition?.description}</p>
                  <p className="text-blue-400 text-sm mt-2">
                    Stake: {deployingDefinition?.stake_amount} USDC
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-slate-300">Select Wallet</Label>
                <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose a wallet" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.address} value={wallet.address} className="text-white">
                        <div className="flex items-center space-x-2">
                          <Wallet className="h-4 w-4" />
                          <span>{formatAddress(wallet.address)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getWalletType(wallet)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeployDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying || !selectedWallet}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isDeploying ? 'Deploying...' : 'Deploy to Blockchain'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {definitions.map((definition) => (
          <Card key={definition.id} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-white text-lg line-clamp-2">
                  {definition.description}
                </CardTitle>
                <Badge 
                  variant={definition.status === 'deployed' ? 'default' : 'secondary'}
                  className={definition.status === 'deployed' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-600 text-slate-300'
                  }
                >
                  {definition.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stake Amount</span>
                  <span className="text-blue-400 font-semibold">
                    {definition.stake_amount} USDC
                  </span>
                </div>
                
                {definition.status === 'deployed' && definition.transaction_hash && (
                  <div className="text-xs text-slate-500">
                    <span>TX: {definition.transaction_hash.slice(0, 10)}...{definition.transaction_hash.slice(-6)}</span>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  {definition.status === 'draft' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(definition)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(definition.id)}
                        className="border-red-600 text-red-400 hover:bg-red-900 hover:border-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  
                  {definition.status === 'draft' && wallets.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => openDeployDialog(definition)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Deploy
                    </Button>
                  )}

                  {definition.status === 'draft' && wallets.length === 0 && (
                    <Button
                      size="sm"
                      disabled
                      className="bg-slate-600 text-slate-400 flex-1"
                    >
                      <Wallet className="h-3 w-3 mr-1" />
                      Need Wallet
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {definitions.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            No definitions yet
          </h3>
          <p className="text-slate-500 mb-6">
            Create your first anti-phishing definition to get started
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Definition
          </Button>
        </div>
      )}
    </div>
  );
};

export default DefinitionsPage;
