"use client";

import { useEffect, useState, useMemo } from "react";
import { TrendingUp, Plus, Search, RefreshCw, Info } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import AreaChart from "@/components/charts/AreaChart";
import DonutChart from "@/components/charts/DonutChart";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { investmentsApi, analyticsApi } from "@/lib/api";
import toast from "react-hot-toast";

type Period = "1M" | "3M" | "6M" | "1Y";
type AssetFilter = "all" | "stock" | "etf" | "crypto" | "bond";

interface Holding {
  id: string; symbol: string; name: string; asset_type: string;
  quantity: number; avg_buy_price: number; current_price: number;
  currency: string; market_value: number; gain_loss: number;
  gain_loss_pct: number;
}
interface Allocation { asset_type: string; value: number; percentage: number }
interface PortfolioMetrics {
  total_value: number; total_invested: number; total_gain_loss: number;
  total_gain_loss_pct: number; day_change: number; day_change_pct: number;
}
interface HistoryData { snapshots: { date: string; value: number }[] }

const ALLOC_COLORS = ["#2563eb","#0e84f1","#60a5fa","#93c5fd","#bfdbfe","#3b82f6"];
const typeColorMap: Record<string, "blue"|"green"|"yellow"|"neutral"> = {
  stock:"blue", etf:"green", crypto:"yellow", bond:"neutral", mutual_fund:"neutral",
};

export default function PortfolioPage() {
  const [period,      setPeriod]      = useState<Period>("1Y");
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [search,      setSearch]      = useState("");
  const [holdings,    setHoldings]    = useState<Holding[]>([]);
  const [alloc,       setAlloc]       = useState<Allocation[]>([]);
  const [metrics,     setMetrics]     = useState<PortfolioMetrics | null>(null);
  const [history,     setHistory]     = useState<{ date: string; value: number }[]>([]);
  const [loading,     setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [holdRes, allocRes, metRes, histRes] = await Promise.allSettled([
        investmentsApi.list(),
        analyticsApi.assetAllocation(),
        analyticsApi.portfolioMetrics(),
        analyticsApi.portfolioHistory(period),
      ]);
      if (holdRes.status  === "fulfilled") setHoldings((holdRes.value.data  ?? []) as Holding[]);
      if (allocRes.status === "fulfilled") setAlloc((allocRes.value.data    ?? []) as Allocation[]);
      if (metRes.status   === "fulfilled") setMetrics(metRes.value.data as PortfolioMetrics);
      if (histRes.status  === "fulfilled") setHistory(((histRes.value.data as HistoryData)?.snapshots ?? []));
    } catch { toast.error("Failed to load portfolio"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, [period]);

  const donutData = alloc.map((a, i) => ({ name: a.asset_type, value: a.percentage, color: ALLOC_COLORS[i % ALLOC_COLORS.length] }));
  const filtered  = useMemo(() => holdings.filter(h => {
    if (assetFilter !== "all" && h.asset_type !== assetFilter) return false;
    if (search && !h.symbol.toLowerCase().includes(search.toLowerCase()) && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [holdings, assetFilter, search]);

  const tv  = metrics?.total_value      ?? 0;
  const ti  = metrics?.total_invested   ?? 0;
  const tgl = metrics?.total_gain_loss  ?? 0;
  const tgp = metrics?.total_gain_loss_pct ?? 0;
  const dc  = metrics?.day_change       ?? 0;
  const dcp = metrics?.day_change_pct   ?? 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track your investments and performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={load}>Refresh</Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Investment</Button>
        </div>
      </div>

      {/* Hero */}
      <div className="card-gradient rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label:"Total Value",    val: loading?"—":formatCurrency(tv,"USD"),  sub:null },
            { label:"Total Invested", val: loading?"—":formatCurrency(ti,"USD"),  sub:null },
            { label:"Total Return",   val: loading?"—":formatCurrency(tgl,"USD"), sub:`${tgp>=0?"+":""}${tgp.toFixed(2)}%`, pos:tgp>=0 },
            { label:"Day Change",     val: loading?"—":formatCurrency(dc,"USD"),  sub:`${dcp>=0?"+":""}${dcp.toFixed(2)}%`, pos:dcp>=0 },
          ].map(s => (
            <div key={s.label}>
              <p className="text-white/60 text-xs font-medium mb-1">{s.label}</p>
              {loading ? <Skeleton width="100px" height="28px" className="bg-white/20" />
                       : <p className="text-xl font-bold text-white">{s.val}</p>}
              {s.sub && <p className={cn("text-xs mt-0.5 font-medium", s.pos?"text-green-300":"text-red-300")}>{s.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <div className="flex gap-1 p-1 bg-light-muted dark:bg-dark-muted rounded-lg">
                {(["1M","3M","6M","1Y"] as Period[]).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all",
                      period===p ? "bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm"
                                 : "text-slate-400 hover:text-slate-600")}>{p}</button>
                ))}
              </div>
            </CardHeader>
            {loading ? <Skeleton height="220px" rounded="lg" />
              : history.length > 0
                ? <AreaChart data={history} color="#2563eb" currency="USD" height={220} showAxes showGrid />
                : <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Allocation</CardTitle></CardHeader>
          {loading ? <Skeleton height="180px" rounded="lg" />
            : donutData.length > 0
              ? (
                <div className="relative flex justify-center">
                  <DonutChart data={donutData} height={180} innerRadius={52} outerRadius={78} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">${(tv/1000).toFixed(1)}K</p>
                    <p className="text-xs text-slate-400">Total</p>
                  </div>
                </div>
              )
              : <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No holdings yet</div>}
          <div className="mt-3 space-y-2">
            {donutData.map(a => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{a.name}</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{a.value}%</span>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="search" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}
                className="input-base pl-9 py-2 w-44 text-sm" />
            </div>
            <div className="flex gap-1.5">
              {(["all","stock","etf","crypto"] as AssetFilter[]).map(f => (
                <button key={f} onClick={() => setAssetFilter(f)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                    assetFilter===f ? "bg-primary-600 text-white"
                                    : "bg-light-muted dark:bg-dark-muted text-slate-500 dark:text-slate-400")}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border bg-light-muted/50 dark:bg-dark-muted/50">
                {["Asset","Type","Quantity","Avg Price","Current Price","Market Value","Return"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-5 py-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3].map(i => <tr key={i}><td colSpan={7} className="px-5 py-3"><Skeleton height="40px" /></td></tr>)
                : filtered.length === 0
                  ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                      <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      {search ? "No matching holdings" : "No investments yet"}
                    </td></tr>
                  : filtered.map(h => (
                    <tr key={h.id} className="border-b border-light-border/50 dark:border-dark-border/50 last:border-0 hover:bg-slate-50 dark:hover:bg-dark-muted/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {h.symbol.slice(0,2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{h.symbol}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[120px]">{h.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={typeColorMap[h.asset_type] ?? "neutral"}>{h.asset_type}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-mono">{h.quantity}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatCurrency(h.avg_buy_price, h.currency)}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{formatCurrency(h.current_price, h.currency)}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{formatCurrency(h.market_value, h.currency)}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className={cn("font-semibold text-sm", h.gain_loss>=0?"positive":"negative")}>
                            {h.gain_loss>=0?"+":""}{formatCurrency(h.gain_loss, h.currency)}
                          </p>
                          <p className={cn("text-xs", h.gain_loss_pct>=0?"positive":"negative")}>
                            {formatPercent(h.gain_loss_pct)}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-light-border dark:border-dark-border bg-light-muted/30 dark:bg-dark-muted/30">
          <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Info className="h-4 w-4" />
              <span>Prices update every 15 minutes</span>
            </div>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <span>Total Invested: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(ti,"USD")}</span></span>
              <span>Total Value: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(tv,"USD")}</span></span>
              <span className={cn("font-semibold", tgl>=0?"positive":"negative")}>
                {tgl>=0?"+":""}{formatCurrency(tgl,"USD")} ({tgp>=0?"+":""}{tgp.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
