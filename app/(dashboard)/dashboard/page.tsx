"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, Wallet, CreditCard, RefreshCw,
  ArrowUpRight, ArrowDownLeft, Copy, Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import AreaChart from "@/components/charts/AreaChart";
import DonutChart from "@/components/charts/DonutChart";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { accountsApi, transactionsApi, analyticsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import QuickActions from "@/components/dashboard/QuickActions";
import BalanceToggle from "@/components/dashboard/BalanceToggle";
import type { BankAccount, Transaction } from "@/types";

type NetWorth = { total_assets: number; bank_balance: number; investment_value: number; currency: string };
type Allocation = { asset_type: string; value: number; percentage: number };
type PortfolioHistoryData = { snapshots: { date: string; value: number }[] };

const ALLOC_COLORS = ["#2563eb","#0e84f1","#60a5fa","#93c5fd","#bfdbfe"];

export default function DashboardPage() {
  const { user } = useAuth();

  const [accounts,  setAccounts]  = useState<BankAccount[]>([]);
  const [txList,    setTxList]    = useState<Transaction[]>([]);
  const [netWorth,  setNetWorth]  = useState<NetWorth | null>(null);
  const [alloc,     setAlloc]     = useState<Allocation[]>([]);
  const [history,   setHistory]   = useState<{ date: string; value: number }[]>([]);
  const [txSummary, setTxSummary] = useState<{ totalIn: number; totalOut: number } | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [copied,    setCopied]    = useState(false);

  const primaryAccount = accounts.find(a => a.is_primary) ?? accounts[0] ?? null;

  const copyAccountNumber = useCallback(() => {
    if (!primaryAccount?.account_number) return;
    navigator.clipboard.writeText(primaryAccount.account_number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [primaryAccount]);

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [accsRes, txRes, nwRes, allocRes, histRes, summaryRes] = await Promise.allSettled([
          accountsApi.list(),
          transactionsApi.list({ per_page: "5" }),
          analyticsApi.netWorth(),
          analyticsApi.assetAllocation(),
          analyticsApi.portfolioHistory("1Y"),
          transactionsApi.summary(),
        ]);
        if (!mounted) return;
        if (accsRes.status === "fulfilled") setAccounts((accsRes.value.data ?? []) as BankAccount[]);
        if (txRes.status === "fulfilled")   setTxList((txRes.value.data ?? []) as Transaction[]);
        if (nwRes.status === "fulfilled")   setNetWorth(nwRes.value.data as NetWorth);
        if (allocRes.status === "fulfilled") setAlloc((allocRes.value.data ?? []) as Allocation[]);
        if (histRes.status === "fulfilled") {
          const h = histRes.value.data as PortfolioHistoryData;
          setHistory(h?.snapshots ?? []);
        }
        if (summaryRes.status === "fulfilled") setTxSummary(summaryRes.value.data as { totalIn: number; totalOut: number });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const totalBalance   = accounts.reduce((s, a) => s + (a.currency === "USD" ? a.balance : 0), 0);
  const portfolioValue = (netWorth?.investment_value ?? 0);
  const totalAssets    = (netWorth?.total_assets ?? 0);

  const donutData = alloc.map((a, i) => ({
    name: a.asset_type,
    value: a.percentage,
    color: ALLOC_COLORS[i % ALLOC_COLORS.length],
  }));

  const stats = [
    { label: "Total Portfolio", value: formatCurrency(portfolioValue, "USD"), change: "Live", positive: true,  icon: TrendingUp, color: "text-primary-500",     bg: "bg-primary-500/10"     },
    { label: "Bank Balance",    value: formatCurrency(totalBalance,    "USD"), change: "Live", positive: true,  icon: Wallet,     color: "text-success-light",   bg: "bg-success-light/10"   },
    { label: "Monthly In",      value: formatCurrency(txSummary?.totalIn ?? 0, "USD"), change: "Income",  positive: true, icon: CreditCard, color: "text-warning-light",   bg: "bg-warning-light/10"   },
    { label: "Monthly Out",     value: formatCurrency(txSummary?.totalOut ?? 0,"USD"), change: "Spend",   positive: false,icon: RefreshCw,  color: "text-evergreen-500",  bg: "bg-evergreen-500/10"   },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome hero */}
      <div className="card-gradient rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">{greeting},</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">{firstName} 👋</h2>
            <p className="text-white/60 text-sm mt-1">
              {loading ? "Loading your portfolio…" : `Net worth: ${formatCurrency(totalAssets, "USD")}`}
            </p>
            {/* Account number — prominent, copyable */}
            <div className="flex items-center gap-2 mt-3">
              {loading ? (
                <div className="h-8 w-44 bg-white/10 rounded-xl animate-pulse" />
              ) : primaryAccount ? (
                <button
                  onClick={copyAccountNumber}
                  title="Copy account number"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all px-3 py-1.5 rounded-xl group"
                >
                  <span className="text-white/50 text-xs font-medium uppercase tracking-wide">Acc No.</span>
                  <span className="text-white font-mono text-sm font-semibold tracking-widest">
                    {/* Format: pure 10 digits → XXX XXX XXXX
                                EG + 10 digits  → EG XXX XXX XXXX
                                anything else   → as-is */}
                    {/^\d{10}$/.test(primaryAccount.account_number)
                      ? primaryAccount.account_number.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")
                      : /^EG\d{10}$/.test(primaryAccount.account_number)
                        ? primaryAccount.account_number.replace(/^(EG)(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3 $4")
                        : primaryAccount.account_number}
                  </span>
                  {copied
                    ? <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                    : <Copy className="h-3.5 w-3.5 text-white/40 group-hover:text-white/70 flex-shrink-0 transition-colors" />}
                </button>
              ) : null}
            </div>
          </div>
          <BalanceToggle
            amount={totalAssets}
            currency="USD"
            loading={loading}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card group">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                {loading
                  ? <Skeleton width="48px" height="20px" rounded="full" />
                  : <Badge variant={s.positive ? "green" : "neutral"}>{s.change}</Badge>}
              </div>
              <div>
                {loading
                  ? <Skeleton width="140px" height="32px" className="mt-2" />
                  : <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>}
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <QuickActions />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <Badge variant="blue">1Y</Badge>
            </CardHeader>
            {loading
              ? <Skeleton height="220px" rounded="lg" />
              : history.length > 0
                ? <AreaChart data={history} color="#2563eb" currency="USD" height={220} showAxes showGrid />
                : <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Allocation</CardTitle></CardHeader>
          {loading
            ? <Skeleton height="180px" rounded="lg" />
            : donutData.length > 0
              ? (
                <div className="relative flex justify-center">
                  <DonutChart data={donutData} height={180} innerRadius={55} outerRadius={80} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(portfolioValue / 1000, "USD").replace(".00","")}K
                    </p>
                    <p className="text-xs text-slate-400">Total</p>
                  </div>
                </div>
              )
              : <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No investments yet</div>}
          <div className="mt-3 space-y-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0 mb-0">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/transactions">
            <Button variant="ghost" size="xs" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
              View all
            </Button>
          </Link>
        </CardHeader>
        {loading
          ? (
            <div className="p-5 space-y-3">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton width="36px" height="36px" rounded="lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton width="160px" height="14px" />
                    <Skeleton width="100px" height="12px" />
                  </div>
                  <Skeleton width="80px" height="20px" />
                </div>
              ))}
            </div>
          )
          : txList.length === 0
            ? <p className="text-center text-slate-400 py-10 text-sm">No transactions yet</p>
            : (
              <div className="divide-y divide-light-border dark:divide-dark-border">
                {txList.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 table-row-hover">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-dark-muted flex items-center justify-center flex-shrink-0">
                      {tx.amount > 0
                        ? <ArrowDownLeft className="h-4 w-4 text-success-light" />
                        : <ArrowUpRight  className="h-4 w-4 text-danger-light"  />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{tx.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{tx.category} · {formatRelativeTime(tx.created_at)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${tx.amount > 0 ? "positive" : "negative"}`}>
                        {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                      </p>
                      <Badge variant={tx.status === "completed" ? "green" : tx.status === "pending" ? "yellow" : "red"} className="mt-0.5">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </Card>
    </div>
  );
}
