
import { useState } from 'react';
import { smartContractService } from '@/services/smartContractService';
import { toast } from 'sonner';
import { useAlgorand } from './useAlgorand';

export const useSmartContract = (tokenId?: string) => {
  const [loading, setLoading] = useState(false);
  const [contractData, setContractData] = useState<{
    metadata?: string;
    royaltyPercentage?: number;
    owner?: string;
    salePrice?: number;
  }>({});
  
  const { connected, address } = useAlgorand();

  const fetchContractData = async () => {
    if (!tokenId) return;
    
    try {
      setLoading(true);
      const data = await smartContractService.getContractData(tokenId);
      setContractData(data);
      return data;
    } catch (error) {
      console.error("Error fetching contract data:", error);
      toast.error("Failed to fetch contract data");
    } finally {
      setLoading(false);
    }
  };

  const updateMetadata = async (newIpfsHash: string) => {
    if (!connected || !address || !tokenId) {
      toast.error("Please connect your wallet first");
      return { success: false };
    }
    
    try {
      setLoading(true);
      const result = await smartContractService.updateMetadata(tokenId, newIpfsHash, address);
      
      if (result.success) {
        toast.success("Metadata updated successfully", {
          description: `Transaction ID: ${result.txId?.substring(0, 8)}...`,
        });
        
        // Refresh contract data
        await fetchContractData();
      }
      
      return result;
    } catch (error) {
      console.error("Error updating metadata:", error);
      toast.error("Failed to update metadata");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const listForSale = async (price: number) => {
    if (!connected || !address || !tokenId) {
      toast.error("Please connect your wallet first");
      return { success: false };
    }
    
    try {
      setLoading(true);
      const result = await smartContractService.listForSale(tokenId, price, address);
      
      if (result.success) {
        toast.success("Asset listed for sale", {
          description: `Listed at ${price} ALGO`,
        });
        
        // Refresh contract data
        await fetchContractData();
      }
      
      return result;
    } catch (error) {
      console.error("Error listing for sale:", error);
      toast.error("Failed to list asset for sale");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const purchaseToken = async (price: number) => {
    if (!connected || !address || !tokenId) {
      toast.error("Please connect your wallet first");
      return { success: false };
    }
    
    try {
      setLoading(true);
      const result = await smartContractService.purchaseToken(tokenId, price, address);
      
      if (result.success) {
        toast.success("Purchase successful!", {
          description: `You now own this IP asset`,
        });
        
        // Refresh contract data
        await fetchContractData();
      }
      
      return result;
    } catch (error) {
      console.error("Error purchasing token:", error);
      toast.error("Failed to purchase token");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const payRoyalty = async (amount: number) => {
    if (!connected || !address || !tokenId) {
      toast.error("Please connect your wallet first");
      return { success: false };
    }
    
    try {
      setLoading(true);
      const result = await smartContractService.payRoyalty(tokenId, amount, address);
      
      if (result.success) {
        toast.success("Royalty payment successful", {
          description: `Paid ${result.royaltyPaid?.toFixed(2)} ALGO in royalties`,
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error paying royalty:", error);
      toast.error("Failed to pay royalty");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    contractData,
    fetchContractData,
    updateMetadata,
    listForSale,
    purchaseToken,
    payRoyalty,
    isOwner: contractData.owner === address,
  };
};
