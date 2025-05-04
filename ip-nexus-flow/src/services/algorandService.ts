
import { IPToken, MarketplaceListing, TokenizationFormData } from "@/types";

// Mock data generator functions
const generateMockIPTokens = (): IPToken[] => {
  const ipTypes = ['patent', 'copyright', 'trademark', 'trade_secret'] as const;
  const mockTokens: IPToken[] = [];
  
  for (let i = 1; i <= 8; i++) {
    const ipType = ipTypes[Math.floor(Math.random() * ipTypes.length)];
    mockTokens.push({
      id: `token-${i}`,
      name: `IP Token ${i}`,
      description: `This is a tokenized ${ipType} asset representing intellectual property.`,
      assetId: 10000000 + i,
      creator: `ALGO${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      totalSupply: 1000000,
      availableSupply: Math.floor(Math.random() * 1000000),
      price: parseFloat((Math.random() * 100).toFixed(2)),
      royaltyPercentage: parseFloat((Math.random() * 10).toFixed(2)),
      ipType: ipType,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      imageUrl: i % 3 === 0 ? undefined : `https://picsum.photos/seed/${i}/400/300`,
      metadata: {
        registrationNumber: `REG-${Math.floor(Math.random() * 10000)}`,
        expirationDate: new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
        jurisdiction: ['US', 'EU', 'Global'][Math.floor(Math.random() * 3)]
      },
      owners: [
        {
          address: `ALGO${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          share: 0.6
        },
        {
          address: `ALGO${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          share: 0.4
        }
      ]
    });
  }
  
  return mockTokens;
};

const generateMockListings = (tokens: IPToken[]): MarketplaceListing[] => {
  const mockListings: MarketplaceListing[] = [];
  
  tokens.forEach((token, index) => {
    if (index % 2 === 0) { // Only create listings for some tokens
      mockListings.push({
        id: `listing-${index}`,
        tokenId: token.id,
        seller: token.owners ? token.owners[0].address : token.creator,
        amount: Math.floor(token.totalSupply * 0.1), // 10% of total supply
        pricePerUnit: token.price * 1.1, // 10% markup
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    }
  });
  
  return mockListings;
};

// Initialize our mock data
const mockTokens = generateMockIPTokens();
const mockListings = generateMockListings(mockTokens);

// API for our mock Algorand service
export const algorandService = {
  // Mock function to fetch IP tokens
  getIPTokens: async (): Promise<IPToken[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTokens);
      }, 500); // Simulate network delay
    });
  },
  
  // Mock function to fetch a single IP token
  getIPToken: async (id: string): Promise<IPToken | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTokens.find(token => token.id === id));
      }, 300);
    });
  },
  
  // Mock function to fetch marketplace listings
  getMarketListings: async (): Promise<MarketplaceListing[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockListings);
      }, 500);
    });
  },
  
  // Mock function to create a new IP token
  createIPToken: async (formData: TokenizationFormData): Promise<IPToken> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newToken: IPToken = {
          id: `token-${mockTokens.length + 1}`,
          assetId: 10000000 + mockTokens.length + 1,
          creator: `ALGO${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          availableSupply: formData.totalSupply,
          createdAt: new Date(),
          ...formData
        };
        
        mockTokens.push(newToken);
        resolve(newToken);
      }, 1000);
    });
  },
  
  // Mock function to buy a token
  buyToken: async (listingId: string, amount: number, buyer: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const listing = mockListings.find(l => l.id === listingId);
        if (listing && listing.amount >= amount) {
          listing.amount -= amount;
          if (listing.amount === 0) {
            listing.status = 'sold';
          }
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  }
};
