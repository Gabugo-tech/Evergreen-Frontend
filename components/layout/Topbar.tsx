"use client";

import { Bell, Search, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/banking":      "Banking",
  "/payments":     "Payments",
  "/transactions": "Transactions",
  "/portfolio":    "Portfolio",
  "/notifications":"Notifications",
  "/settings":     "Settings",
};

interface TopbarProps {
  onMobileMenuToggle?: () => void;
  notificationCount?: number;
}

export default function Topbar({
  onMobileMenuToggle,
  notificationCount = 0,
}: TopbarProps) {
  const pathname = usePathname();
  const title = routeTitles[pathname] ?? "Evergreen";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-16",
        "bg-light-surface/80 dark:bg-dark-surface/80",
        "backdrop-blur-md",
        "border-b border-light-border dark:border-dark-border",
        "flex items-center px-6 gap-4"
      )}
    >
      {/* Mobile menu */}
      <button
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors"
        onClick={onMobileMenuToggle}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-light-muted dark:bg-dark-muted rounded-xl px-3 py-2 w-56 border border-light-border dark:border-dark-border">
        <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <input
          type="search"
          placeholder="Search..."
          className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
        >
          <Bell className="h-[18px] w-[18px]" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-light ring-2 ring-white dark:ring-dark-surface" />
          )}
        </Link>

        {/* User */}
        <Link href="/settings" aria-label="Profile settings">
          <Avatar name="Gabriel O" size="sm" className="cursor-pointer hover:ring-primary-500 transition-all" />
        </Link>
      </div>
    </header>
  );
}
