
export interface IPToken {
  id: string;
  name: string;
  description: string;
  assetId?: number;
  creator: string;
  totalSupply: number;
  availableSupply: number;
  price: number;
  royaltyPercentage: number;
  ipType: 'patent' | 'copyright' | 'trademark' | 'trade_secret';
  createdAt: Date;
  imageUrl?: string;
  metadata: {
    [key: string]: any;
  };
  owners?: {
    address: string;
    share: number;
  }[];
}

export interface User {
  address: string;
  balance: number;
  tokens: UserToken[];
}

export interface UserToken {
  tokenId: string;
  amount: number;
  share: number;
}

export interface MarketplaceListing {
  id: string;
  tokenId: string;
  seller: string;
  amount: number;
  pricePerUnit: number;
  createdAt: Date;
  expiresAt?: Date;
  status: 'active' | 'sold' | 'expired' | 'cancelled';
}

export interface TokenizationFormData {
  name: string;
  description: string;
  ipType: 'patent' | 'copyright' | 'trademark' | 'trade_secret';
  totalSupply: number;
  royaltyPercentage: number;
  price: number;
  metadata: {
    [key: string]: any;
  };
}

export interface AlgorandState {
  connected: boolean;
  address: string | null;
  loading: boolean;
  error: string | null;
}
