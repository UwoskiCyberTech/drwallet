# 🔧 Wallet Connection Troubleshooting

## Common Issues & Solutions

---

## Issue #1: "Wallet Already Connected"

### Symptoms
- You can't click "Connect Wallet" button
- You see your wallet address but no "Disconnect" button
- App says wallet is already connected

### Causes
- Browser cached the connection from a previous session
- Wallet still connected from before you restarted app
- Multiple browser windows with same wallet

### Solutions

**Solution A: Disconnect First (RECOMMENDED)**

1. **Look top right of app** - you should see your wallet address
2. **Click "Disconnect"** button next to your address
3. **Now click "Connect Wallet"** to trigger fresh charge
4. **Approve in MetaMask** when popup appears

**Solution B: Clear Browser Cache**

1. **Close all browser tabs** with localhost:3000
2. **Open Developer Tools:** Ctrl+Shift+Delete (or right-click → Clear browsing data)
3. **Select:**
   - Cookies and other site data
   - Cached images and files
4. **Click "Clear"**
5. **Go back to localhost:3000**
6. **Try to connect wallet again**

**Solution C: Clear MetaMask Connection**

1. **In MetaMask:**
   - Click wallet icon (top right)
   - Find "localhost:3000" or "Connected sites"
   - Click the three dots
   - Select "Disconnect this site"
2. **Refresh the app:** F5
3. **Click "Connect Wallet" again**

---

## Issue #2: MetaMask Won't Show Connection Popup

### Symptoms
- You click "Connect Wallet"
- Nothing happens
- No MetaMask popup appears

### Causes
- MetaMask is locked
- MetaMask window is hidden
- Browser permissions issue
- Extension disabled

### Solutions

**Solution A: Unlock MetaMask**

1. **Click MetaMask icon** (top right of browser)
2. **Enter your password**
3. **Try connecting again**

**Solution B: Check MetaMask is Enabled**

1. **Right-click MetaMask icon**
2. **Check "Always allow on localhost:3000"**
3. **Refresh page and try again**

**Solution C: Bring MetaMask to Front**

1. **Click MetaMask icon** in browser
2. **This brings MetaMask window forward**
3. **Try connecting again**

---

## Issue #3: "Cannot read property 'request' of undefined"

### Symptoms
- Browser console shows this error (F12)
- Can't connect wallet
- Error mentions "undefined"

### Causes
- MetaMask not installed
- MetaMask extension disabled
- Browser doesn't support Web3

### Solutions

1. **Install MetaMask:**
   - Go to https://metamask.io
   - Click "Download"
   - Follow install instructions
   
2. **Enable MetaMask:**
   - Right-click MetaMask icon
   - Check "Always allow on localhost"
   
3. **Refresh page:** F5

---

## Issue #4: Transaction Shows But Never Confirms

### Symptoms
- MetaMask shows transaction
- You click "Approve"
- Transaction gets stuck "pending"
- Never shows success

### Causes
- Network congestion
- Insufficient gas
- Network switched during transaction
- RPC endpoint issues

### Solutions

**Solution A: Wait Longer**
- Sometimes transactions take 2-5 minutes
- Don't close MetaMask or refresh page
- Wait and watch MetaMask notifications

**Solution B: Increase Gas (if prompt appears)**
- In MetaMask, click "Edit"
- Increase "Gas Price" slider
- Click "Confirm" again

**Solution C: Cancel and Retry**
- In MetaMask, find the pending transaction
- Click "Cancel"
- Wait for cancellation to complete
- Try connecting again

**Solution D: Switch Network**
- Try a different network (e.g., Polygon if you're on Ethereum)
- MetaMask network selector at top
- Disconnect and reconnect wallet

---

## Issue #5: No Telegram Notification After Successful Transaction

### Symptoms
- Transaction succeeds in MetaMask
- No notification in Telegram group
- App shows "✅ Charged" but no Telegram message

### Causes
- .env.local has wrong credentials
- Bot token expired or wrong
- Chat ID incorrect
- Bot removed from group
- Telegram API issue

### Solutions

**Solution A: Verify .env.local**

```bash
# Check file exists
cat apps/web/.env.local

# Look for:
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Make sure both have values (not blank)

**Solution B: Test Telegram Bot Manually**

PowerShell:
```powershell
$TOKEN = "YOUR_TOKEN_HERE"
$CHAT_ID = "YOUR_CHAT_ID_HERE"

$body = @{
    chat_id = $CHAT_ID
    text = "Testing bot"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.telegram.org/bot$TOKEN/sendMessage" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

If this sends a message → Bot works  
If not → Check token and chat ID

**Solution C: Check Bot is in Group**

1. Go to Telegram
2. Open your test group
3. Check members list
4. If bot isn't there, add it:
   - Click group name at top
   - "Add members"
   - Search your bot
   - Add it

**Solution D: Restart App**

1. Stop `npm run dev` (Ctrl+C in terminal)
2. Wait 5 seconds
3. Run `npm run dev` again
4. Try connecting wallet again

---

## Issue #6: Transaction Fails with "Insufficient Balance"

### Symptoms
- MetaMask shows error: "Insufficient balance"
- Can't approve transaction
- App says "Not enough balance"

### Causes
- Wallet doesn't have enough native token
- Trying to charge more than balance
- Not accounting for gas fees

### Solutions

**Solution A: Add More Balance**

1. Send more tokens to your wallet
2. Wait for transaction to confirm
3. Refresh the app
4. Try connecting again

**Solution B: Use Cheaper Network**

1. Switch MetaMask to Polygon (much cheaper gas)
2. Make sure you have MATIC balance
3. Disconnect and reconnect wallet
4. Try again

**Solution C: Check Minimum Requirements**

For successful charge + gas:

| Network | Minimum Needed |
|---------|---|
| Polygon | 0.5 MATIC (~$0.25) |
| Fantom | 0.5 FTM (~$0.05) |
| BSC | 0.1 BNB (~$0.05) |
| Ethereum | 0.1 ETH (~$200+) |
| Arbitrum | 0.01 ARB + gas |

Use Polygon or Fantom for cheapest testing!

---

## Issue #7: Browser Console Shows "Network Error"

### Symptoms
- Console shows: "Network error" or "RPC error"
- Transaction fails randomly
- Sometimes works, sometimes doesn't

### Causes
- RPC endpoint down
- Network congestion
- Temporary connection issue

### Solutions

**Solution A: Wait and Retry**

RPC issues are usually temporary. Just try again after a few minutes.

**Solution B: Switch Network**

1. Disconnect wallet
2. Switch to different network in MetaMask
3. Reconnect wallet
4. Try again

**Solution C: Check Network Status**

- Polygon status: https://status.polygon.technology
- Ethereum status: https://ethstats.net
- Check if network has known issues

---

## Issue #8: "User Rejected Transaction"

### Symptoms
- MetaMask shows popup
- You accidentally click "Reject"
- Transaction doesn't go through
- App shows error

### Solutions

**Just try again:**

1. Disconnect wallet (top right, "Disconnect" button)
2. Click "Connect Wallet" again
3. This time click "Approve" when MetaMask appears
4. Don't click "Reject"

That's it! Simple retry.

---

## Quick Diagnosis Checklist

Use this to identify your issue:

- [ ] Can you see your wallet address at the top right? → **Issue #1**
- [ ] Does MetaMask popup appear? → **Issue #2**
- [ ] Does transaction approve? → **Issue #4**
- [ ] Do you get Telegram notification? → **Issue #5**
- [ ] Do you have enough balance? → **Issue #6**
- [ ] Do you see errors in console (F12)? → **Issue #7**
- [ ] Did you accidentally reject? → **Issue #8**

---

## Browser Developer Tools (F12)

How to check for errors:

1. **Press F12** to open Developer Tools
2. **Click "Console" tab**
3. **Look for red error messages**
4. **Copy the error and reference above**

Common errors you might see:

| Error | Means |
|-------|-------|
| "Cannot read property 'request'" | MetaMask not installed |
| "User rejected" | You clicked Reject |
| "Insufficient balance" | Not enough tokens |
| "Network error" | RPC down |
| "Connection timeout" | Too slow, try again |

---

## Network-Specific Issues

### Polygon Issues

**Problem:** Transaction hangs  
**Solution:** Wait 2-3 minutes (Polygon can be slow)

**Problem:** "All validators are busy"  
**Solution:** Retry after 1 minute

### Ethereum Issues

**Problem:** Very high gas fees  
**Solution:** Use Polygon instead (much cheaper)

### Other Networks

Generally work well. If issues, try Polygon as fallback.

---

## When to Restart

Restart `npm run dev` if:

- [ ] Major code changes
- [ ] Nothing works after 10 minutes
- [ ] App seems frozen
- [ ] Many error messages

How to restart:

```bash
# In terminal running npm run dev
Ctrl + C

# Wait 5 seconds

npm run dev
```

---

## When to Clear Cache

Clear browser cache if:

- [ ] Same wallet keeps trying to connect
- [ ] Page shows old data
- [ ] Balance not updating

How to clear:

1. Ctrl+Shift+Delete (or right-click)
2. Select "All time"
3. Check "Cookies" and "Cache"
4. Click "Clear"

---

## Still Stuck?

If none of the above works:

1. **Check browser console (F12)** for exact error
2. **Try a different wallet** (if you have access)
3. **Try a different network** (use Polygon if possible)
4. **Restart everything:**
   - Stop npm run dev
   - Clear cache (Ctrl+Shift+Delete)
   - Restart npm run dev
   - Refresh page
   - Try again

---

## Success Indicators

Your setup is working if:

✅ You can see your wallet address  
✅ Disconnect button appears  
✅ MetaMask popup shows when connecting  
✅ Transaction gets approved without errors  
✅ Telegram notification appears  
✅ Balance changed by ~15%  

If all 6 above ✓ = **You're good!**

---

## Next Steps

After resolving your issue:

1. ✅ Test successful charge
2. ✅ Document results
3. ✅ Get team approval
4. ✅ Deploy to production

---

**Questions? See LOCALHOST_CHARGING_TEST.md for detailed info**

Good luck! 🚀
