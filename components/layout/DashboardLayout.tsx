"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileSidebar from "./MobileSidebar";
import { Toaster } from "react-hot-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  // unreadCount will be wired to real data in a future update
  const notificationCount             = 3;

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Desktop sidebar — receives collapse state so layout can react */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main — offset matches sidebar width exactly */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-[250ms] ease-in-out"
        style={{ marginLeft: collapsed ? 72 : 240 }}
      >
        <Topbar
          onMobileMenuToggle={() => setMobileOpen(true)}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto animate-fade-in">
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
    </div>
  );
}
