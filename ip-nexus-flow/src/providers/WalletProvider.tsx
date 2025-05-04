import { PropsWithChildren, useEffect, useState } from 'react';
import { PROVIDER_ID, WalletProvider as UseWalletProvider } from '@txnlab/use-wallet-react';
import { PeraWalletConnect } from '@perawallet/connect';
import { DeflyWalletConnect } from '@blockshake/defly-connect';
import algosdk from 'algosdk';

// Polyfill for 'global' object that WalletConnect expects in browser environment
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.global = window;
}

// Create Algorand client
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = '';
const algodToken = '';
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Create wallet connection instances
const pera = new PeraWalletConnect();
const defly = new DeflyWalletConnect();

// Define wallet providers for @txnlab/use-wallet-react
// Use the providers property instead of wallets for v4 compatibility
const providers = [
  { id: 'pera', name: 'Pera Wallet', metadata: { icon: 'https://perawallet.app/favicon.ico', name: 'Pera' }, connector: pera },
  { id: 'defly', name: 'Defly Wallet', metadata: { icon: 'https://defly.app/favicon.ico', name: 'Defly' }, connector: defly }
];

export function WalletProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for document to be fully loaded
    if (document.readyState === 'complete') {
      setIsReady(true);
    } else {
      window.addEventListener('load', () => setIsReady(true));
      return () => window.removeEventListener('load', () => setIsReady(true));
    }
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <UseWalletProvider
      providers={providers}
      nodeConfig={{
        network: 'testnet',
        nodeServer: algodServer,
        nodeToken: algodToken,
        nodePort: algodPort,
        nodeTLS: true
      }}
      algosdkStatic={algosdk}
    >
      {children}
    </UseWalletProvider>
  );
}
