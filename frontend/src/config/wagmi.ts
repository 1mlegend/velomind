import { http, createConfig } from 'wagmi';
import { hardhat, base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const useHardhat = import.meta.env.DEV && import.meta.env.VITE_NETWORK !== 'base';

export const config = createConfig({
  chains: useHardhat ? [hardhat] : [base],
  connectors: [
    injected(),
  ],
  transports: {
    ...(useHardhat
      ? { [hardhat.id]: http('http://127.0.0.1:8545') }
      : { [base.id]: http() }),
  },
});
