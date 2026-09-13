"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileSidebar from "./MobileSidebar";
import VisitorTracker from "./VisitorTracker";
import { Toaster } from "react-hot-toast";
import { notificationsApi } from "@/lib/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Desktop sidebar widths
const SIDEBAR_EXPANDED  = 240;
const SIDEBAR_COLLAPSED = 72;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen,        setMobileOpen]        = useState(false);
  const [collapsed,         setCollapsed]          = useState(false);
  const [notificationCount, setNotificationCount]  = useState(0);
  const [isDesktop,         setIsDesktop]          = useState(false);

  // Detect desktop to apply margin offset (avoids SSR mismatch)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Real unread notification count, polled every 60s
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await notificationsApi.unreadCount();
        if (mounted) setNotificationCount(res.data?.count ?? 0);
      } catch { /* silent */ }
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const sidebarWidth = isDesktop
    ? (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED)
    : 0;

  return (
    <div className="flex h-screen h-dvh bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Desktop sidebar — hidden on mobile (mobile uses drawer) */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
      </div>

      {/* Mobile drawer */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-[250ms] ease-in-out overflow-hidden"
        style={{ marginLeft: sidebarWidth }}
      >
        <Topbar
          onMobileMenuToggle={() => setMobileOpen(true)}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "!bg-light-surface dark:!bg-dark-card !text-slate-900 dark:!text-white !border !border-light-border dark:!border-dark-border !shadow-card-dark !rounded-xl !text-sm",
          success: { iconTheme: { primary: "#22c55e", secondary: "white" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "white" } },
        }}
      />
      <VisitorTracker />
    </div>
  );
}
