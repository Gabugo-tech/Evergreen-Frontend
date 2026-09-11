import type { Metadata } from "next";
import {
  TrendingUp, Wallet, RefreshCw,
  ArrowUpRight, ArrowDownLeft, CreditCard,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AreaChart from "@/components/charts/AreaChart";
import DonutChart from "@/components/charts/DonutChart";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import QuickActions from "@/components/dashboard/QuickActions";
import BalanceToggle from "@/components/dashboard/BalanceToggle";

export const metadata: Metadata = { title: "Dashboard" };

// ─── Mock data ────────────────────────────────────────────────────────────────
const portfolioHistory = [
  { date: "Jan", value: 82000 },
  { date: "Feb", value: 79500 },
  { date: "Mar", value: 85200 },
  { date: "Apr", value: 91000 },
  { date: "May", value: 88400 },
  { date: "Jun", value: 95700 },
  { date: "Jul", value: 102300 },
  { date: "Aug", value: 99800 },
  { date: "Sep", value: 108500 },
  { date: "Oct", value: 115200 },
  { date: "Nov", value: 112800 },
  { date: "Dec", value: 124650 },
];

const allocationData = [
  { name: "US Stocks", value: 42, color: "#2563eb" },
  { name: "Crypto",    value: 18, color: "#0e84f1" },
  { name: "ETFs",      value: 24, color: "#60a5fa" },
  { name: "Bonds",     value: 10, color: "#93c5fd" },
  { name: "Cash",      value: 6,  color: "#bfdbfe" },
];

const recentTransactions = [
  {
    id: "1",
    description: "Netflix Subscription",
    category: "Entertainment",
    amount: -15.99,
    currency: "USD",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: "debit",
    status: "completed",
  },
  {
    id: "2",
    description: "Salary Deposit",
    category: "Income",
    amount: 5400.00,
    currency: "USD",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    type: "credit",
    status: "completed",
  },
  {
    id: "3",
    description: "Transfer to Sarah",
    category: "Transfer",
    amount: -250.00,
    currency: "USD",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    type: "debit",
    status: "completed",
  },
  {
    id: "4",
    description: "Amazon Purchase",
    category: "Shopping",
    amount: -89.99,
    currency: "USD",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    type: "debit",
    status: "completed",
  },
  {
    id: "5",
    description: "Dividend — AAPL",
    category: "Investment",
    amount: 127.40,
    currency: "USD",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    type: "credit",
    status: "completed",
  },
];

const topHoldings = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.45, change: 1.23, value: 18945 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 415.20, change: -0.54, value: 12456 },
  { symbol: "NVDA", name: "Nvidia Corp.", price: 875.50, change: 3.87, value: 8755 },
  { symbol: "BTC",  name: "Bitcoin",      price: 67250,  change: 2.14, value: 6725 },
];

const stats = [
  {
    label: "Total Portfolio",
    value: 124650,
    change: 8.4,
    positive: true,
    currency: "USD",
    icon: TrendingUp,
    color: "text-primary-500",
    bg: "bg-primary-500/10",
  },
  {
    label: "Bank Balance",
    value: 24380,
    change: 12.1,
    positive: true,
    currency: "USD",
    icon: Wallet,
    color: "text-success-light",
    bg: "bg-success-light/10",
  },
  {
    label: "Monthly Spend",
    value: 3240,
    change: -5.2,
    positive: false,
    currency: "USD",
    icon: CreditCard,
    color: "text-warning-light",
    bg: "bg-warning-light/10",
  },
  {
    label: "Pending Transfers",
    value: 1200,
    change: 0,
    positive: true,
    currency: "USD",
    icon: RefreshCw,
    color: "text-evergreen-500",
    bg: "bg-evergreen-500/10",
  },
];

function categoryIcon(type: string) {
  return type === "credit"
    ? <ArrowDownLeft className="h-4 w-4 text-success-light" />
    : <ArrowUpRight className="h-4 w-4 text-danger-light" />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome + balance hero */}
      <div className="card-gradient rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Good morning,</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">Gabriel 👋</h2>
            <p className="text-white/60 text-sm mt-1">
              Your portfolio is up <span className="text-white font-semibold">+$4,200</span> this month.
            </p>
          </div>
          <BalanceToggle amount={124650} currency="USD" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card group">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant={stat.change === 0 ? "neutral" : stat.positive ? "green" : "red"}>
                  {stat.change === 0
                    ? "—"
                    : `${stat.positive ? "+" : ""}${stat.change}%`}
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stat.value, stat.currency)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <QuickActions />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio growth chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="green" dot>
                  +51.9% YTD
                </Badge>
                <select className="text-xs bg-transparent text-slate-500 dark:text-slate-400 focus:outline-none cursor-pointer">
                  <option>1Y</option>
                  <option>6M</option>
                  <option>3M</option>
                  <option>1M</option>
                </select>
              </div>
            </CardHeader>
            <AreaChart
              data={portfolioHistory}
              color="#2563eb"
              currency="USD"
              height={220}
              showAxes
              showGrid
            />
          </Card>
        </div>

        {/* Allocation donut */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <div className="relative flex justify-center">
            <DonutChart
              data={allocationData}
              height={180}
              innerRadius={55}
              outerRadius={80}
            />
            {/* Center overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xl font-bold text-slate-900 dark:text-white">$124.6K</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: transactions + holdings */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Recent transactions */}
        <div className="xl:col-span-3">
          <Card padding="none">
            <CardHeader className="px-5 pt-5 pb-0 mb-0">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/transactions">
                <Button variant="ghost" size="xs" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                  View all
                </Button>
              </Link>
            </CardHeader>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 table-row-hover">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-dark-muted flex items-center justify-center flex-shrink-0">
                    {categoryIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {tx.category} · {formatRelativeTime(tx.created_at)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        tx.amount > 0 ? "positive" : "negative"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatCurrency(Math.abs(tx.amount), tx.currency)}
                    </p>
                    <Badge variant={tx.status === "completed" ? "green" : "yellow"} className="mt-0.5">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top holdings */}
        <div className="xl:col-span-2">
          <Card padding="none">
            <CardHeader className="px-5 pt-5 pb-0 mb-0">
              <CardTitle>Top Holdings</CardTitle>
              <Link href="/portfolio">
                <Button variant="ghost" size="xs" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                  Portfolio
                </Button>
              </Link>
            </CardHeader>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {topHoldings.map((h) => (
                <div key={h.symbol} className="flex items-center gap-3 px-5 py-3.5 table-row-hover">
                  <div className="h-9 w-9 rounded-xl bg-gradient-blue flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{h.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {h.symbol}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{h.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(h.value, "USD")}
                    </p>
                    <p className={`text-xs font-medium ${h.change >= 0 ? "positive" : "negative"}`}>
                      {h.change >= 0 ? "+" : ""}{h.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
