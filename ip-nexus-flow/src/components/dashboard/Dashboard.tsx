
import { useState, useEffect } from "react";
import { IPToken } from "@/types";
import { algorandService } from "@/services/algorandService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IPTokenCard from "@/components/common/IPTokenCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAlgorand } from "@/hooks/useAlgorand";

export const Dashboard = () => {
  const [tokens, setTokens] = useState<IPToken[]>([]);
  const [featuredTokens, setFeaturedTokens] = useState<IPToken[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { connected } = useAlgorand();

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const fetchedTokens = await algorandService.getIPTokens();
        setTokens(fetchedTokens);
        
        // Select 3 random tokens as featured
        const randomTokens = [...fetchedTokens].sort(() => 0.5 - Math.random()).slice(0, 3);
        setFeaturedTokens(randomTokens);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading IP tokens:", error);
        setLoading(false);
        toast.error("Failed to load tokens", {
          description: "Please try again later",
        });
      }
    };

    loadTokens();
  }, []);

  const handleBuyClick = (tokenId: string) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    navigate(`/marketplace/${tokenId}`);
  };

  const handleViewClick = (tokenId: string) => {
    navigate(`/token/${tokenId}`);
  };

  const handleCreateTokenClick = () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    navigate("/tokenize");
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-ip-blue-600/90 to-ip-purple-600/90 z-0"></div>
        <div className="absolute inset-0 grid-pattern opacity-20 z-0"></div>
        
        <div className="relative z-10 p-8 md:p-12 lg:p-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Decentralized IP Tokenization & Trading Platform
            </h1>
            <p className="text-white/90 text-lg mb-8">
              Revolutionize intellectual property management with blockchain technology. 
              Tokenize, trade, and track your IP assets on Algorand.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-ip-teal-500 hover:bg-ip-teal-600 text-white px-6 py-2 text-lg"
                onClick={handleCreateTokenClick}
              >
                Tokenize Your IP
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/marketplace")}
              >
                Explore Marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Tokens Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured IP Assets</h2>
          <Button 
            variant="ghost" 
            className="text-ip-purple-500 hover:text-ip-purple-600"
            onClick={() => navigate("/marketplace")}
          >
            View All
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTokens.map((token) => (
              <IPTokenCard
                key={token.id}
                token={token}
                onBuyClick={() => handleBuyClick(token.id)}
                onViewClick={() => handleViewClick(token.id)}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Platform Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Key Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-ip-blue-200/30">
            <CardHeader>
              <CardTitle className="text-ip-blue-600">IP Tokenization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80">
                Convert intellectual property into digital tokens on Algorand blockchain, 
                enabling fractional ownership and easy transfers.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-ip-purple-200/30">
            <CardHeader>
              <CardTitle className="text-ip-purple-600">Fractional Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80">
                Divide ownership of valuable IP assets into smaller shares, 
                making investment accessible to more participants.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-ip-teal-200/30">
            <CardHeader>
              <CardTitle className="text-ip-teal-600">Automated Royalties</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80">
                Smart contracts automatically distribute royalty payments to all token holders 
                based on their ownership percentage.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-ip-blue-200/30">
            <CardHeader>
              <CardTitle className="text-ip-blue-600">Secure Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80">
                Trade IP tokens in a decentralized marketplace with transparent pricing, 
                verifiable ownership, and instant settlements.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-ip-purple-200/30">
            <CardHeader>
              <CardTitle className="text-ip-purple-600">Multi-Signature Governance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80">
                Collaborative decision-making through on-chain voting mechanisms,
                ensuring all stakeholders have a voice.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-ip-teal-200/30">
            <CardHeader>
              <CardTitle className="text-ip-teal-600">Consent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80">
                Smart contracts enforce consent requirements for transfers and license grants,
                protecting all stakeholders' rights.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Get Started Section */}
      <section className="rounded-xl bg-gradient-to-r from-ip-blue-500 to-ip-purple-500 p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Ready to Tokenize Your IP?</h2>
            <p className="text-white/90">
              Get started with our simple process to create and manage your intellectual property tokens.
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              className="bg-white text-ip-purple-600 hover:bg-gray-100"
              onClick={handleCreateTokenClick}
            >
              Tokenize Now
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate("/learn")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
