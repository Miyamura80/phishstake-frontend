
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Shield, Wallet, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import DefinitionsPage from "@/components/DefinitionsPage";
import WalletPage from "@/components/WalletPage";

const LandingPage = () => {
  const { login } = usePrivy();

  const features = [
    {
      icon: Shield,
      title: "Anti-Phishing Definitions",
      description: "Create and manage comprehensive phishing detection rules with stake-based validation"
    },
    {
      icon: Wallet,
      title: "USDC Wallet Integration",
      description: "Seamlessly connect embedded or external wallets for USDC staking on your definitions"
    },
    {
      icon: Users,
      title: "Contributor Network",
      description: "Join a community of security experts contributing to phishing prevention"
    },
    {
      icon: Zap,
      title: "Smart Contract Deployment",
      description: "Deploy your definitions to the blockchain with automated stake management"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-600/20 rounded-full">
                <Shield className="h-16 w-16 text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              PhishShield
              <span className="block text-3xl md:text-4xl text-blue-400 mt-4">
                Stake-Based Phishing Protection
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create, manage, and deploy anti-phishing definitions with USDC staking. 
              Join the fight against phishing with blockchain-powered validation.
            </p>
            
            <Button
              onClick={login}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to contribute to phishing prevention and earn rewards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
                  <CardHeader className="text-center pb-2">
                    <div className="p-3 bg-blue-600/20 rounded-full w-fit mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-400" />
                    </div>
                    <CardTitle className="text-white text-lg">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-center">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Contributing?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join our network of security contributors and help build the future of phishing protection
          </p>
          <Button
            onClick={login}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Join PhishShield
          </Button>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { authenticated, ready, isSettingUp } = useSupabaseAuth();
  const [currentPage, setCurrentPage] = useState('definitions');

  // Show loading while authentication is being set up
  if (!ready || isSettingUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LandingPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'definitions':
        return <DefinitionsPage />;
      case 'wallet':
        return <WalletPage />;
      default:
        return <DefinitionsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavBar onPageChange={setCurrentPage} currentPage={currentPage} />
      <main>{renderPage()}</main>
    </div>
  );
};

export default Index;
