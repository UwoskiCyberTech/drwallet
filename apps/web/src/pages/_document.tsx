import { Html, Head, Main, NextScript } from 'next/document';

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
      </body>
    </Html>
  );
}
