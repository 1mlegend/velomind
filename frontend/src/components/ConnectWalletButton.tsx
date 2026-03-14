import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { LogOut, Wallet } from 'lucide-react';

const ConnectWalletButton = ({ variant = 'default' }: { variant?: 'default' | 'sidebar' }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  if (variant === 'sidebar') {
    return (
      <div className="glass rounded-xl p-4 gradient-border">
        {isConnected ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">0x</span>
              </div>
              <div>
                <p className="text-foreground text-xs font-medium">{truncatedAddress}</p>
                <p className="text-muted-foreground text-[10px]">BNB Chain</p>
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
            onClick={() => connect({ connector: connectors[0] })}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:shadow-[0_0_20px_hsl(45_93%_50%/0.3)] transition-all duration-300"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        )}
      </div>
    );
  }

  if (isConnected) {
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
      onClick={() => connect({ connector: connectors[0] })}
      className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:shadow-[0_0_20px_hsl(45_93%_50%/0.3)] transition-all duration-300 flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
};

export default ConnectWalletButton;
