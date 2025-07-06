
import { Button } from "@/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Wallet, Shield, User, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface NavBarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

const NavBar = ({ onPageChange, currentPage }: NavBarProps) => {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'definitions', label: 'Definitions', icon: Shield },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDefaultWallet = () => {
    if (!authenticated) return null;
    const walletId = `defaultWallet_${authenticated ? 'authenticated' : 'anonymous'}`;
    const savedDefault = localStorage.getItem(walletId);
    if (savedDefault && wallets.find(w => w.address === savedDefault)) {
      return wallets.find(w => w.address === savedDefault);
    }
    return wallets[0] || null;
  };

  const defaultWallet = getDefaultWallet();

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 sm:space-x-8">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
            <span className="text-lg sm:text-xl font-bold text-white">PhishShield</span>
          </div>
          
          {authenticated && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "default" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        currentPage === item.id 
                          ? "bg-blue-600 text-white" 
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      }`}
                      onClick={() => onPageChange(item.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-slate-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {authenticated ? (
            <>
              {/* Wallet Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {defaultWallet ? formatAddress(defaultWallet.address) : 'No Wallets'}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-slate-800 border-slate-700 text-slate-200"
                >
                  {wallets.length > 0 ? (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Connected Wallets ({wallets.length})
                      </div>
                      {wallets.slice(0, 3).map((wallet) => (
                        <DropdownMenuItem 
                          key={wallet.address}
                          className="flex items-center space-x-2 focus:bg-slate-700 focus:text-slate-100"
                        >
                          <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Wallet className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {formatAddress(wallet.address)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {wallet.walletClientType === 'privy' ? 'Embedded' : 'External'}
                              {defaultWallet?.address === wallet.address && ' • Default'}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {wallets.length > 3 && (
                        <DropdownMenuItem 
                          className="text-xs text-slate-400 focus:bg-slate-700 focus:text-slate-300"
                        >
                          +{wallets.length - 3} more wallets
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-slate-700" />
                    </>
                  ) : (
                    <DropdownMenuItem className="text-slate-400 focus:bg-slate-700">
                      No wallets connected
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onPageChange('wallet')}
                    className="flex items-center space-x-2 focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Manage Wallets</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Desktop User Info */}
              <div className="hidden sm:flex items-center space-x-2 text-slate-300">
                <User className="h-4 w-4" />
                <span className="text-sm truncate max-w-32 lg:max-w-none">
                  {user?.email?.address || 'User'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-sm"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={login}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {authenticated && mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-slate-700">
          <div className="space-y-2 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className={`w-full justify-start flex items-center space-x-2 ${
                    currentPage === item.id 
                      ? "bg-blue-600 text-white" 
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => {
                    onPageChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
            
            {/* Mobile Wallet Management */}
            <Button
              variant="ghost"
              className="w-full justify-start flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => {
                onPageChange('wallet');
                setMobileMenuOpen(false);
              }}
            >
              <Wallet className="h-4 w-4" />
              <span>Manage Wallets</span>
            </Button>
            
            {/* Mobile User Info */}
            <div className="sm:hidden flex items-center space-x-2 text-slate-400 px-3 py-2 text-sm">
              <User className="h-4 w-4" />
              <span className="truncate">{user?.email?.address || 'User'}</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
