import algosdk from 'algosdk';
import { IPToken, TokenizationFormData } from '@/types';

// Algorand node configuration for LocalNet
const algodClient = new algosdk.Algodv2(
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'http://localhost',
  4001
);

// Contract configuration
const CONTRACT_ID = process.env.REACT_APP_CONTRACT_ID || '';

export class AlgorandIntegration {
  private client: algosdk.Algodv2;

  constructor() {
    this.client = algodClient;
  }

  // Initialize connection with the Algorand network
  async initialize() {
    try {
      const status = await this.client.status().do();
      console.log('Connected to Algorand network:', status);
      return true;
    } catch (error) {
      console.error('Failed to connect to Algorand network:', error);
      return false;
    }
  }

  // Create a new IP token
  async createIPToken(formData: TokenizationFormData, creatorAccount: algosdk.Account): Promise<IPToken> {
    try {
      // Get suggested parameters
      const params = await this.client.getTransactionParams().do();

      // Create asset creation transaction
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: creatorAccount.addr,
        total: formData.totalSupply,
        decimals: 0,
        defaultFrozen: false,
        manager: creatorAccount.addr,
        reserve: creatorAccount.addr,
        freeze: creatorAccount.addr,
        clawback: creatorAccount.addr,
        unitName: formData.symbol || 'IP',
        assetName: formData.name,
        assetURL: formData.imageUrl,
        note: new TextEncoder().encode(JSON.stringify({
          description: formData.description,
          ipType: formData.ipType,
          royaltyPercentage: formData.royaltyPercentage,
          metadata: formData.metadata
        })),
        suggestedParams: params
      });

      // Sign transaction
      const signedTxn = txn.signTxn(creatorAccount.sk);

      // Submit transaction
      const { txId } = await this.client.sendRawTransaction(signedTxn).do();

      // Wait for confirmation
      const result = await algosdk.waitForConfirmation(this.client, txId, 4);

      // Get the asset ID
      const assetId = result['asset-index'];

      // Create the IPToken object
      const newToken: IPToken = {
        id: assetId.toString(),
        assetId,
        name: formData.name,
        description: formData.description,
        creator: creatorAccount.addr,
        totalSupply: formData.totalSupply,
        availableSupply: formData.totalSupply,
        price: formData.price || 0,
        royaltyPercentage: formData.royaltyPercentage,
        ipType: formData.ipType,
        createdAt: new Date(),
        imageUrl: formData.imageUrl,
        metadata: formData.metadata,
        owners: [{
          address: creatorAccount.addr,
          share: 1
        }]
      };

      return newToken;
    } catch (error) {
      console.error('Failed to create IP token:', error);
      throw error;
    }
  }

  // Buy IP token fractions
  async buyIPFraction(
    tokenId: number,
    amount: number,
    price: number,
    buyerAccount: algosdk.Account
  ): Promise<boolean> {
    try {
      const params = await this.client.getTransactionParams().do();

      // Create opt-in transaction if needed
      const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: buyerAccount.addr,
        to: buyerAccount.addr,
        amount: 0,
        assetIndex: tokenId,
        suggestedParams: params
      });

      // Create payment transaction
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: buyerAccount.addr,
        to: CONTRACT_ID,
        amount: price * amount,
        suggestedParams: params
      });

      // Sign transactions
      const signedOptInTxn = optInTxn.signTxn(buyerAccount.sk);
      const signedPaymentTxn = paymentTxn.signTxn(buyerAccount.sk);

      // Submit transactions
      await this.client.sendRawTransaction([signedOptInTxn, signedPaymentTxn]).do();

      return true;
    } catch (error) {
      console.error('Failed to buy IP fraction:', error);
      return false;
    }
  }

  // Get IP token information
  async getIPToken(assetId: number): Promise<IPToken | null> {
    try {
      const assetInfo = await this.client.getAssetByID(assetId).do();

      // Parse metadata from the asset URL or note field
      const metadata = assetInfo.params.url ? JSON.parse(assetInfo.params.url) : {};

      const token: IPToken = {
        id: assetId.toString(),
        assetId,
        name: assetInfo.params.name,
        description: metadata.description || '',
        creator: assetInfo.params.creator,
        totalSupply: assetInfo.params.total,
        availableSupply: assetInfo.params.total - (assetInfo.params['circulating-supply'] || 0),
        price: metadata.price || 0,
        royaltyPercentage: metadata.royaltyPercentage || 0,
        ipType: metadata.ipType || 'unknown',
        createdAt: new Date(assetInfo.params['created-at-round']),
        imageUrl: metadata.imageUrl,
        metadata: metadata,
        owners: [{
          address: assetInfo.params.creator,
          share: 1
        }]
      };

      return token;
    } catch (error) {
      console.error('Failed to get IP token:', error);
      return null;
    }
  }
}

export const algorandIntegration = new AlgorandIntegration();
