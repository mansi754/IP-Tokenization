import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Navbar from "./components/layout/Navbar";
import TokenizationForm from "./components/tokenization/TokenizationForm";
import Marketplace from "./components/marketplace/Marketplace";
import FractionalOwnership from "./components/fractional/FractionalOwnership";
import TokenDetails from "./components/token/TokenDetails";
import { WalletProvider } from "@txnlab/use-wallet-react";
import { DeflyWalletConnect } from '@blockshake/defly-connect';
import { PeraWalletConnect } from '@perawallet/connect';
import { WalletConnection } from './components/WalletConnection';
import { useEffect } from 'react';
import { algorandIntegration } from './services/algorandIntegration';

const queryClient = new QueryClient();

const walletProviders = {
  defly: {
    id: 'defly',
    name: 'Defly Wallet',
    icon: 'https://defly.app/assets/logo.png',
    provider: new DeflyWalletConnect()
  },
  pera: {
    id: 'pera',
    name: 'Pera Wallet',
    icon: 'https://perawallet.app/img/logo.png',
    provider: new PeraWalletConnect()
  }
};

const App = () => {
  useEffect(() => {
    // Initialize Algorand connection when the app starts
    algorandIntegration.initialize().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider value={walletProviders}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tokenize" element={<TokenizationForm />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/portfolio" element={<FractionalOwnership />} />
              <Route path="/token/:id" element={<TokenDetails />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WalletConnection />
          </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
};

export default App;
