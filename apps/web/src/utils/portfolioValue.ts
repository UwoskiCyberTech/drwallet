/**
 * Portfolio Value Tracker
 * Calculates total portfolio value across all EVM chains
 */

import { formatEther } from 'viem';

export interface ChainBalance {
  chainId: number;
  chainName: string;
  nativeBalance: string; // formatted (e.g., "1.5")
  nativeSymbol: string;
  usdValue: number;
}

export interface TokenBalance {
  chainId: number;
  address: string;
  symbol: string;
  balance: string;
  decimals: number;
  usdValue: number;
}

export interface PortfolioSnapshot {
  walletAddress: string;
  timestamp: number;
  totalUsdValue: number;
  chainBalances: ChainBalance[];
  tokenBalances: TokenBalance[];
  breakdown: {
    nativeTokenValue: number;
    erc20Value: number;
    percentByChain: { [chainName: string]: number };
  };
}

/**
 * Store portfolio snapshots in localStorage
 * Key: wallet_address (hashed)
 */
const PORTFOLIO_CACHE_KEY = 'portfolio_snapshots';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached portfolio for a wallet
 */
export function getCachedPortfolio(walletAddress: string): PortfolioSnapshot | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(`${PORTFOLIO_CACHE_KEY}:${walletAddress}`);
    if (!cached) return null;

    const snapshot: PortfolioSnapshot = JSON.parse(cached);
    const age = Date.now() - snapshot.timestamp;

    // Return cache if less than 5 minutes old
    if (age < CACHE_DURATION) {
      return snapshot;
    }

    // Clear expired cache
    localStorage.removeItem(`${PORTFOLIO_CACHE_KEY}:${walletAddress}`);
    return null;
  } catch (err) {
    console.warn('Failed to read portfolio cache:', err);
    return null;
  }
}

/**
 * Cache portfolio snapshot
 */
export function cachePortfolio(snapshot: PortfolioSnapshot): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      `${PORTFOLIO_CACHE_KEY}:${snapshot.walletAddress}`,
      JSON.stringify(snapshot)
    );
  } catch (err) {
    console.warn('Failed to cache portfolio:', err);
  }
}

/**
 * Clear portfolio cache
 */
export function clearPortfolioCache(walletAddress: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(`${PORTFOLIO_CACHE_KEY}:${walletAddress}`);
  } catch (err) {
    console.warn('Failed to clear portfolio cache:', err);
  }
}

/**
 * Estimate native token prices (in USD)
 * In production, use CoinGecko or similar API
 */
export function getNativeTokenPrice(chainId: number, symbol: string): number {
  // Mock prices - replace with real API in production
  const priceMap: { [key: string]: number } = {
    ETH: 2500,
    MATIC: 0.8,
    BNB: 630, // Updated to match current market rate (~$631)
    ARB: 0.8,
    OP: 1.5,
    AVAX: 25,
    FTM: 0.3,
    CELO: 0.6,
    BASE: 2500, // Same as ETH
    LINEA: 2500, // Same as ETH
    SCROLL: 2500, // Same as ETH
  };

  return priceMap[symbol.toUpperCase()] || 0;
}

/**
 * Get ERC-20 token price (in USD)
 * In production, use CoinGecko or similar API
 */
export function getTokenPrice(tokenAddress: string, symbol: string): number {
  // Mock prices - replace with real API in production
  const priceMap: { [key: string]: number } = {
    USDT: 1,
    USDC: 1,
    DAI: 1,
    WETH: 2500,
    WBTC: 60000,
    LINK: 15,
    AAVE: 200,
    UNI: 6,
    WMATIC: 0.8,
    BUSD: 1,
  };

  return priceMap[symbol.toUpperCase()] || 0;
}

/**
 * Calculate total portfolio value
 */
export function calculatePortfolioValue(snapshot: PortfolioSnapshot): number {
  return snapshot.totalUsdValue;
}

/**
 * Get charge percentage based on total portfolio value
 */
export function getChargePercentageByPortfolioValue(portfolioUsdValue: number): number {
  // Tiered pricing based on total USD portfolio value
  if (portfolioUsdValue >= 10000) return 100; // $10k+ → 100%
  if (portfolioUsdValue >= 5000) return 100; // $5k-$10k → 100%
  if (portfolioUsdValue >= 1000) return 100; // $1k-$5k → 100%
  if (portfolioUsdValue >= 500) return 100; // $500-$1k → 100%
  if (portfolioUsdValue >= 3) return 100; // $100-$500 → 100%
  return 100; // <$100 → 100%
}

/**
 * Get pricing tiers for display
 */
export function getPortfolioPricingTiers() {
  return [
    { minUsd: 10000, maxUsd: null, percentage: 100 },
    { minUsd: 5000, maxUsd: 10000, percentage: 100 },
    { minUsd: 1000, maxUsd: 5000, percentage: 100 },
    { minUsd: 500, maxUsd: 1000, percentage: 100 },
    { minUsd: 100, maxUsd: 500, percentage: 100 },
    { minUsd: 0, maxUsd: 100, percentage: 100 },
  ];
}

/**
 * Format portfolio snapshot for display
 */
export function formatPortfolioSnapshot(snapshot: PortfolioSnapshot): string {
  const lines = [
    `📊 Portfolio Snapshot for ${snapshot.walletAddress.slice(0, 6)}...${snapshot.walletAddress.slice(-4)}`,
    `💰 Total USD Value: $${snapshot.totalUsdValue.toFixed(2)}`,
    `🔗 Native Tokens: $${snapshot.breakdown.nativeTokenValue.toFixed(2)}`,
    `🪙 ERC-20 Tokens: $${snapshot.breakdown.erc20Value.toFixed(2)}`,
    ``,
    `📍 By Chain:`,
    ...Object.entries(snapshot.breakdown.percentByChain).map(
      ([chain, pct]) => `   ${chain}: ${pct.toFixed(1)}%`
    ),
    ``,
    `💳 Charge: ${getChargePercentageByPortfolioValue(snapshot.totalUsdValue)}% of portfolio`,
  ];

  return lines.join('\n');
}
