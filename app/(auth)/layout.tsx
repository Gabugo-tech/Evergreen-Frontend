import { Leaf } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-bg bg-mesh flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-blue-dark opacity-80" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-700/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-evergreen-600/20 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Evergreen
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-6">
          <blockquote className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            Your wealth,{" "}
            <span className="text-white/70">growing every day.</span>
          </blockquote>
          <p className="text-white/60 text-lg max-w-sm">
            Bank, invest, and transfer money across the world — all in one
            beautifully simple platform.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-4">
            {[
              "Multi-Currency Payments",
              "Investment Portfolio",
              "Real-Time Analytics",
              "Instant Transfers",
            ].map((f) => (
              <span
                key={f}
                className="rounded-full bg-white/10 backdrop-blur border border-white/20 px-3 py-1 text-sm text-white/80"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Assets Managed", value: "$2.4B+" },
            { label: "Active Users", value: "180K+" },
            { label: "Countries", value: "60+" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
