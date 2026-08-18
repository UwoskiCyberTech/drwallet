// Top-level telemetry interceptor to suppress benign third-party telemetry network failures in sandboxed iframes
if (typeof window !== 'undefined' && !(window as unknown as { __telemetryFilterInitialized?: boolean }).__telemetryFilterInitialized) {
  (window as unknown as { __telemetryFilterInitialized?: boolean }).__telemetryFilterInitialized = true;

  // 1. Safely intercept fetch to telemetry endpoints if writable
  try {
    if (typeof window.fetch === 'function') {
      const originalFetch = window.fetch.bind(window);
      const customFetch = async function (input: RequestInfo | URL, init?: RequestInit) {
        let url = '';
        try {
          if (typeof input === 'string') {
            url = input;
          } else if (input instanceof URL) {
            url = input.href;
          } else if (input && typeof input === 'object' && 'url' in input) {
            url = String((input as Request).url || '');
          }
        } catch {
          url = '';
        }

        if (
          url.includes('keys.coinbase.com/api/analytics') ||
          url.includes('wallet.coinbase.com/api/analytics') ||
          url.includes('analytics.coinbase.com') ||
          url.includes('cca-lite.coinbase.com') ||
          url.includes('/api/analytics')
        ) {
          return new Response(JSON.stringify({ ok: true, success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return originalFetch(input, init);
      };

      try {
        Object.defineProperty(window, 'fetch', {
          value: customFetch,
          writable: true,
          configurable: true,
        });
      } catch {
        try {
          (window as unknown as { fetch: typeof fetch }).fetch = customFetch;
        } catch {
          // Property is non-configurable and non-writable; safely ignore
        }
      }
    }
  } catch {
    // Window.fetch manipulation not permitted in this environment
  }

  // 2. Filter console.error and console.warn for Analytics SDK telemetry failures
  try {
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      try {
        const text = args
          .map((a) => {
            if (typeof a === 'string') return a;
            try {
              return JSON.stringify(a);
            } catch {
              return String(a);
            }
          })
          .join(' ');

        if (
          text.includes('Analytics SDK') ||
          text.includes('AnalyticsSDKApiError') ||
          text.includes('keys.coinbase.com') ||
          text.includes('wallet.coinbase.com')
        ) {
          return;
        }
      } catch {
        // Fall through
      }
      originalConsoleError.apply(console, args);
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      try {
        const text = args
          .map((a) => {
            if (typeof a === 'string') return a;
            try {
              return JSON.stringify(a);
            } catch {
              return String(a);
            }
          })
          .join(' ');

        if (
          text.includes('Analytics SDK') ||
          text.includes('AnalyticsSDKApiError') ||
          text.includes('keys.coinbase.com') ||
          text.includes('wallet.coinbase.com')
        ) {
          return;
        }
      } catch {
        // Fall through
      }
      originalConsoleWarn.apply(console, args);
    };
  } catch {
    // Ignore console override failures
  }

  // 3. Catch unhandled promise rejections and window errors
  try {
    window.addEventListener('unhandledrejection', (event) => {
      const reasonStr = String(event?.reason?.message || event?.reason || '');
      if (
        reasonStr.includes('AnalyticsSDKApiError') ||
        reasonStr.includes('Analytics SDK') ||
        reasonStr.includes('keys.coinbase.com')
      ) {
        event.preventDefault();
      }
    });

    window.addEventListener('error', (event) => {
      const msg = String(event?.message || '');
      if (
        msg.includes('AnalyticsSDKApiError') ||
        msg.includes('Analytics SDK') ||
        msg.includes('keys.coinbase.com')
      ) {
        event.preventDefault();
      }
    });
  } catch {
    // Ignore event listener failures
  }
}

export {};
