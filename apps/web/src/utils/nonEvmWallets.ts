// Support helpers for non-EVM chains (TronLink for TRON & Phantom/Solflare for Solana)

export interface NonEvmWalletState {
  chain: 'tron' | 'solana';
  connected: boolean;
  address: string;
  balance: string;
  network: string;
}

export async function connectTronWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
  try {
    if (typeof window === 'undefined') return { success: false, error: 'Window undefined' };

    const tronWeb = (window as unknown as { tronWeb?: { defaultAddress?: { base58?: string }; request?: (args: { method: string }) => Promise<{ code: number }> } }).tronWeb;
    const tronLink = (window as unknown as { tronLink?: { request?: (args: { method: string }) => Promise<{ code: number }> } }).tronLink;

    if (!tronWeb && !tronLink) {
      return { success: false, error: 'TronLink extension not detected. Please install TronLink or use an EVM wallet.' };
    }

    if (tronLink?.request) {
      await tronLink.request({ method: 'tron_requestAccounts' });
    }

    const address = (window as unknown as { tronWeb?: { defaultAddress?: { base58?: string } } }).tronWeb?.defaultAddress?.base58;
    if (address) {
      return { success: true, address };
    }

    return { success: false, error: 'Could not retrieve TRON address from wallet' };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'TRON connection failed' };
  }
}

export async function connectSolanaWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
  try {
    if (typeof window === 'undefined') return { success: false, error: 'Window undefined' };

    const solana = (window as unknown as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }> } }).solana;

    if (!solana) {
      return { success: false, error: 'Solana wallet (Phantom/Solflare) not detected. Please install Phantom or use an EVM wallet.' };
    }

    const resp = await solana.connect();
    const address = resp.publicKey.toString();

    return { success: true, address };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Solana connection failed' };
  }
}
