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

const RPC_ENDPOINTS: { [chainId: number]: string } = {
  [mainnet.id]: 'https://rpc.ankr.com/eth',
  [polygon.id]: 'https://rpc.ankr.com/polygon',
  [arbitrum.id]: 'https://rpc.ankr.com/arbitrum',
  [optimism.id]: 'https://rpc.ankr.com/optimism',
  [bsc.id]: 'https://rpc.ankr.com/bsc',
  [avalanche.id]: 'https://rpc.ankr.com/avalanche',
  [fantom.id]: 'https://rpc.ankr.com/fantom',
  [celo.id]: 'https://rpc.ankr.com/celo',
  [base.id]: 'https://rpc.ankr.com/base',
  [linea.id]: 'https://rpc.ankr.com/linea',
  [scroll.id]: 'https://rpc.ankr.com/scroll',
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
  // Fetch all native balances
  const chainBalances = await fetchAllNativeBalances(walletAddress);

  // Fetch all ERC-20 token balances
  const tokenBalances = await fetchAllTokenBalances(walletAddress);

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
