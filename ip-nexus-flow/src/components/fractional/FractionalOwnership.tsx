
import { useState, useEffect } from "react";
import { useAlgorand } from "@/hooks/useAlgorand";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from "sonner";
import { algorandService } from "@/services/algorandService";
import { IPToken } from "@/types";
import { useNavigate } from "react-router-dom";

export const FractionalOwnership = () => {
  const [userTokens, setUserTokens] = useState<IPToken[]>([]);
  const [loading, setLoading] = useState(true);
  const { connected, address } = useAlgorand();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!connected || !address) return;
      
      try {
        setLoading(true);
        // In a real app, we would fetch tokens owned by the current user
        // Here we'll just use a subset of all tokens as a mockup
        const allTokens = await algorandService.getIPTokens();
        const userOwnedTokens = allTokens.slice(0, 3); // Mock: user owns first 3 tokens
        setUserTokens(userOwnedTokens);
      } catch (error) {
        console.error("Error loading user tokens:", error);
        toast.error("Failed to load your token portfolio");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTokens();
  }, [connected, address]);

  if (!connected) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-16">
        <Alert className="bg-muted border-muted-foreground/30 mb-6">
          <AlertTitle className="text-lg font-semibold">Connect your wallet</AlertTitle>
          <AlertDescription>
            Please connect your Algorand wallet to view your fractional ownership portfolio.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate("/")}
            className="bg-ip-purple-500 hover:bg-ip-purple-600"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My IP Portfolio</h1>
      <p className="text-muted-foreground mb-8">
        Manage your fractional IP ownership and track your investments.
      </p>
      
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded w-full mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : userTokens.length > 0 ? (
        <div className="space-y-8">
          {/* Portfolio Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Asset Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userTokens.map(token => ({
                            name: token.name,
                            value: token.price * (token.owners?.find(o => o.address === address)?.share || 0) * token.totalSupply
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name }) => name}
                        >
                          {userTokens.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                "#3D62F5", "#9B5CF6", "#2CC9C0", "#5C7CFF", "#AB74FD"
                              ][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) + ' ALGO' : value, 'Value']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Portfolio Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-muted-foreground text-sm">Total Assets</div>
                        <div className="text-2xl font-bold">{userTokens.length}</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-muted-foreground text-sm">Total Value</div>
                        <div className="text-2xl font-bold">
                          {userTokens.reduce((sum, token) => {
                            const userShare = token.owners?.find(o => o.address === address)?.share || 0;
                            return sum + (token.price * userShare * token.totalSupply);
                          }, 0).toFixed(2)} ALGO
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-muted-foreground text-sm">Patents</div>
                        <div className="text-2xl font-bold">
                          {userTokens.filter(t => t.ipType === 'patent').length}
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-muted-foreground text-sm">Copyrights</div>
                        <div className="text-2xl font-bold">
                          {userTokens.filter(t => t.ipType === 'copyright').length}
                        </div>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recent Revenue</h3>
                    <Card className="p-4">
                      <div className="text-muted-foreground text-sm mb-1">Last 30 Days Royalties</div>
                      <div className="text-2xl font-bold mb-2">12.45 ALGO</div>
                      <Progress value={65} className="h-2 mb-1" />
                      <div className="text-xs text-muted-foreground">65% increase from previous period</div>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Owned Assets */}
          <div>
            <h2 className="text-2xl font-bold mb-6">My IP Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTokens.map((token) => (
                <Card key={token.id} className="overflow-hidden">
                  {token.imageUrl && (
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={token.imageUrl} 
                        alt={token.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{token.name}</h3>
                      <div className="text-xs bg-ip-purple-100 text-ip-purple-800 px-2 py-1 rounded-full">
                        {token.ipType.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Your Share</div>
                        <div className="font-medium">
                          {token.owners?.find(o => o.address === address)?.share 
                            ? `${(token.owners?.find(o => o.address === address)?.share || 0) * 100}%` 
                            : "0%"
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Value</div>
                        <div className="font-medium">
                          {(token.price * (token.owners?.find(o => o.address === address)?.share || 0) * token.totalSupply).toFixed(2)} ALGO
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs border-ip-blue-400/50 text-ip-blue-600"
                        onClick={() => navigate(`/token/${token.id}`)}
                      >
                        Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full text-xs bg-ip-purple-500 hover:bg-ip-purple-600"
                        onClick={() => navigate(`/marketplace/${token.id}`)}
                      >
                        Trade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2">No IP assets in your portfolio</h3>
          <p className="text-muted-foreground mb-6">
            You don't own any IP tokens yet. Start by exploring the marketplace.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate("/marketplace")}
              className="bg-ip-purple-500 hover:bg-ip-purple-600"
            >
              Explore Marketplace
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/tokenize")}
            >
              Tokenize New IP
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FractionalOwnership;
