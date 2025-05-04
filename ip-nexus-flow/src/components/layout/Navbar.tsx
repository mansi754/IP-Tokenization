
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAlgorand } from "@/hooks/useAlgorand";
import { Link } from "react-router-dom";
import ConnectWallet from "../wallet/ConnectWallet";
import { Wallet } from "lucide-react";

export const Navbar = () => {
  const { connected, address, loading } = useAlgorand();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleWalletClick = () => {
    setIsWalletModalOpen(true);
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold gradient-text">IP-Nexus</h1>
            </Link>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-foreground/90 hover:text-ip-purple-500 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link to="/tokenize" className="text-foreground/90 hover:text-ip-purple-500 px-3 py-2 rounded-md text-sm font-medium">Tokenize IP</Link>
                <Link to="/marketplace" className="text-foreground/90 hover:text-ip-purple-500 px-3 py-2 rounded-md text-sm font-medium">Marketplace</Link>
                <Link to="/portfolio" className="text-foreground/90 hover:text-ip-purple-500 px-3 py-2 rounded-md text-sm font-medium">My Portfolio</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <Button 
              onClick={handleWalletClick} 
              variant={connected ? "outline" : "default"}
              className={`button-glow ${connected ? "border-ip-purple-500 text-ip-purple-500" : "bg-ip-purple-500 hover:bg-ip-purple-600"}`}
              disabled={loading}
            >
              <Wallet className="mr-2 h-4 w-4" />
              {loading ? "Connecting..." : connected ? "Connected" : "Connect Wallet"}
            </Button>
          </div>
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="text-foreground hover:bg-muted block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/tokenize" className="text-foreground hover:bg-muted block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              Tokenize IP
            </Link>
            <Link to="/marketplace" className="text-foreground hover:bg-muted block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              Marketplace
            </Link>
            <Link to="/portfolio" className="text-foreground hover:bg-muted block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              My Portfolio
            </Link>
            <div className="pt-4">
              <Button 
                onClick={handleWalletClick} 
                variant={connected ? "outline" : "default"}
                className={`w-full button-glow ${connected ? "border-ip-purple-500 text-ip-purple-500" : "bg-ip-purple-500 hover:bg-ip-purple-600"}`}
                disabled={loading}
              >
                <Wallet className="mr-2 h-4 w-4" />
                {loading ? "Connecting..." : connected ? "Connected" : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Wallet Connection Modal */}
      <ConnectWallet
        openModal={isWalletModalOpen}
        closeModal={() => setIsWalletModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
