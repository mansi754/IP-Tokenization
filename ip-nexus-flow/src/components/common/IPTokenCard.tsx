
import { IPToken } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface IPTokenCardProps {
  token: IPToken;
  showActions?: boolean;
  onBuyClick?: () => void;
  onViewClick?: () => void;
}

export const IPTokenCard = ({ token, showActions = true, onBuyClick, onViewClick }: IPTokenCardProps) => {
  const ipTypeBadgeColors = {
    patent: "bg-blue-100 text-blue-800",
    copyright: "bg-purple-100 text-purple-800",
    trademark: "bg-green-100 text-green-800",
    trade_secret: "bg-amber-100 text-amber-800",
  };

  const owners = token.owners || [];
  const pieData = owners.length > 0 
    ? owners.map(owner => ({ name: owner.address.substring(0, 6) + '...', value: owner.share }))
    : [{ name: 'Creator', value: 1 }];
  
  const COLORS = ['#3D62F5', '#9B5CF6', '#2CC9C0', '#5C7CFF', '#AB74FD'];

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-ip-purple-200/30 hover:border-ip-purple-400/50">
      {token.imageUrl ? (
        <div className="h-48 overflow-hidden">
          <img 
            src={token.imageUrl} 
            alt={token.name} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-ip-blue-200/20 to-ip-purple-200/20 flex items-center justify-center">
          <div className="text-4xl font-bold text-ip-purple-300">{token.name.charAt(0)}</div>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{token.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {token.description}
            </CardDescription>
          </div>
          <Badge className={ipTypeBadgeColors[token.ipType]}>
            {token.ipType.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm">
            <div className="text-muted-foreground">Price</div>
            <div className="font-medium">{token.price} ALGO</div>
          </div>
          <div className="text-sm">
            <div className="text-muted-foreground">Royalty</div>
            <div className="font-medium">{token.royaltyPercentage}%</div>
          </div>
        </div>
        
        {owners.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-2">Ownership Distribution</div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name }) => name}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-0 flex justify-between gap-2">
          <Button 
            variant="outline" 
            className="w-1/2 border-ip-blue-400/50 text-ip-blue-600 hover:bg-ip-blue-50"
            onClick={onViewClick}
          >
            Details
          </Button>
          <Button 
            className="w-1/2 bg-ip-purple-500 hover:bg-ip-purple-600"
            onClick={onBuyClick}
          >
            Trade
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default IPTokenCard;
