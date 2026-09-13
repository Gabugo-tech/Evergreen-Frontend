"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Activity, Send,
  LogOut, Shield, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

const ADMIN_EMAIL = "nnanwubagabriel@gmail.com";
const ADMIN_TOKEN_KEY = "eg_admin_token";

const navItems = [
  { label: "Overview",     href: "/admin",                icon: LayoutDashboard },
  { label: "Users",        href: "/admin/users",          icon: Users           },
  { label: "Visitors",     href: "/admin/visitors",       icon: Activity        },
  { label: "Transactions", href: "/admin/transactions",   icon: Activity        },
  { label: "Send Funds",   href: "/admin/send-funds",     icon: Send            },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const email = sessionStorage.getItem("eg_admin_email");
    if (!token || email?.toLowerCase() !== ADMIN_EMAIL) {
      router.replace("/admin-login");
      return;
    }
    setAdminEmail(email);
  }, [router]);

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem("eg_admin_email");
    router.replace("/admin-login");
  };

  if (!adminEmail) return null; // Redirect in progress

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col",
        "bg-dark-surface border-r border-dark-border",
        "transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-dark-border flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-blue flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin Panel</p>
            <p className="text-xs text-slate-500">Evergreen</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary-900/40 text-primary-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", isActive ? "text-primary-400" : "text-slate-500")} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="border-t border-dark-border px-4 py-4 flex-shrink-0">
          <p className="text-xs text-slate-500 truncate mb-3">{adminEmail}</p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center px-6 border-b border-dark-border bg-dark-surface/80 backdrop-blur flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden mr-3 text-slate-400">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">
            {navItems.find(n => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label ?? "Admin"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:block">{adminEmail}</span>
            <div className="h-8 w-8 rounded-full bg-gradient-blue flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
