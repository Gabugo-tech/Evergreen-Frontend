import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Evergreen account. Access your multi-currency wallet, investment portfolio, and global payments dashboard.",
  alternates: {
    canonical: "https://evergreen-frontend-lac.vercel.app/login",
  },
  openGraph: {
    title: "Sign In to Evergreen",
    description:
      "Access your digital banking and investment dashboard. Secure login with 256-bit encryption.",
    url: "https://evergreen-frontend-lac.vercel.app/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
