"use client";

import { useEffect, useState } from "react";
import {
  Plus, ArrowUpRight, ArrowDownLeft, CreditCard,
  Landmark, Eye, Copy, Send, RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import BarChart from "@/components/charts/BarChart";
import { formatCurrency, formatDate } from "@/lib/utils";
import { accountsApi, transactionsApi, analyticsApi } from "@/lib/api";
import type { BankAccount, Transaction } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";

const CARD_GRADIENTS = [
  "bg-gradient-to-br from-primary-700 to-primary-500",
  "bg-gradient-to-br from-violet-700 to-violet-500",
  "bg-gradient-to-br from-teal-700 to-teal-500",
  "bg-gradient-to-br from-emerald-700 to-emerald-500",
];

interface SpendTrend { month: string; income: number; expenses: number; net: number }
interface CategoryBreakdown { category: string; total: number; percentage: number }

export default function BankingPage() {
  const [accounts,  setAccounts]  = useState<BankAccount[]>([]);
  const [txList,    setTxList]    = useState<Transaction[]>([]);
  const [trends,    setTrends]    = useState<SpendTrend[]>([]);
  const [catBreak,  setCatBreak]  = useState<CategoryBreakdown[]>([]);
  const [loading,   setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [accsRes, txRes, trendsRes, catRes] = await Promise.allSettled([
        accountsApi.list(),
        transactionsApi.list({ per_page: "10" }),
        analyticsApi.monthlyTrends(6),
        analyticsApi.spendingByCategory(),
      ]);
      if (accsRes.status   === "fulfilled") setAccounts((accsRes.value.data ?? []) as BankAccount[]);
      if (txRes.status     === "fulfilled") setTxList((txRes.value.data ?? []) as Transaction[]);
      if (trendsRes.status === "fulfilled") setTrends((trendsRes.value.data ?? []) as SpendTrend[]);
      if (catRes.status    === "fulfilled") setCatBreak((catRes.value.data ?? []) as CategoryBreakdown[]);
    } catch {
      toast.error("Failed to load banking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalBalance   = accounts.reduce((s, a) => s + a.balance, 0);
  const primaryAccount = accounts.find(a => a.is_primary);

  // Build bar chart data from monthly trends
  const barData = trends.map(t => ({
    label: t.month.slice(0, 3),
    value: t.expenses,
  }));

  // Summary stats
  const monthlyIncome  = trends[trends.length - 1]?.income    ?? 0;
  const monthlyExpense = trends[trends.length - 1]?.expenses  ?? 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Banking</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your accounts and track spending</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={load}>Refresh</Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Account</Button>
        </div>
      </div>

      {/* Account cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {loading
          ? [1,2,3].map(i => <Skeleton key={i} width="288px" height="200px" rounded="lg" className="flex-shrink-0" />)
          : (
            <>
              {accounts.map((acc, idx) => (
                <div key={acc.id} className={`${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]} flex-shrink-0 w-72 rounded-2xl p-5 relative overflow-hidden shadow-lg`}>
                  <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-white/80" />
                        <span className="text-white/80 text-sm font-medium">{acc.account_name}</span>
                      </div>
                      {acc.is_primary && (
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">Primary</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{formatCurrency(acc.balance, acc.currency)}</p>
                    <p className="text-white/60 text-xs">Available: {formatCurrency(acc.available_balance, acc.currency)}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-white/60" />
                        <span className="text-white/70 text-sm font-mono tracking-wider">
                          {acc.account_number.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}
                        </span>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(acc.account_number); toast.success("Copied!"); }}
                        className="text-white/60 hover:text-white transition-colors" aria-label="Copy account number"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href="/payments" className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3 py-2 rounded-xl transition-all">
                          <Send className="h-3.5 w-3.5" /> Send
                        </button>
                      </Link>
                      <button className="flex-1 flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3 py-2 rounded-xl transition-all">
                        <ArrowDownLeft className="h-3.5 w-3.5" /> Receive
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3 py-2 rounded-xl transition-all">
                        <Eye className="h-3.5 w-3.5" /> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {/* Add account card */}
              <button className="flex-shrink-0 w-72 rounded-2xl border-2 border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-all min-h-[200px]">
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add Account</span>
              </button>
            </>
          )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Balance",   value: totalBalance,    currency: primaryAccount?.currency ?? "USD", positive: true,  change: "Live"    },
          { label: "Monthly Income",  value: monthlyIncome,   currency: "USD",                             positive: true,  change: "This month" },
          { label: "Monthly Spend",   value: monthlyExpense,  currency: "USD",                             positive: false, change: "This month" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            {loading
              ? <Skeleton width="160px" height="32px" />
              : <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(s.value, s.currency)}</p>}
            <Badge variant={s.positive ? "green" : "neutral"}>{s.change}</Badge>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
              <Badge variant="neutral">Last 6 months</Badge>
            </CardHeader>
            {loading
              ? <Skeleton height="200px" rounded="lg" />
              : barData.length > 0
                ? <BarChart data={barData} color="#2563eb" height={200} showGrid currency="USD" />
                : <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No spending data yet</div>}
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Spend by Category</CardTitle></CardHeader>
          {loading
            ? <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} height="32px" />)}</div>
            : catBreak.length === 0
              ? <div className="text-center text-slate-400 py-8 text-sm">No spending data yet</div>
              : (
                <div className="space-y-3">
                  {catBreak.slice(0, 6).map((c) => (
                    <div key={c.category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">{c.category}</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(c.total, "USD")}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-dark-muted overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-blue transition-all duration-700"
                          style={{ width: `${Math.min(c.percentage, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </Card>
      </div>

      {/* Recent activity table */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0 mb-0">
          <CardTitle>Recent Activity</CardTitle>
          <Link href="/transactions">
            <Button variant="ghost" size="xs" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>All transactions</Button>
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border">
                {["Description","Category","Date","Status","Amount"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3].map(i => (
                  <tr key={i}><td colSpan={5} className="px-5 py-3"><Skeleton height="36px" /></td></tr>
                ))
                : txList.length === 0
                  ? <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">No transactions yet</td></tr>
                  : txList.map((tx) => (
                    <tr key={tx.id} className="table-row-hover border-b border-light-border/50 dark:border-dark-border/50 last:border-0">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-dark-muted flex items-center justify-center flex-shrink-0">
                            {tx.amount > 0
                              ? <ArrowDownLeft className="h-4 w-4 text-success-light" />
                              : <ArrowUpRight  className="h-4 w-4 text-danger-light"  />}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{tx.description}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><Badge variant="neutral">{tx.category}</Badge></td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{formatDate(tx.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={tx.status === "completed" ? "green" : tx.status === "pending" ? "yellow" : "red"}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold">
                        <span className={tx.amount > 0 ? "positive" : "negative"}>
                          {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
