"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, TrendingUp, Activity, ArrowUpRight, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const ADMIN_TOKEN_KEY = "eg_admin_token";
const NODE = process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000";

interface Stats {
  total_users: number;
  total_transactions: number;
  total_volume: number;
  active_visitors: number;
}

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  account_type: string;
  kyc_status: string;
  created_at: string;
}

interface RecentTx {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

async function adminFetch<T>(path: string): Promise<T> {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
  const res = await fetch(`${NODE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data as T;
}

export default function AdminOverviewPage() {
  const [stats,        setStats]       = useState<Stats | null>(null);
  const [recentUsers,  setRecentUsers] = useState<RecentUser[]>([]);
  const [recentTx,     setRecentTx]   = useState<RecentTx[]>([]);
  const [loading,      setLoading]    = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, txRes] = await Promise.allSettled([
        adminFetch<RecentUser[]>("/api/admin/users?limit=5"),
        adminFetch<RecentTx[]>("/api/admin/transactions?limit=5"),
      ]);
      if (usersRes.status === "fulfilled") setRecentUsers(usersRes.value);
      if (txRes.status   === "fulfilled") setRecentTx(txRes.value);

      // Compute stats from results
      setStats({
        total_users:        usersRes.status === "fulfilled" ? usersRes.value.length : 0,
        total_transactions: txRes.status    === "fulfilled" ? txRes.value.length    : 0,
        total_volume:       txRes.status    === "fulfilled"
          ? txRes.value.reduce((s, t) => s + Math.abs(t.amount), 0) : 0,
        active_visitors: 0,
      });
    } catch {
      // Silently show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const statCards = [
    { label: "Total Users",         value: stats?.total_users ?? 0,          format: (v: number) => v.toLocaleString(),            icon: Users,       color: "text-primary-500",    bg: "bg-primary-500/10"    },
    { label: "Total Transactions",  value: stats?.total_transactions ?? 0,    format: (v: number) => v.toLocaleString(),            icon: CreditCard,  color: "text-success-light",  bg: "bg-success-light/10"  },
    { label: "Transaction Volume",  value: stats?.total_volume ?? 0,          format: (v: number) => formatCurrency(v, "USD"),      icon: TrendingUp,  color: "text-warning-light",  bg: "bg-warning-light/10"  },
    { label: "Active Visitors",     value: stats?.active_visitors ?? 0,       format: (v: number) => v.toLocaleString(),            icon: Activity,    color: "text-violet-400",     bg: "bg-violet-400/10"     },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-3">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              {loading
                ? <Skeleton width="120px" height="28px" />
                : <p className="text-2xl font-bold text-white">{s.format(s.value)}</p>}
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent users */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-4">
            <CardTitle>Recent Users</CardTitle>
            <a href="/admin/users" className="text-xs text-primary-400 flex items-center gap-1 hover:underline">
              All users <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardHeader>
          {loading
            ? <div className="p-5 space-y-3">{[1,2,3].map(i => <Skeleton key={i} height="40px" />)}</div>
            : recentUsers.length === 0
              ? <p className="text-center text-slate-500 py-8 text-sm">No users yet</p>
              : (
                <div className="divide-y divide-dark-border">
                  {recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-dark-muted/50 transition-colors">
                      <div className="h-9 w-9 rounded-full bg-gradient-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{u.full_name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge variant={u.kyc_status === "verified" ? "green" : u.kyc_status === "rejected" ? "red" : "yellow"}>
                          {u.kyc_status}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-0.5">{formatDate(u.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </Card>

        {/* Recent transactions */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-4">
            <CardTitle>Recent Transactions</CardTitle>
            <a href="/admin/transactions" className="text-xs text-primary-400 flex items-center gap-1 hover:underline">
              All <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardHeader>
          {loading
            ? <div className="p-5 space-y-3">{[1,2,3].map(i => <Skeleton key={i} height="40px" />)}</div>
            : recentTx.length === 0
              ? <p className="text-center text-slate-500 py-8 text-sm">No transactions yet</p>
              : (
                <div className="divide-y divide-dark-border">
                  {recentTx.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-dark-muted/50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                        <p className="text-xs text-slate-400">{formatDate(tx.created_at)}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className={`text-sm font-semibold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                          {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                        </p>
                        <Badge variant={tx.status === "completed" ? "green" : tx.status === "pending" ? "yellow" : "red"}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </Card>
      </div>
    </div>
  );
}
