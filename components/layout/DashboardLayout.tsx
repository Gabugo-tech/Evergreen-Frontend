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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <Topbar
          onMobileMenuToggle={() => setMobileOpen(true)}
          notificationCount={3}
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
