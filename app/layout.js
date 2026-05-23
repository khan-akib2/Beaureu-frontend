import "./globals.css";

export const metadata = {
  title: "BureauAI — AI Governance Assistant for India",
  description: "Simplify government document audits, translate bureaucratic notices, find welfare schemes, and track application milestones — powered by Gemini AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" style={{ colorScheme: "light" }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force light theme — remove any stored dark preference
              localStorage.removeItem('theme');
              document.documentElement.classList.remove('dark');

              // Suppress GSI/FedCM and Failed to fetch console errors and unhandled rejections that trigger Next.js Dev Overlay
              const originalError = console.error;
              let currentErrorFn = originalError;
              let isCalling = false;
 
              Object.defineProperty(console, 'error', {
                get() {
                  return function (...args) {
                    const isSuppressed = args.some(arg => {
                      if (!arg) return false;
                      if (typeof arg === 'string') {
                        return arg.includes('[GSI_LOGGER]') || arg.includes('FedCM') || arg.includes('gsi') || arg.includes('Failed to fetch');
                      }
                      if (arg.message && typeof arg.message === 'string') {
                        return arg.message.includes('[GSI_LOGGER]') || arg.message.includes('FedCM') || arg.message.includes('gsi') || arg.message.includes('Failed to fetch');
                      }
                      return false;
                    });
                    if (isSuppressed) {
                      // log as warning instead
                      console.warn(...args);
                      return;
                    }
 
                    if (isCalling) {
                      return originalError.apply(console, args);
                    }
 
                    try {
                      isCalling = true;
                      return currentErrorFn.apply(console, args);
                    } finally {
                      isCalling = false;
                    }
                  };
                },
                set(newVal) {
                  currentErrorFn = newVal;
                },
                configurable: true
              });
 
              // Stop GSI/FedCM/Failed to fetch global errors and unhandled rejections in capturing phase before Next.js can intercept them
              window.addEventListener('error', function (event) {
                const msg = event.message || (event.error && event.error.message) || '';
                const isSuppressed = msg.includes('[GSI_LOGGER]') || msg.includes('FedCM') || msg.includes('gsi') || msg.includes('Failed to fetch');
                if (isSuppressed) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
 
              window.addEventListener('unhandledrejection', function (event) {
                const reason = event.reason;
                if (reason && (
                  (reason.message && (reason.message.includes('[GSI_LOGGER]') || reason.message.includes('FedCM') || reason.message.includes('gsi') || reason.message.includes('Failed to fetch'))) ||
                  (typeof reason === 'string' && (reason.includes('[GSI_LOGGER]') || reason.includes('FedCM') || reason.includes('gsi') || reason.includes('Failed to fetch')))
                )) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);

              // Helper to sync sessionStorage token with global cookie
              function syncCookie() {
                try {
                  const token = window.sessionStorage.getItem('bureau_token');
                  if (token) {
                    const isProd = window.location.protocol === 'https:';
                    document.cookie = "bureau_token=" + token + "; path=/; max-age=604800; SameSite=" + (isProd ? "None; Secure" : "Lax");
                  } else {
                    document.cookie = "bureau_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                    document.cookie = "bureau_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
                  }
                } catch (e) {}
              }

              // Bind event listeners for active tab synchronization
              if (typeof window !== 'undefined') {
                syncCookie();
                window.addEventListener('focus', syncCookie);
                window.addEventListener('visibilitychange', () => {
                  if (document.visibilityState === 'visible') {
                    syncCookie();
                  }
                });
                window.addEventListener('click', syncCookie);
              }

              // Global fetch interceptor for tab-isolated session token authentication
              if (typeof window !== 'undefined' && !window.__fetchPatched) {
                window.__fetchPatched = true;
                const originalFetch = window.fetch;
                window.fetch = async function (input, init) {
                  // Synchronize cookie to match the active tab's token before fetch is executed
                  syncCookie();

                  let token = null;
                  try {
                    token = window.sessionStorage.getItem('bureau_token');
                  } catch (e) {}

                  if (token) {
                    init = init || {};
                    init.headers = init.headers || {};
                    if (init.headers instanceof Headers) {
                      if (!init.headers.has('Authorization')) {
                        init.headers.set('Authorization', 'Bearer ' + token);
                      }
                    } else if (Array.isArray(init.headers)) {
                      const hasAuth = init.headers.some(h => h[0] && h[0].toLowerCase() === 'authorization');
                      if (!hasAuth) {
                        init.headers.push(['Authorization', 'Bearer ' + token]);
                      }
                    } else {
                      const hasAuth = Object.keys(init.headers).some(k => k.toLowerCase() === 'authorization');
                      if (!hasAuth) {
                        init.headers['Authorization'] = 'Bearer ' + token;
                      }
                    }
                  }

                  const isLogout = typeof input === 'string' && input.includes('/api/auth/logout');
                  if (isLogout) {
                    try {
                      window.sessionStorage.removeItem('bureau_token');
                      document.cookie = "bureau_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                      document.cookie = "bureau_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
                    } catch (e) {}
                  }

                  try {
                    const response = await originalFetch(input, init);
                    if (response.status === 401) {
                      try {
                        window.sessionStorage.removeItem('bureau_token');
                        document.cookie = "bureau_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                        document.cookie = "bureau_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
                      } catch (e) {}
                    }

                    if (response.status === 403) {
                      const isApi = typeof input === 'string' && input.includes('/api/');
                      if (!isApi && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
                        window.location.href = '/dashboard';
                      }
                    }

                    const isLoginOrAuth = typeof input === 'string' && (
                      input.includes('/api/auth/login') ||
                      input.includes('/api/auth/register') ||
                      input.includes('/api/auth/verify-otp') ||
                      input.includes('/api/auth/google') ||
                      input.includes('/api/auth/me')
                    );

                    if (isLoginOrAuth && response.ok) {
                      const cloned = response.clone();
                      cloned.json().then(data => {
                        if (data && data.token) {
                          try {
                            window.sessionStorage.setItem('bureau_token', data.token);
                            document.cookie = "bureau_token=" + data.token + "; path=/; max-age=604800; SameSite=Lax";
                          } catch (e) {}
                        }
                      }).catch(() => {});
                    }

                    return response;
                  } catch (err) {
                    throw err;
                  }
                };
              }
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ backgroundColor: "#f0f4f8", color: "#0f172a" }}
      >
        {children}
      </body>
    </html>
  );
}
