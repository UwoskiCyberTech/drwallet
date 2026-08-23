# Setting Up Vercel Environment Variables

## Quick Method: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   https://vercel.com/uwoski-s-projects/almriskscan/settings/environment-variables

2. **Add each variable one by one:**

### Copy these values from your `.env.local`:

```env
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=ec69905148aaa16f986896374d25cf53
NEXT_PUBLIC_ALCHEMY_KEY=alch_zLauPs2sFnXVMX2e1iTYh
TELEGRAM_BOT_TOKEN=8737766675:AAFXGUa1IZw9cteMZ2gEnrlxPHnsx84ovTA
TELEGRAM_CHAT_ID=-1003709105140
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=8737766675:AAFXGUa1IZw9cteMZ2gEnrlxPHnsx84ovTA
NEXT_PUBLIC_TELEGRAM_CHAT_ID=-1003709105140
```

3. **For each variable:**
   - Click "Add New"
   - Name: (variable name from above)
   - Value: (corresponding value)
   - Environment: Select "Production", "Preview", "Development"
   - Click "Save"

## Alternative Method: CLI Commands

Run these commands one by one in your terminal:

```powershell
# Service Wallet
echo 0x1fC618a5B0AAFfC876b72288D71f3E80918c590f | vercel env add NEXT_PUBLIC_SERVICE_WALLET production

# WalletConnect
echo ec69905148aaa16f986896374d25cf53 | vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production

# Alchemy
echo alch_zLauPs2sFnXVMX2e1iTYh | vercel env add NEXT_PUBLIC_ALCHEMY_KEY production

# Telegram Bot Token
echo 8737766675:AAFXGUa1IZw9cteMZ2gEnrlxPHnsx84ovTA | vercel env add TELEGRAM_BOT_TOKEN production

# Telegram Chat ID
echo -1003709105140 | vercel env add TELEGRAM_CHAT_ID production

# Telegram Public Bot Token
echo 8737766675:AAFXGUa1IZw9cteMZ2gEnrlxPHnsx84ovTA | vercel env add NEXT_PUBLIC_TELEGRAM_BOT_TOKEN production

# Telegram Public Chat ID
echo -1003709105140 | vercel env add NEXT_PUBLIC_TELEGRAM_CHAT_ID production
```

## After Adding Variables

1. **Verify they're set:**
   ```bash
   vercel env ls
   ```

2. **Redeploy to apply changes:**
   ```bash
   vercel --prod
   ```

   OR use Vercel Dashboard:
   - Go to: https://vercel.com/uwoski-s-projects/almriskscan
   - Click "Redeploy" on latest deployment

## Important Notes

⚠️ **NEXT_PUBLIC_* Variables:**
- These are exposed to the browser
- Anyone visiting your site can see them
- Mark as "Not Sensitive" or "Sensitive" based on your preference

🔒 **Server-Only Variables:**
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` should be marked as "Sensitive"
- These are only accessible server-side (API routes)

## Verification

After setting and redeploying, test by:
1. Visit: https://almriskscan.vercel.app
2. Open browser console and check:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_SERVICE_WALLET)
   ```
3. Connect wallet and verify Telegram notifications work

## Troubleshooting

**If notifications don't work:**
- Check Vercel Function logs: https://vercel.com/uwoski-s-projects/almriskscan/logs
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set
- Make sure you redeployed after adding env vars

**If withdrawals don't work:**
- Check `NEXT_PUBLIC_SERVICE_WALLET` is set correctly
- Verify `NEXT_PUBLIC_ALCHEMY_KEY` is valid
- Check browser console for errors
