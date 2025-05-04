
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlgorand } from '@/hooks/useAlgorand';
import { useSmartContract } from '@/hooks/useSmartContract';
import { algorandService } from '@/services/algorandService';
import { IPToken } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const TokenDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connected, address } = useAlgorand();
  const [token, setToken] = useState<IPToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [listingPrice, setListingPrice] = useState<string>('');
  const [royaltyAmount, setRoyaltyAmount] = useState<string>('');
  
  // Use our smart contract hook
  const { 
    contractData, 
    fetchContractData, 
    updateMetadata, 
    listForSale, 
    purchaseToken,
    payRoyalty,
    loading: contractLoading,
    isOwner
  } = useSmartContract(id);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const fetchedToken = await algorandService.getIPToken(id);
        
        if (fetchedToken) {
          setToken(fetchedToken);
          // Also fetch contract data
          fetchContractData();
        } else {
          toast.error("Token not found");
          navigate('/marketplace');
        }
      } catch (error) {
        console.error("Error loading token:", error);
        toast.error("Failed to load token details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, fetchContractData]);

  const handleListForSale = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    const price = parseFloat(listingPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    
    const result = await listForSale(price);
    if (result.success) {
      setListingPrice('');
    }
  };

  const handlePurchase = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!contractData.salePrice) {
      toast.error("This token is not listed for sale");
      return;
    }
    
    const result = await purchaseToken(contractData.salePrice);
    if (result.success) {
      // Refresh token data
      const updatedToken = await algorandService.getIPToken(id!);
      if (updatedToken) {
        setToken(updatedToken);
      }
    }
  };

  const handlePayRoyalty = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    const amount = parseFloat(royaltyAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const result = await payRoyalty(amount);
    if (result.success) {
      setRoyaltyAmount('');
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Token Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested token could not be found.</p>
        <Button onClick={() => navigate('/marketplace')}>Return to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          ← Back
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-1">{token.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-ip-purple-100 text-ip-purple-800">
                {token.ipType.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="border-ip-blue-400/50 text-ip-blue-600">
                ASA #{token.assetId || 'Pending'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {token.createdAt.toLocaleDateString()} by {token.creator.substring(0, 6)}...
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{token.price} ALGO</div>
            <div className="text-sm text-muted-foreground">
              Royalty: {token.royaltyPercentage}%
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {token.imageUrl && (
                <div className="overflow-hidden rounded-md border border-border">
                  <img 
                    src={token.imageUrl} 
                    alt={token.name} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {token.description}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Metadata</h3>
                <div className="bg-muted/50 p-3 rounded-md overflow-x-auto text-sm">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(token.metadata, null, 2)}</pre>
                </div>
                {contractData.metadata && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    IPFS Hash: {contractData.metadata}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Total Supply</h3>
                  <p className="text-lg">{token.totalSupply.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Available</h3>
                  <p className="text-lg">{token.availableSupply.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Smart Contract</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contractLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ) : (
                <>
                  {!connected ? (
                    <div className="text-center py-3">
                      <p className="text-sm text-muted-foreground mb-3">
                        Connect your wallet to interact with this asset
                      </p>
                      <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Owner</div>
                        <div className="font-medium">
                          {contractData.owner?.substring(0, 8)}...
                          {isOwner && <Badge className="ml-2 bg-green-100 text-green-800">You</Badge>}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Royalty Rate</div>
                        <div className="font-medium">{contractData.royaltyPercentage || token.royaltyPercentage}%</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Sale Status</div>
                        <div className="font-medium">
                          {contractData.salePrice ? (
                            <Badge className="bg-green-100 text-green-800">Listed for {contractData.salePrice} ALGO</Badge>
                          ) : (
                            <Badge variant="outline">Not listed</Badge>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Actions */}
                      <div className="space-y-3 pt-2">
                        {isOwner ? (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="w-full">List for Sale</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>List Asset for Sale</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Price (ALGO)</label>
                                    <Input
                                      type="number"
                                      placeholder="Enter price in ALGO"
                                      value={listingPrice}
                                      onChange={(e) => setListingPrice(e.target.value)}
                                    />
                                  </div>
                                  <Button 
                                    className="w-full" 
                                    onClick={handleListForSale}
                                    disabled={!listingPrice}
                                  >
                                    Confirm Listing
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        ) : (
                          <>
                            {contractData.salePrice ? (
                              <Button
                                className="w-full bg-ip-purple-500 hover:bg-ip-purple-600"
                                onClick={handlePurchase}
                              >
                                Buy for {contractData.salePrice} ALGO
                              </Button>
                            ) : (
                              <Button
                                className="w-full"
                                disabled
                              >
                                Not for sale
                              </Button>
                            )}
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">Pay Royalty</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Pay Royalty to Creator</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount (ALGO)</label>
                                    <Input
                                      type="number"
                                      placeholder="Enter amount in ALGO"
                                      value={royaltyAmount}
                                      onChange={(e) => setRoyaltyAmount(e.target.value)}
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Royalty rate: {contractData.royaltyPercentage || token.royaltyPercentage}%
                                  </div>
                                  <Button 
                                    className="w-full" 
                                    onClick={handlePayRoyalty}
                                    disabled={!royaltyAmount}
                                  >
                                    Submit Payment
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenDetails;
