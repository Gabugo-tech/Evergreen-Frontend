import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Evergreen — Smart Banking & Investing",
    template: "%s | Evergreen",
  },
  description:
    "Evergreen is a modern fintech platform for banking, payments, and investment portfolio management.",
  keywords: ["fintech", "banking", "investing", "portfolio", "payments"],
  authors: [{ name: "Evergreen Financial" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Evergreen — Smart Banking & Investing",
    description: "Modern fintech platform for all your financial needs.",
    type: "website",
    siteName: "Evergreen",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)",  color: "#172554" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
