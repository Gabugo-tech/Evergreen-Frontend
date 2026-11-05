"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user?.is_active === false) {
      router.replace("/suspended");
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-blue flex items-center justify-center shadow-glow-sm animate-pulse">
            <span className="text-white font-bold text-sm">EG</span>
          </div>
          <p className="text-slate-400 text-sm">Loading Evergreen…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.is_active === false) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
