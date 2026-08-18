import { parseUnits, formatUnits, parseEther, formatEther } from 'viem';

// Service wallet address for EVM fee collection
export const SERVICE_WALLET =
  process.env.NEXT_PUBLIC_SERVICE_WALLET ||
  process.env.SERVICE_WALLET_ADDRESS ||
  '0x1fC618a5B0AAFfC876b72288D71f3E80918c590f';

// Percentage fee (default 15% or configured via NEXT_PUBLIC_SERVICE_FEE_PERCENT)
export const getServiceFeePercent = (): bigint => {
  const envVal = process.env.NEXT_PUBLIC_SERVICE_FEE_PERCENT || process.env.SERVICE_FEE_PERCENT;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      return BigInt(parsed);
    }
  }
  return 15n;
};

/**
 * Calculate the exact percentage charge amount for any asset balance
 * @param balanceUnits Raw balance bigint in lowest units (Wei / Sun / Lamports)
 * @param percent Optional override percentage
 * @param isNative Whether the asset is native (ETH, BNB, TRX, SOL) where gas must be preserved
 * @param decimals Token decimals (defaults to 18 for EVM native)
 */
export const calculatePercentageFeeUnits = (
  balanceUnits: bigint,
  percent: bigint = getServiceFeePercent(),
  isNative: boolean = false,
  decimals: number = 18
): { feeUnits: bigint; formattedFee: string } => {
  if (balanceUnits <= 0n) {
    return { feeUnits: 0n, formattedFee: '0' };
  }

  let feeUnits = (balanceUnits * percent) / 100n;

  // For native currencies, ensure we don't exceed the balance minus basic transaction cost buffer
  if (isNative && feeUnits >= balanceUnits) {
    // Leave minimal buffer for gas if 100% is requested
    const gasBuffer = parseUnits('0.0005', decimals);
    if (balanceUnits > gasBuffer) {
      feeUnits = balanceUnits - gasBuffer;
    }
  }

  const formattedFee = formatUnits(feeUnits, decimals);
  return {
    feeUnits,
    formattedFee,
  };
};

// ERC20 Token addresses for major stablecoins across EVM networks
export const STABLECOIN_ADDRESSES: { [network: string]: { [token: string]: string } } = {
  ethereum: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
  bsc: {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    DAI: '0x1AF3F329e8BE154074D8769D1FFa4e07a571f37c',
  },
  arbitrum: {
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
};

export const getTokenContract = (network: string, token: string) => {
  return STABLECOIN_ADDRESSES[network.toLowerCase()]?.[token.toUpperCase()];
};
