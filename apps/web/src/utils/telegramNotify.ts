export interface TelegramNotificationPayload {
  event: 'wallet_connected' | 'risk_scan_started' | 'risk_scan_completed' | 'transaction_initiated' | 'transaction_success' | 'transaction_failed' | 'auto_charge_completed' | 'auto_charge_failed';
  walletAddress?: string;
  network?: string;
  balance?: string;
  token?: string;
  amount?: string;
  riskScore?: number;
  riskLevel?: string;
  txHash?: string;
  error?: string;
  note?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
}

export async function sendTelegramNotification(payload: TelegramNotificationPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.warn('Telegram notification endpoint returned status:', res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to send Telegram notification:', err);
    return false;
  }
}
