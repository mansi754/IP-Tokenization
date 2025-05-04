import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format an Algorand address for display
 * @param address The full Algorand address
 * @returns Shortened address (e.g., "ALGO123...ABC")
 */
export const formatAddress = (address: string | null): string => {
  if (!address) return '';
  if (address.length <= 10) return address;
  
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
