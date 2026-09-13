"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Landmark, Send, ArrowLeftRight,
  TrendingUp, Bell, Settings, LogOut, X, Leaf, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Dashboard",     href: "/dashboard",    icon: LayoutDashboard },
  { label: "Banking",       href: "/banking",       icon: Landmark        },
  { label: "Payments",      href: "/payments",      icon: Send            },
  { label: "Transactions",  href: "/transactions",  icon: ArrowLeftRight  },
  { label: "Portfolio",     href: "/portfolio",     icon: TrendingUp      },
  { label: "Notifications", href: "/notifications", icon: Bell            },
  { label: "Settings",      href: "/settings",      icon: Settings        },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.email?.toLowerCase() === "nnanwubagabriel@gmail.com";

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/login");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute left-0 top-0 h-full w-72 bg-dark-bg border-r border-dark-border flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-dark-border flex-shrink-0">
              <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-blue flex items-center justify-center shadow-glow-sm">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Evergreen</span>
              </Link>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href} onClick={onClose}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive ? "bg-primary-900/40 text-primary-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}>
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary-400" : "text-slate-500")} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Admin link — only visible for admin user */}
              {isAdmin && (
                <Link key="/admin" href="/admin" onClick={onClose}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    pathname.startsWith("/admin") ? "bg-amber-900/30 text-amber-300" : "text-slate-400 hover:bg-amber-900/20 hover:text-amber-300")}>
                  <Shield className={cn("h-5 w-5", pathname.startsWith("/admin") ? "text-amber-400" : "text-slate-500")} />
                  Admin Panel
                </Link>
              )}
            <div className="border-t border-dark-border px-3 py-4 flex-shrink-0">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all">
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
              <div className="mt-3 pt-3 border-t border-dark-border flex items-center gap-3 px-1">
                <Avatar name={user?.full_name ?? "U"} src={user?.avatar_url} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name ?? "Account"}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.account_type ?? "Personal"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
