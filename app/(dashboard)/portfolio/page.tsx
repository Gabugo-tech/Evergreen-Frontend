"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Plus, Search, RefreshCw, Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AreaChart from "@/components/charts/AreaChart";
import DonutChart from "@/components/charts/DonutChart";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────
const PORTFOLIO_HISTORY: Record<string, { date: string; value: number }[]> = {
  "1M": [
    { date: "Nov 11", value: 118200 }, { date: "Nov 15", value: 120100 },
    { date: "Nov 19", value: 117800 }, { date: "Nov 23", value: 121400 },
    { date: "Nov 27", value: 119900 }, { date: "Dec 1",  value: 122300 },
    { date: "Dec 5",  value: 124650 },
  ],
  "3M": [
    { date: "Sep", value: 108500 }, { date: "Oct", value: 115200 },
    { date: "Nov", value: 119900 }, { date: "Dec", value: 124650 },
  ],
  "6M": [
    { date: "Jul", value: 102300 }, { date: "Aug", value: 99800 },
    { date: "Sep", value: 108500 }, { date: "Oct", value: 115200 },
    { date: "Nov", value: 112800 }, { date: "Dec", value: 124650 },
  ],
  "1Y": [
    { date: "Jan", value: 82000 },  { date: "Feb", value: 79500 },
    { date: "Mar", value: 85200 },  { date: "Apr", value: 91000 },
    { date: "May", value: 88400 },  { date: "Jun", value: 95700 },
    { date: "Jul", value: 102300 }, { date: "Aug", value: 99800 },
    { date: "Sep", value: 108500 }, { date: "Oct", value: 115200 },
    { date: "Nov", value: 112800 }, { date: "Dec", value: 124650 },
  ],
};

const HOLDINGS = [
  { id:"1", symbol:"AAPL", name:"Apple Inc.",      type:"stock",   qty:100,  avg:142.30, current:189.45, currency:"USD", logo:"🍎" },
  { id:"2", symbol:"MSFT", name:"Microsoft Corp.", type:"stock",   qty:30,   avg:298.10, current:415.20, currency:"USD", logo:"🪟" },
  { id:"3", symbol:"NVDA", name:"Nvidia Corp.",    type:"stock",   qty:10,   avg:480.00, current:875.50, currency:"USD", logo:"🟢" },
  { id:"4", symbol:"BTC",  name:"Bitcoin",         type:"crypto",  qty:0.1,  avg:52000,  current:67250,  currency:"USD", logo:"₿" },
  { id:"5", symbol:"ETH",  name:"Ethereum",        type:"crypto",  qty:1.5,  avg:2800,   current:3580,   currency:"USD", logo:"Ξ" },
  { id:"6", symbol:"VOO",  name:"Vanguard S&P 500",type:"etf",     qty:25,   avg:410.00, current:498.20, currency:"USD", logo:"📊" },
  { id:"7", symbol:"QQQ",  name:"Invesco QQQ",     type:"etf",     qty:15,   avg:355.00, current:498.75, currency:"USD", logo:"📈" },
  { id:"8", symbol:"TSLA", name:"Tesla Inc.",      type:"stock",   qty:20,   avg:198.00, current:245.30, currency:"USD", logo:"⚡" },
];

const ALLOCATION = [
  { name: "US Stocks", value: 42, color: "#2563eb" },
  { name: "Crypto",    value: 18, color: "#0e84f1" },
  { name: "ETFs",      value: 24, color: "#60a5fa" },
  { name: "Bonds",     value: 10, color: "#93c5fd" },
  { name: "Cash",      value: 6,  color: "#bfdbfe" },
];

type Period = "1M" | "3M" | "6M" | "1Y";
type AssetFilter = "all" | "stock" | "etf" | "crypto" | "bond";

const typeColor: Record<string, string> = {
  stock:  "blue",
  etf:    "green",
  crypto: "yellow",
  bond:   "neutral",
};

export default function PortfolioPage() {
  const [period, setPeriod]         = useState<Period>("1Y");
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [search, setSearch]         = useState("");

  // Stable day-change values — initialised once, won't flicker on re-renders
  const stableDayChanges = useMemo(
    () => HOLDINGS.map(() => +(Math.random() * 4 - 1).toFixed(2)),
    []
  );

  const holdings = useMemo(
    () =>
      HOLDINGS.map((h, i) => {
        const marketValue = +(h.qty * h.current).toFixed(2);
        const invested    = +(h.qty * h.avg).toFixed(2);
        const gainLoss    = +(marketValue - invested).toFixed(2);
        const gainLossPct = +((gainLoss / invested) * 100).toFixed(2);
        return { ...h, marketValue, invested, gainLoss, gainLossPct, dayChange: stableDayChanges[i] };
      }),
    [stableDayChanges]
  );

  const totalValue    = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const totalGainLoss = totalValue - totalInvested;
  const totalGLPct    = ((totalGainLoss / totalInvested) * 100).toFixed(2);
  const dayChange     = +(totalValue * 0.0143).toFixed(2);

  const filtered = holdings.filter((h) => {
    if (assetFilter !== "all" && h.type !== assetFilter) return false;
    if (search && !h.symbol.toLowerCase().includes(search.toLowerCase()) &&
                  !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track your investments and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Add Investment
          </Button>
        </div>
      </div>

      {/* Summary hero */}
      <div className="card-gradient rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: "Total Value",    value: formatCurrency(totalValue, "USD"),    sub: null },
            { label: "Total Invested", value: formatCurrency(totalInvested, "USD"), sub: null },
            { label: "Total Return",   value: formatCurrency(totalGainLoss, "USD"), sub: `${Number(totalGLPct) >= 0 ? "+" : ""}${totalGLPct}%`, positive: Number(totalGLPct) >= 0 },
            { label: "Day Change",     value: formatCurrency(dayChange, "USD"),     sub: "+1.43%", positive: true },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white/60 text-xs font-medium mb-1">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
              {s.sub && (
                <p className={cn("text-xs mt-0.5 font-medium", s.positive ? "text-green-300" : "text-red-300")}>
                  {s.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <div className="flex gap-1 p-1 bg-light-muted dark:bg-dark-muted rounded-lg">
                {(["1M","3M","6M","1Y"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      period === p
                        ? "bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </CardHeader>
            <AreaChart
              data={PORTFOLIO_HISTORY[period]}
              color="#2563eb"
              currency="USD"
              height={220}
              showAxes
              showGrid
            />
          </Card>
        </div>

        {/* Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <div className="relative flex justify-center">
            <DonutChart data={ALLOCATION} height={180} innerRadius={52} outerRadius={78} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalValue / 1000, "USD").replace("$", "$")}K
              </p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {ALLOCATION.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{a.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{a.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Holdings table */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-4 flex flex-wrap items-center justify-between gap-3 border-b border-light-border dark:border-dark-border">
          <CardTitle>Holdings ({holdings.length})</CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base pl-9 py-2 w-44 text-sm"
              />
            </div>
            {/* Asset type filter */}
            <div className="flex gap-1.5">
              {(["all","stock","etf","crypto"] as AssetFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setAssetFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                    assetFilter === f
                      ? "bg-primary-600 text-white"
                      : "bg-light-muted dark:bg-dark-muted text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-border"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border bg-light-muted/50 dark:bg-dark-muted/50">
                {["Asset","Type","Quantity","Avg Price","Current Price","Market Value","Return","Day"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-5 py-3 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id} className="border-b border-light-border/50 dark:border-dark-border/50 last:border-0 hover:bg-slate-50 dark:hover:bg-dark-muted/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-blue flex items-center justify-center text-base flex-shrink-0">
                        {h.logo}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{h.symbol}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[120px]">{h.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={typeColor[h.type] as "blue" | "green" | "yellow" | "neutral"}>
                      {h.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-mono">{h.qty}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                    {formatCurrency(h.avg, h.currency)}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(h.current, h.currency)}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(h.marketValue, h.currency)}
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className={cn("font-semibold text-sm", h.gainLoss >= 0 ? "positive" : "negative")}>
                        {h.gainLoss >= 0 ? "+" : ""}{formatCurrency(h.gainLoss, h.currency)}
                      </p>
                      <p className={cn("text-xs", h.gainLossPct >= 0 ? "positive" : "negative")}>
                        {formatPercent(h.gainLossPct)}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className={cn("flex items-center gap-1 text-sm font-medium", h.dayChange >= 0 ? "positive" : "negative")}>
                      {h.dayChange >= 0
                        ? <TrendingUp className="h-3.5 w-3.5" />
                        : <TrendingDown className="h-3.5 w-3.5" />}
                      {formatPercent(h.dayChange)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3.5 border-t border-light-border dark:border-dark-border bg-light-muted/30 dark:bg-dark-muted/30">
          <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Info className="h-4 w-4" />
              <span>Prices update every 15 minutes</span>
            </div>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <span>Total Invested: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalInvested, "USD")}</span></span>
              <span>Total Value: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalValue, "USD")}</span></span>
              <span className={cn("font-semibold", totalGainLoss >= 0 ? "positive" : "negative")}>
                {totalGainLoss >= 0 ? "+" : ""}{formatCurrency(totalGainLoss, "USD")} ({Number(totalGLPct) >= 0 ? "+" : ""}{totalGLPct}%)
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
