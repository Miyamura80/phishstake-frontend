
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { Wallet, Shield, User } from "lucide-react";
import { useState } from "react";

interface NavBarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

const NavBar = ({ onPageChange, currentPage }: NavBarProps) => {
  const { login, logout, authenticated, user } = usePrivy();

  const navItems = [
    { id: 'definitions', label: 'Definitions', icon: Shield },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">PhishShield</span>
          </div>
          
          {authenticated && (
            <div className="flex space-x-1">
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
          )}
        </div>

        <div className="flex items-center space-x-4">
          {authenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.email?.address || 'User'}</span>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={login}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
