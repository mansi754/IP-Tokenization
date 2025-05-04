import { useWallet } from '@txnlab/use-wallet-react';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function WalletConnection() {
  const { providers, activeAccount, isReady } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (activeAccount) {
      setIsOpen(false);
    }
  }, [activeAccount]);

  if (!isReady) {
    return <Button disabled>Loading...</Button>;
  }

  if (activeAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Wallet</CardTitle>
          <CardDescription>
            {activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => providers[0]?.disconnect()}>
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {providers.map((provider) => (
            <Button
              key={provider.metadata.id}
              onClick={() => provider.connect()}
              className="w-full"
            >
              <img
                src={provider.metadata.icon}
                alt={provider.metadata.name}
                className="w-6 h-6 mr-2"
              />
              {provider.metadata.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
