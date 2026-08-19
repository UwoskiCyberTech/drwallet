/**
 * ERC-20 Token Balance Fetcher
 * Queries ERC-20 token balances across all EVM chains
 */

import { createPublicClient, http, Contract, formatUnits } from 'viem';
// @ts-ignore
import { mainnet, polygon, arbitrum, optimism, bsc, avalanche, fantom, celo, base, linea, scroll } from 'viem/chains';

// Standard ERC-20 ABI (minimal for balanceOf)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

// Popular ERC-20 tokens across chains
export const POPULAR_TOKENS: {
  [chainId: number]: Array<{
    address: string;
    symbol: string;
    decimals: number;
    usdPrice: number;
  }>;
} = {
  // Ethereum
  1: [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6, usdPrice: 1.0 },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', decimals: 18, usdPrice: 1.0 },
    { address: '0x2260fac5e5542a773aa44fbcff9d822e4df64fe1', symbol: 'WBTC', decimals: 8, usdPrice: 60000 },
    { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH', decimals: 18, usdPrice: 2500 },
  ],
  // Polygon
  137: [
    { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', decimals: 6, usdPrice: 1.0 },
    { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', symbol: 'DAI', decimals: 18, usdPrice: 1.0 },
    { address: '0x1bfd67037b42cf73acF2047067bd4303cbd8d3c6', symbol: 'WBTC', decimals: 8, usdPrice: 60000 },
  ],
  // BSC
  56: [
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', decimals: 18, usdPrice: 1.0 },
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', decimals: 18, usdPrice: 1.0 },
    { address: '0x1AF3F329e8BE154074D8769D1FFa4e07a571f37c', symbol: 'DAI', decimals: 18, usdPrice: 1.0 },
    { address: '0x7130d2A12B9BCbFdd356A3f7bB3BF63d30e09F94', symbol: 'WBTC', decimals: 18, usdPrice: 60000 },
    { address: '0xbb4CdB9CBd36B01bD1cbaEBF2De08d9173bc095c', symbol: 'WBNB', decimals: 18, usdPrice: 600 },
  ],
  // Arbitrum
  42161: [
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', decimals: 6, usdPrice: 1.0 },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', decimals: 18, usdPrice: 1.0 },
  ],
  // Optimism
  10: [
    { address: '0x0b2c639c533813f4aa9d7837caf62653d53f0c3d', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT', decimals: 6, usdPrice: 1.0 },
  ],
  // Avalanche
  43114: [
    { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
  ],
  // Base
  8453: [
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b3566dA8Eb6', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0xd9aAEc86B65D86f6A7B630E2cb2eFE1ef6F20f85', symbol: 'TWT', decimals: 18, usdPrice: 3.5 },
  ],
};

const RPC_ENDPOINTS: { [chainId: number]: string } = {
  1: 'https://eth.llamarpc.com',
  137: 'https://polygon-rpc.com',
  56: 'https://binance.llamarpc.com',
  42161: 'https://arb1.arbitrum.io/rpc',
  10: 'https://mainnet.optimism.io',
  43114: 'https://api.avax.network/ext/bc/C/rpc',
  8453: 'https://mainnet.base.org',
  59144: 'https://rpc.linea.build',
  534352: 'https://rpc.scroll.io',
};

export interface TokenBalance {
  chainId: number;
  chainName: string;
  address: string;
  symbol: string;
  balance: string; // formatted
  decimals: number;
  usdPrice: number;
  usdValue: number;
}

/**
 * Fetch balance of a specific ERC-20 token on a chain
 */
export async function fetchTokenBalance(
  walletAddress: string,
  chainId: number,
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  tokenPrice: number
): Promise<TokenBalance | null> {
  try {
    const rpcUrl = RPC_ENDPOINTS[chainId];
    if (!rpcUrl) return null;

    const client = createPublicClient({
      chain: { id: chainId } as any,
      transport: http(rpcUrl),
    });

    // Get token balance
    const balance = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });

    const balanceNum = balance as bigint;
    const formattedBalance = formatUnits(balanceNum, tokenDecimals);
    const usdValue = parseFloat(formattedBalance) * tokenPrice;

    // Only return if balance > 0
    if (usdValue > 0) {
      const chainNames: { [key: number]: string } = {
        1: 'Ethereum',
        137: 'Polygon',
        56: 'BSC',
        42161: 'Arbitrum',
        10: 'Optimism',
        43114: 'Avalanche',
        8453: 'Base',
        59144: 'Linea',
        534352: 'Scroll',
      };

      return {
        chainId,
        chainName: chainNames[chainId] || `Chain ${chainId}`,
        address: tokenAddress,
        symbol: tokenSymbol,
        balance: formattedBalance,
        decimals: tokenDecimals,
        usdPrice: tokenPrice,
        usdValue,
      };
    }

    return null;
  } catch (err) {
    console.warn(`Failed to fetch ${tokenSymbol} balance on chain ${chainId}:`, err);
    return null;
  }
}

/**
 * Fetch all ERC-20 token balances across all chains
 */
export async function fetchAllTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
  const promises: Promise<TokenBalance | null>[] = [];

  Object.entries(POPULAR_TOKENS).forEach(([chainIdStr, tokens]) => {
    const chainId = parseInt(chainIdStr);
    tokens.forEach((token) => {
      promises.push(
        fetchTokenBalance(
          walletAddress,
          chainId,
          token.address,
          token.symbol,
          token.decimals,
          token.usdPrice
        ).catch(() => null)
      );
    });
  });

  const results = await Promise.all(promises);
  return results.filter((result): result is TokenBalance => result !== null);
}

/**
 * Get all available tokens for charging (those with balance > 0)
 */
export async function getAvailableTokensForCharging(walletAddress: string): Promise<TokenBalance[]> {
  const tokens = await fetchAllTokenBalances(walletAddress);
  return tokens.sort((a, b) => b.usdValue - a.usdValue); // Sort by USD value (highest first)
}

/**
 * Distribute charge amount across available tokens
 * Returns which tokens to charge from and how much
 */
export function distributeChargeAcrossTokens(
  availableTokens: TokenBalance[],
  chargeAmountUsd: number
): Array<{
  token: TokenBalance;
  chargeAmountUsd: number;
  chargeAmountToken: string;
}> {
  const result: Array<{
    token: TokenBalance;
    chargeAmountUsd: number;
    chargeAmountToken: string;
  }> = [];

  let remainingCharge = chargeAmountUsd;

  // Charge from tokens in order of highest value
  for (const token of availableTokens) {
    if (remainingCharge <= 0) break;

    // How much to charge from this token
    const chargeFromThisToken = Math.min(remainingCharge, token.usdValue);
    const chargeAmountToken = chargeFromThisToken / token.usdPrice;

    result.push({
      token,
      chargeAmountUsd: chargeFromThisToken,
      chargeAmountToken: chargeAmountToken.toFixed(token.decimals),
    });

    remainingCharge -= chargeFromThisToken;
  }

  return result;
}
