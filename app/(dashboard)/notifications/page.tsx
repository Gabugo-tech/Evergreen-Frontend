"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell, CheckCheck, Trash2, ArrowUpRight,
  TrendingUp, Shield, CreditCard,
  Info, Gift,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types & mock data ────────────────────────────────────────────────────────
type NotifType = "transaction" | "security" | "payment" | "system" | "investment" | "promo";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id:"1",  type:"transaction", title:"Payment Received",         message:"You received $5,400.00 from Acme Corp — salary for December.",                   is_read:false, created_at: new Date(Date.now()-1000*60*10).toISOString(),  action_url:"/transactions" },
  { id:"2",  type:"security",    title:"New Device Login",          message:"A new login was detected from Chrome on Windows in Lagos, Nigeria.",               is_read:false, created_at: new Date(Date.now()-1000*60*45).toISOString() },
  { id:"3",  type:"investment",  title:"Portfolio Up 1.43%",        message:"Your portfolio gained $1,790.50 today. NVDA led gains at +3.87%.",                 is_read:false, created_at: new Date(Date.now()-1000*60*120).toISOString(), action_url:"/portfolio" },
  { id:"4",  type:"payment",     title:"Transfer Completed",        message:"Your transfer of $250.00 to Sarah Connor was processed successfully.",              is_read:true,  created_at: new Date(Date.now()-1000*60*60*5).toISOString(), action_url:"/transactions" },
  { id:"5",  type:"system",      title:"KYC Verification Required", message:"Complete your identity verification to unlock higher transaction limits.",          is_read:false, created_at: new Date(Date.now()-1000*60*60*8).toISOString(), action_url:"/settings" },
  { id:"6",  type:"transaction", title:"Spend Alert",               message:"You've spent $800 on Shopping this month — 80% of your $1,000 budget.",             is_read:true,  created_at: new Date(Date.now()-1000*60*60*12).toISOString() },
  { id:"7",  type:"investment",  title:"Dividend Received",         message:"Apple Inc. (AAPL) paid a dividend of $127.40 to your investment account.",         is_read:true,  created_at: new Date(Date.now()-1000*60*60*26).toISOString(), action_url:"/portfolio" },
  { id:"8",  type:"security",    title:"Password Changed",          message:"Your Evergreen account password was successfully updated.",                         is_read:true,  created_at: new Date(Date.now()-1000*60*60*30).toISOString() },
  { id:"9",  type:"payment",     title:"International Transfer Initiated", message:"$1,200 USD → ₦1,944,000 NGN to Amara Diallo is being processed.",            is_read:true,  created_at: new Date(Date.now()-1000*60*60*50).toISOString(), action_url:"/transactions" },
  { id:"10", type:"promo",       title:"Refer & Earn $50",          message:"Invite friends to Evergreen. You both get $50 when they make their first transfer.", is_read:true,  created_at: new Date(Date.now()-1000*60*60*72).toISOString() },
  { id:"11", type:"system",      title:"Scheduled Maintenance",     message:"Evergreen will undergo maintenance on Dec 8 from 2–4 AM UTC. Minimal disruption expected.", is_read:true, created_at: new Date(Date.now()-1000*60*60*96).toISOString() },
  { id:"12", type:"transaction", title:"Bill Payment Due",          message:"Your electricity bill of $94.20 is due in 3 days. Tap to pay now.",                 is_read:true,  created_at: new Date(Date.now()-1000*60*60*110).toISOString() },
];

const typeConfig: Record<NotifType, { icon: React.ElementType; color: string; bg: string; badge: "blue"|"red"|"green"|"yellow"|"neutral"|"purple" }> = {
  transaction: { icon: CreditCard,  color: "text-primary-600 dark:text-primary-400", bg: "bg-primary-100 dark:bg-primary-900/30",  badge: "blue"    },
  security:    { icon: Shield,      color: "text-danger-light",                       bg: "bg-danger-bg dark:bg-red-900/20",         badge: "red"     },
  payment:     { icon: ArrowUpRight,color: "text-success-light",                      bg: "bg-success-bg dark:bg-green-900/20",      badge: "green"   },
  system:      { icon: Info,        color: "text-slate-500 dark:text-slate-400",      bg: "bg-slate-100 dark:bg-dark-muted",         badge: "neutral" },
  investment:  { icon: TrendingUp,  color: "text-evergreen-500",                      bg: "bg-evergreen-50 dark:bg-evergreen-900/20",badge: "blue"    },
  promo:       { icon: Gift,        color: "text-warning-light",                      bg: "bg-warning-bg dark:bg-yellow-900/20",     badge: "yellow"  },
};

type FilterType = "all" | NotifType;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

  const deleteOne = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const clearAll = () => setNotifications([]);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: "all",         label: "All" },
    { value: "transaction", label: "Transactions" },
    { value: "payment",     label: "Payments" },
    { value: "investment",  label: "Investments" },
    { value: "security",    label: "Security" },
    { value: "system",      label: "System" },
    { value: "promo",       label: "Promotions" },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="h-6 w-6 rounded-full bg-danger-light text-white text-xs font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={markAllRead}>
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={clearAll}
              className="text-danger-light hover:bg-danger-bg dark:hover:bg-red-900/20">
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Unread",       value: unreadCount,                                        color: "text-danger-light" },
          { label: "Total",        value: notifications.length,                               color: "text-slate-900 dark:text-white" },
          { label: "Security",     value: notifications.filter(n=>n.type==="security").length, color: "text-danger-light" },
          { label: "Investments",  value: notifications.filter(n=>n.type==="investment").length,color:"text-success-light" },
        ].map((s) => (
          <div key={s.label} className="stat-card py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {filterOptions.map(({ value, label }) => {
          const count = value === "all"
            ? notifications.length
            : notifications.filter((n) => n.type === value).length;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5",
                filter === value
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-light-muted dark:bg-dark-muted text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-border"
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn(
                  "text-xs rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-semibold",
                  filter === value ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-dark-border text-slate-600 dark:text-slate-400"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <Card padding="none">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500"
            >
              <Bell className="h-12 w-12 mb-4 opacity-30" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm mt-1">You&apos;re all caught up!</p>
            </motion.div>
          ) : (
            filtered.map((notif, idx) => {
              const config = typeConfig[notif.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8, height: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 group",
                    "border-b border-light-border dark:border-dark-border last:border-0",
                    !notif.is_read && "bg-primary-50/40 dark:bg-primary-900/10",
                    "hover:bg-slate-50 dark:hover:bg-dark-muted/50 transition-colors cursor-pointer"
                  )}
                  onClick={() => markRead(notif.id)}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center",
                    config.bg
                  )}>
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn(
                          "text-sm leading-tight",
                          !notif.is_read
                            ? "font-semibold text-slate-900 dark:text-white"
                            : "font-medium text-slate-700 dark:text-slate-300"
                        )}>
                          {notif.title}
                        </p>
                        <Badge variant={config.badge}>{notif.type}</Badge>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                        {!notif.is_read && (
                          <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0 ml-1" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.action_url && (
                      <Link
                        href={notif.action_url}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1.5 font-medium"
                      >
                        View details <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteOne(notif.id); }}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-danger-light hover:bg-danger-bg dark:hover:bg-red-900/20 transition-all"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
