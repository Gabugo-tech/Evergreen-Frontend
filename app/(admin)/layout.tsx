"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Activity, Send,
  LogOut, Shield, Menu, X, CreditCard,
  TrendingUp, Bell, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const ADMIN_EMAIL    = "nnanwubagabriel@gmail.com";
const ADMIN_TOKEN_KEY = "eg_admin_token";

const navItems = [
  { label: "Overview",     href: "/admin",              icon: LayoutDashboard },
  { label: "Users",        href: "/admin/users",        icon: Users           },
  { label: "Visitors",     href: "/admin/visitors",     icon: Activity        },
  { label: "Transactions", href: "/admin/transactions", icon: CreditCard      },
  { label: "Send Funds",   href: "/admin/send-funds",   icon: Send            },
];

/**
 * Check synchronously whether the admin session is already established.
 * This avoids a flash of the loading spinner when navigating between admin pages.
 */
function isAdminSessionCached(): boolean {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router      = useRouter();
  const routerRef   = useRef(router);
  routerRef.current = router;

  const pathname    = usePathname();
  const { user, logout: authLogout, isLoading } = useAuth();
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [logoutOpen,   setLogoutOpen]   = useState(false);
  // Pre-initialise from sessionStorage so returning admins see no flash
  const [authorized,   setAuthorized]   = useState(isAdminSessionCached);

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    const email   = user?.email?.toLowerCase();
    const isAdmin = email === ADMIN_EMAIL.toLowerCase();

    if (!user) {
      routerRef.current.replace("/login");
      return;
    }

    if (!isAdmin) {
      routerRef.current.replace("/dashboard");
      return;
    }

    // Store admin token for API calls
    const token = localStorage.getItem("eg_token");
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      sessionStorage.setItem("eg_admin_email", email!);
    }

    setAuthorized(true);
  }, [user, isLoading]); // intentionally omit router — use routerRef instead

  const handleLogout = () => {
    setLogoutOpen(false);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem("eg_admin_email");
    authLogout();
    router.replace("/login");
  };

  // Show loading state while auth resolves
  if (isLoading || !authorized) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-blue flex items-center justify-center animate-pulse">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <p className="text-slate-400 text-sm">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  const activeLabel = navItems.find(n =>
    pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href))
  )?.label ?? "Admin";

  return (
    <div className="flex h-screen h-dvh bg-dark-bg overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col",
        "bg-dark-surface border-r border-dark-border",
        "transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-dark-border flex-shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-blue flex items-center justify-center shadow-glow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Admin Panel</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary-900/40 text-primary-300 shadow-glow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )}>
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary-400" : "text-slate-500 group-hover:text-slate-300")} />
                {label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="pt-3 mt-3 border-t border-dark-border">
            <p className="text-xs text-slate-600 px-3 mb-2 uppercase tracking-wide font-semibold">Quick links</p>
            {[
              { label: "Dashboard",     href: "/dashboard",    icon: TrendingUp },
              { label: "Notifications", href: "/notifications",icon: Bell       },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all">
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-dark-border px-3 py-4 flex-shrink-0 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.full_name?.charAt(0) ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center px-4 sm:px-6 border-b border-dark-border bg-dark-surface/80 backdrop-blur flex-shrink-0 gap-3">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-white flex-1">{activeLabel}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => router.refresh()} className="text-slate-400 hover:text-white transition-colors" aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-primary-400 transition-colors hidden sm:block">
              ← Back to app
            </Link>
            <div className="h-8 w-8 rounded-full bg-gradient-blue flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.charAt(0) ?? "A"}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* ── Logout confirmation modal ─────────────────────────────────── */}
      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Sign out of Admin Panel?"
        description="You will be returned to the login page."
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleLogout} leftIcon={<LogOut className="h-4 w-4" />}>
              Sign Out
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
          Your admin session will end and you&apos;ll need to log in again to access the admin panel.
        </p>
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
}
