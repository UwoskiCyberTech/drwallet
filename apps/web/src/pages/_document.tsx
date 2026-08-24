import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="description" content="ALM Risk Scanner - Web3 AML & Wallet Security Analysis" />
      </Head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Main />
        <NextScript />
        
        {/* Eruda Mobile Console - for debugging on mobile devices */}
        <Script
          src="https://cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.min.js"
          strategy="beforeInteractive"
          onLoad={() => {
            if (typeof window !== 'undefined') {
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              const hasErudaParam = window.location.search.includes('eruda=true');
              if (isMobile || hasErudaParam) {
                (window as any).eruda?.init({
                  container: document.body,
                  tool: ['console', 'elements', 'network', 'resources', 'info', 'snippets', 'sources']
                });
                console.log('📱 Eruda mobile console enabled! Tap the floating button to open.');
              }
            }
          }}
        />
      </body>
    </Html>
  );
}
