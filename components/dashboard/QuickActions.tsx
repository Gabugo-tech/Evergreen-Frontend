"use client";

import Link from "next/link";
import { Send, Download, ArrowLeftRight, CreditCard, Plus, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { label: "Send Money",   href: "/payments",      icon: Send,            color: "bg-primary-500",  hover: "hover:bg-primary-600" },
  { label: "Receive",      href: "/payments",      icon: Download,        color: "bg-evergreen-600", hover: "hover:bg-evergreen-700" },
  { label: "Transfer",     href: "/payments",      icon: ArrowLeftRight,  color: "bg-violet-500",   hover: "hover:bg-violet-600" },
  { label: "Pay Bill",     href: "/payments",      icon: CreditCard,      color: "bg-amber-500",    hover: "hover:bg-amber-600" },
  { label: "Add Money",    href: "/banking",       icon: Plus,            color: "bg-teal-500",     hover: "hover:bg-teal-600" },
  { label: "Invest",       href: "/portfolio",     icon: BarChart2,       color: "bg-rose-500",     hover: "hover:bg-rose-600" },
];

export default function QuickActions() {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
        Quick Actions
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {actions.map(({ label, href, icon: Icon, color, hover }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center",
                color, hover,
                "transition-all duration-150 shadow-sm",
                "group-hover:shadow-md group-hover:-translate-y-0.5"
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium text-center leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
