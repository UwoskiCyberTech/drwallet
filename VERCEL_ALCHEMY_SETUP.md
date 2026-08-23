# Vercel Alchemy API Setup - REQUIRED FOR DEPLOYMENT

## Status
✅ Code changes committed and pushed to GitHub
✅ Local `.env.local` configured with Alchemy key
⏳ **PENDING**: Add Alchemy key to Vercel environment variables

## Steps to Complete Deployment

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Find your project: "drwallet" or "almriskscan"

### 2. Add Environment Variable
- Navigate to **Settings** → **Environment Variables**
- Click **Add New**
- Enter:
  - **Name**: `NEXT_PUBLIC_ALCHEMY_KEY`
  - **Value**: `alch_zLauPs2sFnXVMX2e1iTYh`
  - **Environments**: Select **Production** (and Preview if you want)
- Click **Save**

### 3. Redeploy
- Go to **Deployments** tab
- Find the latest deployment (should be automatic from the git push)
- If it's not auto-deployed, click **Redeploy** on the latest commit
- Wait for deployment to complete (usually 2-5 minutes)

### 4. Verify Live Site
After deployment completes:
1. Visit your live site
2. Connect wallet
3. Check browser console (F12) for RPC errors
4. Try fetching balance - should work across all chains now

## Why This Is Needed
- The code now uses `process.env.NEXT_PUBLIC_ALCHEMY_KEY` to load the API key
- `.env.local` only works locally - Vercel doesn't have access to your local files
- Vercel environment variables are how you pass secrets to production deployments
- Without this, the live site will fall back to public RPC endpoints (which have the original CORS/auth issues)

## Previous Issues This Fixes
- ✅ CORS blocking direct RPC calls
- ✅ polygon-rpc.com 401 Unauthorized
- ✅ DNS resolution failures
- ✅ Token balance fetch failures
- ✅ Wallet connection timeouts

## Current Live URL
https://drwallet-kezyl5v77-uwoski-s-projects.vercel.app
