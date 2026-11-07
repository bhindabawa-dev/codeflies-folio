import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codeflies • Portfolio Directory & Search Engine",
  description: "High-velocity enterprise portfolio search and link directory for Codeflies showcase projects.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
