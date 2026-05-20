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
