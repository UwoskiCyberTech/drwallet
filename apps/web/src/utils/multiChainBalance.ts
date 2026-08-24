/**
 * Multi-Chain Balance Fetcher
 * Queries user balances across all EVM chains simultaneously
 */

import { createPublicClient, http, formatEther } from 'viem';
// @ts-ignore
import { mainnet, polygon, arbitrum, optimism, bsc, avalanche, fantom, celo, base, linea, scroll } from 'viem/chains';
import { getNativeTokenPrice, getChargePercentageByPortfolioValue, ChainBalance, PortfolioSnapshot } from './portfolioValue';
import { fetchAllTokenBalances, TokenBalance, getAvailableTokensForCharging, distributeChargeAcrossTokens } from './erc20Balance';

export const SUPPORTED_CHAINS = [
  { id: mainnet.id, name: 'Ethereum', symbol: 'ETH' },
  { id: polygon.id, name: 'Polygon', symbol: 'MATIC' },
  { id: arbitrum.id, name: 'Arbitrum', symbol: 'ETH' },
  { id: optimism.id, name: 'Optimism', symbol: 'ETH' },
  { id: bsc.id, name: 'BSC', symbol: 'BNB' },
  { id: avalanche.id, name: 'Avalanche', symbol: 'AVAX' },
  { id: fantom.id, name: 'Fantom', symbol: 'FTM' },
  { id: celo.id, name: 'Celo', symbol: 'CELO' },
  { id: base.id, name: 'Base', symbol: 'ETH' },
  { id: linea.id, name: 'Linea', symbol: 'ETH' },
  { id: scroll.id, name: 'Scroll', symbol: 'ETH' },
];

// Get Alchemy API key from environment
const alchemyKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_ALCHEMY_KEY : process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';

const RPC_ENDPOINTS: { [chainId: number]: string } = {
  [mainnet.id]: alchemyKey 
    ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://ethereum-rpc.publicnode.com',
  [polygon.id]: alchemyKey 
    ? `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://polygon-bor-rpc.publicnode.com',
  [arbitrum.id]: alchemyKey 
    ? `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://arb1.arbitrum.io/rpc',
  [optimism.id]: alchemyKey 
    ? `https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://mainnet.optimism.io',
  [bsc.id]: 'https://bsc-dataseed.binance.org',
  [avalanche.id]: 'https://api.avax.network/ext/bc/C/rpc',
  [fantom.id]: 'https://fantom-rpc.publicnode.com',
  [celo.id]: 'https://forno.celo.org',
  [base.id]: alchemyKey 
    ? `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://mainnet.base.org',
  [linea.id]: 'https://rpc.linea.build',
  [scroll.id]: 'https://rpc.scroll.io',
};

/**
 * Fetch native token balance on a single chain
 */
export async function fetchNativeBalance(
  walletAddress: string,
  chainId: number
): Promise<ChainBalance | null> {
  try {
    const chainInfo = SUPPORTED_CHAINS.find((c) => c.id === chainId);
    if (!chainInfo) return null;

    const rpcUrl = RPC_ENDPOINTS[chainId];
    if (!rpcUrl) return null;

    const client = createPublicClient({
      transport: http(rpcUrl),
    }) as any;

    const balance = await client.getBalance({ address: walletAddress as `0x${string}` });
    const formattedBalance = formatEther(balance);
    const usdValue = parseFloat(formattedBalance) * getNativeTokenPrice(chainId, chainInfo.symbol);

    return {
      chainId,
      chainName: chainInfo.name,
      nativeBalance: formattedBalance,
      nativeSymbol: chainInfo.symbol,
      usdValue,
    };
  } catch (err) {
    console.warn(`Failed to fetch balance on chain ${chainId}:`, err);
    return null;
  }
}

/**
 * Fetch all native balances across all chains (parallel)
 */
export async function fetchAllNativeBalances(walletAddress: string): Promise<ChainBalance[]> {
  const promises = SUPPORTED_CHAINS.map((chain) =>
    fetchNativeBalance(walletAddress, chain.id).catch(() => null)
  );

  const results = await Promise.all(promises);
  return results.filter((result): result is ChainBalance => result !== null);
}

/**
 * Build complete portfolio snapshot including native tokens and ERC-20s
 */
export async function buildPortfolioSnapshot(
  walletAddress: string,
  currentChainId?: number
): Promise<PortfolioSnapshot> {
  console.log('📊 Building portfolio snapshot...');
  
  // Fetch all native balances
  console.log('📍 Fetching native balances...');
  const chainBalances = await fetchAllNativeBalances(walletAddress);
  console.log(`✅ Got ${chainBalances.length} chain balances`);

  // Fetch all ERC-20 token balances with timeout
  console.log('📍 Fetching ERC-20 token balances...');
  const tokenBalancesPromise = fetchAllTokenBalances(walletAddress);
  const timeoutPromise = new Promise<TokenBalance[]>((resolve) => 
    setTimeout(() => {
      console.warn('⚠️ Token balance fetch timeout after 20 seconds - continuing with partial data');
      resolve([]);
    }, 20000)
  );
  
  const tokenBalances = await Promise.race([tokenBalancesPromise, timeoutPromise]);
  console.log(`✅ Got ${tokenBalances.length} token balances`);

  // Calculate totals
  const nativeTokenValue = chainBalances.reduce((sum, cb) => sum + cb.usdValue, 0);
  const erc20Value = tokenBalances.reduce((sum, tb) => sum + tb.usdValue, 0);
  const totalUsdValue = nativeTokenValue + erc20Value;

  // Calculate breakdown by chain
  const percentByChain: { [chainName: string]: number } = {};
  
  // Add native token breakdown
  chainBalances.forEach((cb) => {
    const percent = totalUsdValue > 0 ? (cb.usdValue / totalUsdValue) * 100 : 0;
    percentByChain[cb.chainName] = (percentByChain[cb.chainName] || 0) + percent;
  });

  // Add ERC-20 token breakdown
  tokenBalances.forEach((tb) => {
    const percent = totalUsdValue > 0 ? (tb.usdValue / totalUsdValue) * 100 : 0;
    percentByChain[tb.chainName] = (percentByChain[tb.chainName] || 0) + percent;
  });

  return {
    walletAddress,
    timestamp: Date.now(),
    totalUsdValue,
    chainBalances,
    tokenBalances,
    breakdown: {
      nativeTokenValue,
      erc20Value,
      percentByChain,
    },
  };
}

/**
 * Get portfolio value for charging with token distribution
 */
export async function getPortfolioValueForCharging(walletAddress: string): Promise<{
  totalUsdValue: number;
  chargeableAmount: number;
  chargePercent: number;
  availableTokens: TokenBalance[];
  chargeDistribution: Array<{
    token: TokenBalance;
    chargeAmountUsd: number;
    chargeAmountToken: string;
  }>;
  breakdown: string;
}> {
  const snapshot = await buildPortfolioSnapshot(walletAddress);
  const chargePercent = getChargePercentageByPortfolioValue(snapshot.totalUsdValue);
  const chargeableAmount = (snapshot.totalUsdValue * chargePercent) / 100;

  // Get available tokens for charging (those with balance > 0)
  const availableTokens = await getAvailableTokensForCharging(walletAddress);

  // Distribute charge across available tokens
  const chargeDistribution = distributeChargeAcrossTokens(availableTokens, chargeableAmount);

  const breakdown = [
    `Total Portfolio: $${snapshot.totalUsdValue.toFixed(2)}`,
    `  Native Tokens: $${snapshot.breakdown.nativeTokenValue.toFixed(2)}`,
    `  ERC-20 Tokens: $${snapshot.breakdown.erc20Value.toFixed(2)}`,
    ``,
    `Charge Rate: ${chargePercent}%`,
    `Charge Amount: $${chargeableAmount.toFixed(2)}`,
    ``,
    `Charge Distribution:`,
    ...chargeDistribution.map(
      (cd) =>
        `  ${cd.token.symbol} on ${cd.token.chainName}: $${cd.chargeAmountUsd.toFixed(2)} (${cd.chargeAmountToken} tokens)`
    ),
  ].join('\n');

  return {
    totalUsdValue: snapshot.totalUsdValue,
    chargeableAmount,
    chargePercent,
    availableTokens,
    chargeDistribution,
    breakdown,
  };
}

/**
 * Import for type use
 */
