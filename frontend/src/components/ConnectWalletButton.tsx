import { useWallet } from '@solana/wallet-adapter-react';
import { LogOut, Wallet } from 'lucide-react';

const ConnectWalletButton = ({ variant = 'default' }: { variant?: 'default' | 'sidebar' }) => {
  const { publicKey, connected, select, connect, disconnect, wallets } = useWallet();

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : '';

  const handleConnect = async () => {
    if (wallets.length > 0) {
      select(wallets[0].adapter.name);
      try { await connect(); } catch (e) { /* user rejected */ }
    }
  };

  if (variant === 'sidebar') {
    return (
      <div className="glass rounded-xl p-4 gradient-border">
        {connected && publicKey ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">SOL</span>
              </div>
              <div>
                <p className="text-foreground text-xs font-medium">{truncatedAddress}</p>
                <p className="text-muted-foreground text-[10px]">Solana</p>
              </div>
            </div>
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive text-xs transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:shadow-[0_0_20px_hsl(267_100%_64%/0.3)] transition-all duration-300"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        )}
      </div>
    );
  }

  if (connected && publicKey) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-border/30 text-foreground text-sm hover:border-primary/40 transition-all duration-300"
      >
        <span className="w-2 h-2 rounded-full bg-primary dot-pulse" />
        {truncatedAddress}
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:shadow-[0_0_20px_hsl(267_100%_64%/0.3)] transition-all duration-300 flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
};

export default ConnectWalletButton;
