"use client";

import { useRouter } from "next/navigation";
import { ShieldOff, Mail, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SuspendedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-xl">
          {/* Red header bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-red-400" />

          <div className="p-8 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <ShieldOff className="h-10 w-10 text-red-400" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Account Suspended</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your Evergreen account has been temporarily suspended and is currently under review.
                All account activity has been paused.
              </p>
            </div>

            {/* User info */}
            {user && (
              <div className="bg-dark-muted/50 border border-dark-border rounded-xl px-4 py-3 text-left space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Account</p>
                <p className="text-sm font-semibold text-white">{user.full_name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            )}

            {/* Info box */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-amber-300">What happens next?</p>
              <ul className="text-xs text-amber-200/70 space-y-1.5 list-disc list-inside">
                <li>Our team is reviewing your account</li>
                <li>You will be notified once the review is complete</li>
                <li>Your funds and data remain safe and secure</li>
              </ul>
            </div>

            {/* Contact support */}
            <a
              href="mailto:evergreenworldbank@gmail.com"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </a>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-dark-border text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Evergreen Financial Limited · Account Reference: {user?.email ?? "—"}
        </p>
      </div>
    </div>
  );
}
