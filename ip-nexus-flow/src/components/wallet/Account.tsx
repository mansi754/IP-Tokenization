
import { useWallet } from '@txnlab/use-wallet-react';
import { formatAddress } from '@/lib/utils';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

const Account = () => {
  const { activeAddress } = useWallet();

  const handleCopy = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      toast.success('Address copied to clipboard');
    }
  };

  if (!activeAddress) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 bg-muted rounded-lg">
      <div className="text-sm text-muted-foreground">Connected wallet:</div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{formatAddress(activeAddress)}</span>
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Account;
