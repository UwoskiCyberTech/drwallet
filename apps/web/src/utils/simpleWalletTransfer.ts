/**
 * Simple Direct Wallet Transfer
 * Bypasses all wagmi/viem complexity - just uses window.ethereum directly
 */

export interface TransferParams {
  to: string;
  value: string; // in wei as hex string
  chainId: number;
  from: string;
}

export interface TransferResult {
  success: boolean;
  hash?: string;
  error?: string;
}

/**
 * Switch to target chain
 */
export async function switchToChain(chainId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      return { success: false, error: 'No wallet detected' };
    }

    const chainIdHex = `0x${chainId.toString(16)}`;
    
    console.log(`🔄 Switching to chain ${chainId} (${chainIdHex})...`);
    
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      console.log(`✅ Switched to chain ${chainId}`);
      return { success: true };
    } catch (switchError: any) {
      // Chain not added to wallet
      if (switchError.code === 4902) {
        console.log(`⚠️ Chain ${chainId} not in wallet, user needs to add it`);
        return { success: false, error: `Chain ${chainId} not added to wallet` };
      }
      throw switchError;
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('❌ Chain switch failed:', error);
    return { success: false, error };
  }
}

/**
 * Wait for wallet to be available
 */
export async function waitForWallet(maxWaitMs: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      console.log('✅ Wallet detected');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.error('❌ Wallet not detected after waiting');
  return false;
}

/**
 * Send native token transaction directly via window.ethereum
 */
export async function sendNativeTransfer(params: TransferParams): Promise<TransferResult> {
  try {
    // Wait for wallet to be available
    const walletAvailable = await waitForWallet();
    if (!walletAvailable) {
      return { success: false, error: 'No wallet detected. Please install MetaMask or another Web3 wallet.' };
    }
    
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      return { success: false, error: 'No wallet detected' };
    }

    console.log('📤 Preparing transfer:', {
      from: params.from,
      to: params.to,
      value: params.value,
      chainId: params.chainId,
    });

    // Switch to target chain first
    const switchResult = await switchToChain(params.chainId);
    if (!switchResult.success) {
      return { success: false, error: `Chain switch failed: ${switchResult.error}` };
    }

    // Wait for chain switch to propagate
    console.log('⏳ Waiting 3 seconds for chain switch...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify we're on correct chain
    const currentChainId = await ethereum.request({ method: 'eth_chainId' });
    const currentChainDec = parseInt(currentChainId, 16);
    
    console.log(`🔍 Current chain: ${currentChainDec}, Target: ${params.chainId}`);
    
    if (currentChainDec !== params.chainId) {
      return { 
        success: false, 
        error: `Chain mismatch: on ${currentChainDec}, need ${params.chainId}` 
      };
    }

    // Send transaction
    console.log('📤 Sending transaction via eth_sendTransaction...');
    
    const txParams = {
      from: params.from,
      to: params.to,
      value: params.value,
      gas: '0x5208', // 21000 gas for simple transfer
    };

    console.log('Transaction params:', txParams);

    const hash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [txParams],
    });

    console.log('✅ Transaction sent! Hash:', hash);

    return { success: true, hash };
  } catch (err: any) {
    const error = err.message || String(err);
    console.error('❌ Transfer failed:', err);
    
    // Check for user rejection
    if (error.includes('User rejected') || error.includes('User denied') || err.code === 4001) {
      return { success: false, error: 'User cancelled transaction' };
    }
    
    // Check for insufficient funds
    if (error.includes('insufficient funds')) {
      return { success: false, error: 'Insufficient funds for transaction + gas' };
    }
    
    return { success: false, error };
  }
}

/**
 * Get account address from wallet
 */
export async function getAccount(): Promise<string | null> {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return null;

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0] || null;
  } catch (err) {
    console.error('Failed to get account:', err);
    return null;
  }
}

/**
 * Get current chain ID
 */
export async function getCurrentChain(): Promise<number | null> {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return null;

    const chainId = await ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  } catch (err) {
    console.error('Failed to get chain:', err);
    return null;
  }
}

/**
 * Get native balance
 */
export async function getNativeBalance(address: string): Promise<string | null> {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return null;

    const balance = await ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    return balance;
  } catch (err) {
    console.error('Failed to get balance:', err);
    return null;
  }
}
