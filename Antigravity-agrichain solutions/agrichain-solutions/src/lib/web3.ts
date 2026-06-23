import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';

export const config = createConfig({
  chains: [mainnet, sepolia, polygonAmoy],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

export const queryClient = new QueryClient();
