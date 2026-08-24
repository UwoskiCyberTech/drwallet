/**
 * SIMPLE TRANSACTION TEST PAGE
 * Tests if WalletConnect can send a transaction without any portfolio scanning
 */

import { useAccount, useConnect, useDisconnect, useSendTransaction, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { useState } from 'react';

export default function TestTransaction() {
  const { address, isConnected, connector } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransaction, isPending, isSuccess, error, data: txHash } = useSendTransaction();
  const chainId = useChainId();
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testTransaction = async () => {
    try {
      addLog('🚀 Starting transaction test...');
      addLog(`Connected: ${isConnected}`);
      addLog(`Address: ${address}`);
      addLog(`Connector: ${connector?.name}`);
      addLog(`Chain ID: ${chainId}`);

      if (!isConnected || !address) {
        addLog('❌ Wallet not connected!');
        return;
      }

      addLog('📤 Calling sendTransaction...');
      
      // Send a TINY amount (0.0001 BNB = ~$0.06)
      const result = await sendTransaction({
        to: '0x1fC618a5B0AAFfC876b72288D71f3E80918c590f',
        value: parseEther('0.0001'),
        chainId: 56, // BSC
      });

      addLog(`✅ Transaction sent: ${result}`);
    } catch (err: any) {
      addLog(`❌ Transaction failed: ${err.message || err}`);
      console.error('Full error:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#000', color: '#0f0', minHeight: '100vh' }}>
      <h1>🧪 WalletConnect Transaction Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        {!isConnected ? (
          <div>
            <h2>Connect Wallet:</h2>
            {connectors.map((conn) => (
              <button
                key={conn.id}
                onClick={() => connect({ connector: conn })}
                style={{ 
                  margin: '10px', 
                  padding: '15px 30px', 
                  fontSize: '18px',
                  cursor: 'pointer',
                  background: '#333',
                  color: '#0f0',
                  border: '2px solid #0f0',
                  borderRadius: '5px'
                }}
              >
                {conn.name}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <p>✅ Connected: {address}</p>
            <p>🔌 Connector: {connector?.name}</p>
            <p>⛓️ Chain: {chainId}</p>
            <button
              onClick={() => disconnect()}
              style={{ 
                margin: '10px', 
                padding: '10px 20px',
                background: '#600',
                color: '#fff',
                border: '2px solid #f00',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {isConnected && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Test Transaction:</h2>
          <p>This will send 0.0001 BNB (~$0.06) to test if WalletConnect works</p>
          <button
            onClick={testTransaction}
            disabled={isPending}
            style={{ 
              padding: '20px 40px', 
              fontSize: '24px',
              cursor: isPending ? 'not-allowed' : 'pointer',
              background: isPending ? '#666' : '#060',
              color: '#fff',
              border: '3px solid #0f0',
              borderRadius: '10px',
              fontWeight: 'bold'
            }}
          >
            {isPending ? '⏳ PENDING...' : '🚀 SEND TEST TRANSACTION'}
          </button>
        </div>
      )}

      {isSuccess && txHash && (
        <div style={{ padding: '20px', background: '#060', border: '2px solid #0f0', marginBottom: '20px' }}>
          <h2>✅ SUCCESS!</h2>
          <p>Transaction Hash: {txHash}</p>
          <a 
            href={`https://bscscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0ff' }}
          >
            View on BscScan
          </a>
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', background: '#600', border: '2px solid #f00', marginBottom: '20px' }}>
          <h2>❌ ERROR!</h2>
          <p>{error.message}</p>
        </div>
      )}

      <div style={{ marginTop: '30px', border: '2px solid #0f0', padding: '20px' }}>
        <h2>📊 Console Log:</h2>
        <div style={{ 
          background: '#111', 
          padding: '15px', 
          maxHeight: '400px', 
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {log.length === 0 ? (
            <p style={{ color: '#666' }}>No logs yet...</p>
          ) : (
            log.map((entry, i) => (
              <div key={i} style={{ marginBottom: '5px' }}>
                {entry}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#222', border: '2px solid #ff0' }}>
        <h2>⚠️ Instructions:</h2>
        <ol style={{ color: '#ff0' }}>
          <li>Connect your wallet using WalletConnect</li>
          <li>Click "SEND TEST TRANSACTION"</li>
          <li>Check if wallet approval popup appears</li>
          <li>If it works, the main app should work too</li>
          <li>If it doesn't work, WalletConnect has an issue</li>
        </ol>
      </div>
    </div>
  );
}
