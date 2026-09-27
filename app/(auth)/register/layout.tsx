import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Free Account",
  description:
    "Create your free Evergreen account in minutes. Get a multi-currency wallet, invest in global markets, and send money to 60+ countries.",
  alternates: {
    canonical: "https://evergreen-frontend-lac.vercel.app/register",
  },
  openGraph: {
    title: "Open a Free Evergreen Account",
    description:
      "Sign up in 3 minutes. Multi-currency banking, global transfers, and investment portfolio — all in one platform.",
    url: "https://evergreen-frontend-lac.vercel.app/register",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
