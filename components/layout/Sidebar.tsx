"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  Send,
  ArrowLeftRight,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Banking",
    href: "/banking",
    icon: Landmark,
  },
  {
    label: "Payments",
    href: "/payments",
    icon: Send,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: TrendingUp,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 left-0 z-30 h-screen flex flex-col",
        "bg-dark-bg border-r border-dark-border",
        "overflow-hidden"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-dark-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-gradient-blue flex items-center justify-center shadow-glow-sm">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="text-lg font-bold text-white tracking-tight truncate"
              >
                Evergreen
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 scrollbar-hide">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-primary-900/40 text-primary-300 shadow-glow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-primary-400"
                    : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-dark-border px-3 py-4 space-y-1 flex-shrink-0">
        {bottomItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-primary-900/40 text-primary-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {/* Logout */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-150 group"
          onClick={() => {/* handle logout */}}
        >
          <LogOut className="h-5 w-5 flex-shrink-0 group-hover:text-red-400" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User profile */}
        <div className="mt-3 pt-3 border-t border-dark-border flex items-center gap-3 px-1">
          <Avatar name="Gabriel O" size="sm" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-slate-200 truncate">
                  Gabriel O
                </p>
                <p className="text-xs text-slate-500 truncate">Personal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-[72px] -right-3 z-10",
          "h-6 w-6 rounded-full",
          "bg-dark-surface border border-dark-border",
          "flex items-center justify-center",
          "text-slate-400 hover:text-white hover:bg-primary-700",
          "transition-colors duration-150",
          "shadow-md"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  );
}
