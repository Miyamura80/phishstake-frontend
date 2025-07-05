
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@privy-io/react-auth';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <PrivyProvider
    appId="cmcqc7aun00zzl80m3lmes841" // Replace with your actual Privy app ID
    config={{
      loginMethods: ['email', 'google'],
      appearance: {
        theme: 'dark',
        accentColor: '#3B82F6',
      },
      embeddedWallets: {
        createOnLogin: 'off',
        requireUserPasswordOnCreate: false,
      },
      supportedChains: [
        "USDC"
      ],
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </PrivyProvider>
);

export default App;
