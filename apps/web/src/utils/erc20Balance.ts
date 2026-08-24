/**
 * ERC-20 Token Balance Fetcher
 * Queries ERC-20 token balances across all EVM chains
 */

import { createPublicClient, http, formatUnits } from 'viem';
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
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', decimals: 18, usdPrice: 7.5 },
    { address: '0x7Fc66500c84A76Ad7e9c93437E434122A1f9AcDd2', symbol: 'AAVE', decimals: 18, usdPrice: 150 },
    { address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', symbol: 'SUSHI', decimals: 18, usdPrice: 0.8 },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', decimals: 18, usdPrice: 2500 },
    { address: '0x514910771af9ca656af840dff83e8264ecf986ca', symbol: 'LINK', decimals: 18, usdPrice: 15 },
  ],
  // Polygon
  137: [
    { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', decimals: 6, usdPrice: 1.0 },
    { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', symbol: 'DAI', decimals: 18, usdPrice: 1.0 },
    { address: '0x1bfd67037b42cf73acF2047067bd4303cbd8d3c6', symbol: 'WBTC', decimals: 8, usdPrice: 60000 },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', decimals: 18, usdPrice: 2500 },
    { address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', symbol: 'LINK', decimals: 18, usdPrice: 15 },
    { address: '0x2791Bca1f2de4661ED88A928C4257A36a72c63c0', symbol: 'USDC.e', decimals: 6, usdPrice: 1.0 },
  ],
  // BSC
  56: [
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', decimals: 18, usdPrice: 1.0 },
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', decimals: 18, usdPrice: 1.0 },
    // { address: '0x1AF3F329e8BE154074D8769D1FFa4e07a571f37c', symbol: 'DAI', decimals: 18, usdPrice: 1.0 }, // Invalid address
    // { address: '0x7130d2A12B9BCbFdd356A3f7bB3BF63d30e09F94', symbol: 'WBTC', decimals: 18, usdPrice: 60000 }, // Invalid address
    { address: '0xbb4CdB9CBd36B01bD1cbaEBF2De08d9173bc095c', symbol: 'WBNB', decimals: 18, usdPrice: 600 },
    // { address: '0x250632378E573c6Be1AC2f97Fcdf00515D0AA91B', symbol: 'ETH', decimals: 18, usdPrice: 2500 }, // Invalid address
    { address: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63', symbol: 'XVS', decimals: 18, usdPrice: 12 },
  ],
  // Arbitrum
  42161: [
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', decimals: 6, usdPrice: 1.0 },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', decimals: 18, usdPrice: 1.0 },
    { address: '0x82aF49447590bCc544c14fb8dFA1b84d9DF30b65', symbol: 'WETH', decimals: 18, usdPrice: 2500 },
    { address: '0x2f2a2440d447915482e5163b51db0055d2e333f0', symbol: 'ARBI', decimals: 18, usdPrice: 1.2 },
  ],
  // Optimism
  10: [
    { address: '0x0b2c639c533813f4aa9d7837caf62653d53f0c3d', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT', decimals: 6, usdPrice: 1.0 },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', decimals: 18, usdPrice: 1.0 },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', decimals: 18, usdPrice: 2500 },
  ],
  // Avalanche
  43114: [
    { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    // { address: '0x9702230A8657203E2F6991d0cc0EFF81551EB0A8', symbol: 'USDT', decimals: 6, usdPrice: 1.0 }, // Invalid address
    { address: '0xd586e7f844cea2f87f50152565b0c72b02c9f729', symbol: 'DAI.e', decimals: 18, usdPrice: 1.0 },
    { address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', symbol: 'WETH.e', decimals: 18, usdPrice: 2500 },
  ],
  // Base
  8453: [
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b3566dA8Eb6', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0xd9aAEc86B65D86f6A7B630E2cb2eFE1ef6F20f85', symbol: 'TWT', decimals: 18, usdPrice: 3.5 },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', decimals: 18, usdPrice: 2500 },
    { address: '0x50c5725949A6F0c72E6C4a641F14122319E53ffc', symbol: 'BSWAP', decimals: 18, usdPrice: 0.5 },
  ],
  // Fantom
  250: [
    { address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    // { address: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bEf8Bed0f', symbol: 'USDTe', decimals: 6, usdPrice: 1.0 }, // Invalid address
    { address: '0xdc301622e02756b9ee76f0541d9d6d7bace2b438', symbol: 'gUSDC', decimals: 6, usdPrice: 1.0 },
    // { address: '0x74b23882a30290451A17c44f4F05a28b3B0a38C3', symbol: 'ETH', decimals: 18, usdPrice: 2500 }, // Invalid address
  ],
  // Celo
  42220: [
    { address: '0x765DE816845861e75A25592E5a5F97f254C69296', symbol: 'cUSD', decimals: 18, usdPrice: 1.0 },
    // { address: '0xBAAB46E6029B0FdAff53af51C894FDC3c13B57ec', symbol: 'cEUR', decimals: 18, usdPrice: 1.1 }, // Invalid address
    // { address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6CA73', symbol: 'cREAL', decimals: 18, usdPrice: 0.8 }, // Invalid address
  ],
  // Linea
  59144: [
    { address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    // { address: '0xA219439258ca9253f36B5b34bF22b5Ec712992A7', symbol: 'USDT', decimals: 6, usdPrice: 1.0 }, // Invalid address
    // { address: '0x4AF15ec2A0BD43Db75dd04E62FAA3B8ef36b00d5', symbol: 'DAI', decimals: 18, usdPrice: 1.0 }, // Invalid address
    { address: '0xe5D7C2a44FfDDf662eBd9D78d46e8255FF9146d7', symbol: 'WETH', decimals: 18, usdPrice: 2500 },
  ],
  // Scroll
  534352: [
    { address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9f95F66345', symbol: 'USDC', decimals: 6, usdPrice: 1.0 },
    { address: '0xf55BEC9cafDbE8730f6d39605cd6aDA1d568e9B9', symbol: 'USDT', decimals: 6, usdPrice: 1.0 },
    { address: '0xCa77EB5FB38850F0A67eD5a0492992a60e128f8c', symbol: 'DAI', decimals: 18, usdPrice: 1.0 },
    { address: '0x5300000000000000000000000000000000000004', symbol: 'WETH', decimals: 18, usdPrice: 2500 },
  ],
};

// Get Alchemy API key from environment
const alchemyKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_ALCHEMY_KEY : process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';

const RPC_ENDPOINTS: { [chainId: number]: string } = {
  1: alchemyKey 
    ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://ethereum-rpc.publicnode.com',
  137: alchemyKey 
    ? `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://polygon-bor-rpc.publicnode.com',
  56: 'https://bsc-dataseed.binance.org',
  42161: alchemyKey 
    ? `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://arb1.arbitrum.io/rpc',
  10: alchemyKey 
    ? `https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://mainnet.optimism.io',
  43114: 'https://api.avax.network/ext/bc/C/rpc',
  8453: alchemyKey 
    ? `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : 'https://mainnet.base.org',
  250: 'https://fantom-rpc.publicnode.com',
  42220: 'https://forno.celo.org',
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
      transport: http(rpcUrl),
    }) as any;

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
 * Fetch ALL token balances for a wallet using Alchemy Token API
 * This gets tokens the wallet actually holds, not just a predefined list
 */
export async function fetchAllTokenBalancesFromAlchemy(
  walletAddress: string,
  chainId: number
): Promise<TokenBalance[]> {
  const alchemyKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_ALCHEMY_KEY : process.env.NEXT_PUBLIC_ALCHEMY_KEY || '';
  
  // Alchemy API only available for certain chains
  const alchemyChains: { [key: number]: string } = {
    1: 'eth-mainnet',
    137: 'polygon-mainnet',
    42161: 'arb-mainnet',
    10: 'opt-mainnet',
    8453: 'base-mainnet',
  };

  const alchemyNetwork = alchemyChains[chainId];
  
  // If no Alchemy support or no API key, fall back to popular tokens
  if (!alchemyNetwork || !alchemyKey) {
    return [];
  }

  try {
    const url = `https://${alchemyNetwork}.g.alchemy.com/v2/${alchemyKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [walletAddress, 'erc20'],
        id: 1,
      }),
    });

    const data = await response.json();
    
    if (!data.result || !data.result.tokenBalances) {
      return [];
    }

    const chainNames: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
    };

    const tokenBalances: TokenBalance[] = [];

    // Filter out zero balances and get metadata
    for (const token of data.result.tokenBalances) {
      const balance = BigInt(token.tokenBalance || '0');
      if (balance === BigInt(0)) continue;

      try {
        // Get token metadata (symbol, decimals)
        const metadataResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'alchemy_getTokenMetadata',
            params: [token.contractAddress],
            id: 1,
          }),
        });

        const metadata = await metadataResponse.json();
        
        if (metadata.result) {
          const decimals = metadata.result.decimals || 18;
          const symbol = metadata.result.symbol || 'UNKNOWN';
          const formattedBalance = formatUnits(balance, decimals);
          
          // Estimate USD price (for now use 0, but could integrate price API)
          // For stablecoins, assume $1
          const isStablecoin = ['USDT', 'USDC', 'DAI', 'BUSD', 'USDD', 'FRAX', 'TUSD'].includes(symbol.toUpperCase());
          const usdPrice = isStablecoin ? 1.0 : 0;
          const usdValue = parseFloat(formattedBalance) * usdPrice;

          // Only include if has meaningful value or is stablecoin
          if (usdValue > 0.01 || isStablecoin) {
            tokenBalances.push({
              chainId,
              chainName: chainNames[chainId] || `Chain ${chainId}`,
              address: token.contractAddress,
              symbol,
              balance: formattedBalance,
              decimals,
              usdPrice,
              usdValue,
            });
          }
        }
      } catch (err) {
        console.warn(`Failed to get metadata for token ${token.contractAddress}:`, err);
      }
    }

    return tokenBalances;
  } catch (err) {
    console.warn(`Failed to fetch token balances from Alchemy for chain ${chainId}:`, err);
    return [];
  }
}

/**
 * Fetch all ERC-20 token balances across all chains
 * Uses Alchemy API to get ALL tokens, falls back to popular tokens list
 */
export async function fetchAllTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
  const promises: Promise<TokenBalance[]>[] = [];

  // Try Alchemy API for supported chains (gets ALL tokens)
  const alchemyChains = [1, 137, 42161, 10, 8453];
  alchemyChains.forEach((chainId) => {
    promises.push(
      fetchAllTokenBalancesFromAlchemy(walletAddress, chainId).catch(() => [])
    );
  });

  // For other chains or as fallback, use popular tokens list
  Object.entries(POPULAR_TOKENS).forEach(([chainIdStr, tokens]) => {
    const chainId = parseInt(chainIdStr);
    // Skip if already covered by Alchemy
    if (alchemyChains.includes(chainId)) return;

    tokens.forEach((token) => {
      promises.push(
        fetchTokenBalance(
          walletAddress,
          chainId,
          token.address,
          token.symbol,
          token.decimals,
          token.usdPrice
        ).then(result => result ? [result] : []).catch(() => [])
      );
    });
  });

  const results = await Promise.all(promises);
  const allBalances = results.flat();
  
  // Remove duplicates (same token on same chain)
  const seen = new Set<string>();
  return allBalances.filter(token => {
    const key = `${token.chainId}-${token.address.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
