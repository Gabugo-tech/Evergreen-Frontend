"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell, CheckCheck, Trash2, ArrowUpRight,
  TrendingUp, Shield, CreditCard, Info, Gift, RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

type NotifType = "transaction" | "security" | "payment" | "system" | "investment" | "promo";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

const typeConfig: Record<NotifType, {
  icon: React.ElementType;
  color: string;
  bg: string;
  badge: "blue" | "red" | "green" | "yellow" | "neutral" | "purple";
}> = {
  transaction: { icon: CreditCard,   color: "text-primary-600 dark:text-primary-400", bg: "bg-primary-100 dark:bg-primary-900/30",   badge: "blue"    },
  security:    { icon: Shield,       color: "text-danger-light",                       bg: "bg-danger-bg dark:bg-red-900/20",          badge: "red"     },
  payment:     { icon: ArrowUpRight, color: "text-success-light",                      bg: "bg-success-bg dark:bg-green-900/20",       badge: "green"   },
  system:      { icon: Info,         color: "text-slate-500 dark:text-slate-400",      bg: "bg-slate-100 dark:bg-dark-muted",          badge: "neutral" },
  investment:  { icon: TrendingUp,   color: "text-evergreen-500",                      bg: "bg-evergreen-50 dark:bg-evergreen-900/20", badge: "blue"    },
  promo:       { icon: Gift,         color: "text-warning-light",                      bg: "bg-warning-bg dark:bg-yellow-900/20",      badge: "yellow"  },
};

type FilterType = "all" | NotifType;

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "all",         label: "All"          },
  { value: "transaction", label: "Transactions" },
  { value: "payment",     label: "Payments"     },
  { value: "investment",  label: "Investments"  },
  { value: "security",    label: "Security"     },
  { value: "system",      label: "System"       },
  { value: "promo",       label: "Promotions"   },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter,        setFilter]        = useState<FilterType>("all");
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list();
      setNotifications((res.data ?? []) as Notification[]);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const deleteOne = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { /* silent */ }
  };

  const clearAll = async () => {
    try {
      await notificationsApi.clearAll();
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

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
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={load}>
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={markAllRead}>
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost" size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={clearAll}
              className="text-danger-light hover:bg-danger-bg dark:hover:bg-red-900/20"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Unread",      value: unreadCount,                                           color: "text-danger-light"               },
          { label: "Total",       value: notifications.length,                                  color: "text-slate-900 dark:text-white"  },
          { label: "Security",    value: notifications.filter(n => n.type === "security").length, color: "text-danger-light"             },
          { label: "Investments", value: notifications.filter(n => n.type === "investment").length, color: "text-success-light"          },
        ].map((s) => (
          <div key={s.label} className="stat-card py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            {loading
              ? <Skeleton width="40px" height="28px" />
              : <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>}
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
                  filter === value
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 dark:bg-dark-border text-slate-600 dark:text-slate-400"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <Card padding="none">
        {loading ? (
          <div className="p-5 space-y-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton width="40px" height="40px" rounded="lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="200px" height="14px" />
                  <Skeleton width="320px" height="12px" />
                </div>
              </div>
            ))}
          </div>
        ) : (
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
                const config = typeConfig[notif.type] ?? typeConfig.system;
                const Icon   = config.icon;
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
                    <div className={cn("flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center", config.bg)}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>

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
        )}
      </Card>
    </div>
  );
}
