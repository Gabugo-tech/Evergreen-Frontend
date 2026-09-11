import type { Metadata } from "next";
import {
  Plus, ArrowUpRight, ArrowDownLeft, CreditCard,
  Landmark, Eye, Copy, Send, Download,
} from "lucide-react";import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import BarChart from "@/components/charts/BarChart";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Banking" };

const accounts = [
  {
    id: "acc1",
    account_name: "Primary Checking",
    account_number: "4729183056",
    account_type: "checking",
    currency: "USD",
    balance: 18420.50,
    available_balance: 17900.00,
    is_primary: true,
    color: "from-primary-700 to-primary-500",
    cardBg: "bg-gradient-to-br from-primary-700 to-primary-500",
  },
  {
    id: "acc2",
    account_name: "Savings",
    account_number: "8831049274",
    account_type: "savings",
    currency: "USD",
    balance: 5960.00,
    available_balance: 5960.00,
    is_primary: false,
    color: "from-violet-700 to-violet-500",
    cardBg: "bg-gradient-to-br from-violet-700 to-violet-500",
  },
  {
    id: "acc3",
    account_name: "EUR Account",
    account_number: "6614027389",
    account_type: "checking",
    currency: "EUR",
    balance: 3240.80,
    available_balance: 3240.80,
    is_primary: false,
    color: "from-teal-700 to-teal-500",
    cardBg: "bg-gradient-to-br from-teal-700 to-teal-500",
  },
];

const monthlySpend = [
  { label: "Jul", value: 3100 },
  { label: "Aug", value: 2800 },
  { label: "Sep", value: 3450 },
  { label: "Oct", value: 2950 },
  { label: "Nov", value: 3800 },
  { label: "Dec", value: 3240 },
];

const recentActivity = [
  { id: "1", desc: "Salary Deposit",    amount: 5400,   currency: "USD", type: "credit", date: "Dec 1, 2026",  status: "completed", category: "Income" },
  { id: "2", desc: "Rent Payment",      amount: -1800,  currency: "USD", type: "debit",  date: "Dec 1, 2026",  status: "completed", category: "Housing" },
  { id: "3", desc: "Grocery Store",     amount: -124.5, currency: "USD", type: "debit",  date: "Nov 30, 2026", status: "completed", category: "Food" },
  { id: "4", desc: "Freelance Payment", amount: 800,    currency: "USD", type: "credit", date: "Nov 29, 2026", status: "completed", category: "Income" },
  { id: "5", desc: "Electric Bill",     amount: -94.2,  currency: "USD", type: "debit",  date: "Nov 28, 2026", status: "completed", category: "Utilities" },
  { id: "6", desc: "Transfer from EUR", amount: 340,    currency: "USD", type: "credit", date: "Nov 27, 2026", status: "completed", category: "Transfer" },
];

const categoryBreakdown = [
  { name: "Housing",     amount: 1800, color: "#2563eb", pct: 42 },
  { name: "Food",        amount: 520,  color: "#0e84f1", pct: 12 },
  { name: "Transport",   amount: 380,  color: "#60a5fa", pct: 9  },
  { name: "Utilities",   amount: 260,  color: "#93c5fd", pct: 6  },
  { name: "Entertainment", amount: 280, color: "#3b82f6", pct: 7 },
  { name: "Other",       amount: 1300, color: "#bfdbfe", pct: 24 },
];

export default function BankingPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Banking</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your accounts and track spending
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} size="sm">
          Add Account
        </Button>
      </div>

      {/* Account cards — horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className={`${acc.cardBg} flex-shrink-0 w-72 rounded-2xl p-5 relative overflow-hidden shadow-lg`}
          >
            {/* Card shine */}
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-white/80" />
                  <span className="text-white/80 text-sm font-medium">{acc.account_name}</span>
                </div>
                {acc.is_primary && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                    Primary
                  </span>
                )}
              </div>

              <p className="text-2xl font-bold text-white mb-1">
                {formatCurrency(acc.balance, acc.currency)}
              </p>
              <p className="text-white/60 text-xs">
                Available: {formatCurrency(acc.available_balance, acc.currency)}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-white/60" />
                  <span className="text-white/70 text-sm font-mono tracking-wider">
                    {maskAccountNumber(acc.account_number)}
                  </span>
                </div>
                <button
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="Copy account number"
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
                  <Download className="h-3.5 w-3.5" /> Receive
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
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Balance", value: 27621.30, currency: "USD", change: "+2.4%", positive: true },
          { label: "Monthly Income", value: 6200, currency: "USD", change: "+8.1%", positive: true },
          { label: "Monthly Spend",  value: 3240, currency: "USD", change: "-5.2%", positive: true },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(s.value, s.currency)}
            </p>
            <Badge variant={s.positive ? "green" : "red"}>{s.change} vs last month</Badge>
          </div>
        ))}
      </div>

      {/* Chart + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
              <Badge variant="neutral">Last 6 months</Badge>
            </CardHeader>
            <BarChart data={monthlySpend} color="#2563eb" height={200} showGrid currency="USD" />
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {categoryBreakdown.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">{c.name}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {formatCurrency(c.amount, "USD")}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-dark-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${c.pct}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0 mb-0">
          <CardTitle>Recent Activity</CardTitle>
          <Link href="/transactions">
            <Button variant="ghost" size="xs" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
              All transactions
            </Button>
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border">
                {["Description", "Category", "Date", "Status", "Amount"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((tx) => (
                <tr key={tx.id} className="table-row-hover border-b border-light-border/50 dark:border-dark-border/50 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-dark-muted flex items-center justify-center flex-shrink-0">
                        {tx.type === "credit"
                          ? <ArrowDownLeft className="h-4 w-4 text-success-light" />
                          : <ArrowUpRight className="h-4 w-4 text-danger-light" />}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{tx.desc}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="neutral">{tx.category}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{tx.date}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="green">{tx.status}</Badge>
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
