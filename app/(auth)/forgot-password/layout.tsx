import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Reset your Evergreen account password. Enter your email address and we'll send you a secure reset link.",
  alternates: {
    canonical: "https://evergreen-frontend-lac.vercel.app/forgot-password",
  },
  robots: {
    index: false, // no value in indexing a password-reset page
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
