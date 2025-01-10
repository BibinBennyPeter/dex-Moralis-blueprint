import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism, sepolia } from 'wagmi/chains'
import { injected, metaMask, safe } from 'wagmi/connectors'


export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})