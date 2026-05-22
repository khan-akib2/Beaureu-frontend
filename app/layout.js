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

              // Suppress GSI/FedCM console errors and unhandled rejections that trigger Next.js Dev Overlay
              const originalError = console.error;
              let currentErrorFn = originalError;
              let isCalling = false;

              Object.defineProperty(console, 'error', {
                get() {
                  return function (...args) {
                    const isGsi = args.some(arg => {
                      if (!arg) return false;
                      if (typeof arg === 'string') {
                        return arg.includes('[GSI_LOGGER]') || arg.includes('FedCM') || arg.includes('gsi');
                      }
                      if (arg.message && typeof arg.message === 'string') {
                        return arg.message.includes('[GSI_LOGGER]') || arg.message.includes('FedCM') || arg.message.includes('gsi');
                      }
                      return false;
                    });
                    if (isGsi) return;

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

              // Stop GSI/FedCM global errors and unhandled rejections in capturing phase before Next.js can intercept them
              window.addEventListener('error', function (event) {
                const msg = event.message || (event.error && event.error.message) || '';
                const isGsi = msg.includes('[GSI_LOGGER]') || msg.includes('FedCM') || msg.includes('gsi');
                if (isGsi) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);

              window.addEventListener('unhandledrejection', function (event) {
                const reason = event.reason;
                if (reason && (
                  (reason.message && (reason.message.includes('[GSI_LOGGER]') || reason.message.includes('FedCM') || reason.message.includes('gsi'))) ||
                  (typeof reason === 'string' && (reason.includes('[GSI_LOGGER]') || reason.includes('FedCM') || reason.includes('gsi')))
                )) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
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
