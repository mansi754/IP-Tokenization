
import { useState, useEffect } from "react";
import { IPToken, MarketplaceListing } from "@/types";
import { algorandService } from "@/services/algorandService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAlgorand } from "@/hooks/useAlgorand";
import { useNavigate } from "react-router-dom";
import IPTokenCard from "@/components/common/IPTokenCard";

export const Marketplace = () => {
  const [tokens, setTokens] = useState<IPToken[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<IPToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ipTypeFilter, setIpTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  
  const { connected } = useAlgorand();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedTokens = await algorandService.getIPTokens();
        const fetchedListings = await algorandService.getMarketListings();
        
        setTokens(fetchedTokens);
        setListings(fetchedListings);
        setFilteredTokens(fetchedTokens);
        
      } catch (error) {
        console.error("Error loading marketplace data:", error);
        toast.error("Failed to load marketplace data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...tokens];
    
    // Apply IP type filter
    if (ipTypeFilter !== "all") {
      result = result.filter(token => token.ipType === ipTypeFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(token => 
        token.name.toLowerCase().includes(searchLower) || 
        token.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    
    setFilteredTokens(result);
  }, [tokens, ipTypeFilter, searchTerm, sortBy]);

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

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">IP Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and trade tokenized intellectual property assets.
          </p>
        </div>
        
        <Button
          onClick={() => navigate("/tokenize")}
          className="mt-4 md:mt-0 bg-ip-purple-500 hover:bg-ip-purple-600"
        >
          Tokenize New IP
        </Button>
      </div>
      
      {/* Filters and Search */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <Input
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Select value={ipTypeFilter} onValueChange={setIpTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by IP type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="patent">Patents</SelectItem>
                  <SelectItem value="copyright">Copyrights</SelectItem>
                  <SelectItem value="trademark">Trademarks</SelectItem>
                  <SelectItem value="trade_secret">Trade Secrets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-muted-foreground">
          Showing {filteredTokens.length} of {tokens.length} assets
        </div>
        <div className="flex gap-2">
          {ipTypeFilter !== "all" && (
            <Badge 
              className="bg-ip-purple-100 text-ip-purple-800 hover:bg-ip-purple-200 cursor-pointer"
              onClick={() => setIpTypeFilter("all")}
            >
              {ipTypeFilter.replace("_", " ")} ×
            </Badge>
          )}
          {searchTerm && (
            <Badge 
              className="bg-ip-blue-100 text-ip-blue-800 hover:bg-ip-blue-200 cursor-pointer"
              onClick={() => setSearchTerm("")}
            >
              "{searchTerm}" ×
            </Badge>
          )}
        </div>
      </div>
      
      {/* Tokens Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted"></div>
              <CardContent className="p-4">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokens.map((token) => (
            <IPTokenCard
              key={token.id}
              token={token}
              onBuyClick={() => handleBuyClick(token.id)}
              onViewClick={() => handleViewClick(token.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2">No IP assets found</h3>
          <p className="text-muted-foreground mb-6">
            No intellectual property assets match your current filters.
          </p>
          <Button 
            onClick={() => {
              setSearchTerm("");
              setIpTypeFilter("all");
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
