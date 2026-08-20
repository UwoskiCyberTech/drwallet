import '../utils/telemetryFilter';
import { http, fallback, createConfig } from 'wagmi';
// @ts-ignore
import { 
  mainnet, 
  polygon, 
  arbitrum, 
  optimism, 
  bsc, 
  avalanche, 
  fantom, 
  celo, 
  base, 
  linea, 
  scroll 
} from 'viem/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

// Get Alchemy API key from environment
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';

const rpcTransports = {
  [mainnet.id]: fallback([
    ...(alchemyKey ? [http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`)] : []),
    http('https://ethereum-rpc.publicnode.com'),
    http('https://1rpc.io/eth'),
  ]),
  [polygon.id]: fallback([
    ...(alchemyKey ? [http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`)] : []),
    http('https://polygon-bor-rpc.publicnode.com'),
  ]),
  [arbitrum.id]: fallback([
    ...(alchemyKey ? [http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`)] : []),
    http('https://arb1.arbitrum.io/rpc'),
    http('https://arbitrum-one-rpc.publicnode.com'),
  ]),
  [optimism.id]: fallback([
    ...(alchemyKey ? [http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`)] : []),
    http('https://mainnet.optimism.io'),
    http('https://optimism-rpc.publicnode.com'),
  ]),
  [bsc.id]: fallback([
    http('https://bsc-dataseed.binance.org'),
    http('https://bsc-dataseed1.defibit.io'),
    http('https://bsc-rpc.publicnode.com'),
  ]),
  [avalanche.id]: fallback([
    http('https://api.avax.network/ext/bc/C/rpc'),
    http('https://avalanche-c-chain-rpc.publicnode.com'),
  ]),
  [fantom.id]: fallback([
    http('https://fantom-rpc.publicnode.com'),
    http('https://rpc.ftm.tools'),
  ]),
  [celo.id]: fallback([
    http('https://forno.celo.org'),
    http('https://celo-rpc.publicnode.com'),
  ]),
  [base.id]: fallback([
    ...(alchemyKey ? [http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`)] : []),
    http('https://mainnet.base.org'),
    http('https://base-rpc.publicnode.com'),
  ]),
  [linea.id]: fallback([
    http('https://rpc.linea.build'),
    http('https://linea.blockpi.network/v1/rpc/public'),
    http('https://linea-rpc.publicnode.com'),
  ]),
  [scroll.id]: fallback([
    http('https://rpc.scroll.io'),
    http('https://scroll.blockpi.network/v1/rpc/public'),
    http('https://scroll-rpc.publicnode.com'),
  ]),
};

const getRuntimeAppUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://drwallet-web-rho.vercel.app';
};

const defaultAppUrl = getRuntimeAppUrl();
const defaultAppName = process.env.NEXT_PUBLIC_APP_NAME || 'ALM Risk Scanner';

// Get WalletConnect Project ID from environment
const rawProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.WALLETCONNECT_PROJECT_ID || '';
const placeholderValues = ['demo-project-id', 'your_walletconnect_project_id_here', 'your-walletconnect-project-id', 'your_walletconnect_project_id'];
const projectId = rawProjectId.trim();
const isWalletConnectEnabled = Boolean(
  projectId && !placeholderValues.includes(projectId.toLowerCase())
);

// Define supported chains
const chains = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  bsc,
  avalanche,
  fantom,
  celo,
  base,
  linea,
  scroll
] as const;

// Wallet info for UI display
export const WALLET_CONFIGS = {
  injected: {
    name: 'Browser Wallet',
    icon: '🦊',
    description: 'MetaMask, Trust Wallet, Brave, Rabby, etc.',
  },
  coinbase: {
    name: 'Coinbase Wallet',
    icon: '🔷',
    description: "Coinbase's web3 wallet",
  },
  walletConnect: {
    name: 'WalletConnect',
    icon: '🌐',
    description: 'Connect mobile and desktop wallets securely with QR code support.',
  },
};

// Create wagmi config with WalletConnect support
export const wagmiConfig = createConfig({
  ssr: true,
  chains,
  transports: rpcTransports,
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: defaultAppName,
      appLogoUrl: `${defaultAppUrl}/favicon.svg`,
      preference: 'eoaOnly',
    }),
    ...(isWalletConnectEnabled
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: defaultAppName,
              description: 'Connect your wallet to scan for ALM/AML risk and review direct transfer risk before approval.',
              url: defaultAppUrl,
              icons: [`${defaultAppUrl}/favicon.svg`],
              redirect: {
                native: 'almriskscanner://',
                universal: defaultAppUrl,
              },
            },
            showQrModal: true,
            qrModalOptions: {
              themeMode: 'dark',
            },
          }),
        ]
      : []),
  ],
});

export { chains, projectId, isWalletConnectEnabled };
