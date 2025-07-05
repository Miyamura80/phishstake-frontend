
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { Wallet, Shield, User, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavBarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

const NavBar = ({ onPageChange, currentPage }: NavBarProps) => {
  const { login, logout, authenticated, user } = usePrivy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'definitions', label: 'Definitions', icon: Shield },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

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
