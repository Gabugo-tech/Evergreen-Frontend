"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Filter, Download, ArrowUpRight, ArrowDownLeft,
  ArrowLeftRight, ChevronLeft, ChevronRight, X, SlidersHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { transactionsApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/types";
import toast from "react-hot-toast";

type TxType   = "all" | "credit" | "debit" | "transfer";
type TxStatus = "all" | "completed" | "pending" | "failed" | "cancelled";

const PAGE_SIZE = 15;

const statusBadge: Record<string, "green" | "yellow" | "red"> = {
  completed: "green", pending: "yellow", failed: "red", cancelled: "red",
};

const typeIcon = (type: string) => {
  if (type === "credit")  return <ArrowDownLeft  className="h-4 w-4 text-success-light" />;
  if (type === "debit")   return <ArrowUpRight    className="h-4 w-4 text-danger-light"  />;
  return                         <ArrowLeftRight  className="h-4 w-4 text-primary-400"   />;
};

const typeColor = (type: string) => {
  if (type === "credit") return "bg-success-bg dark:bg-green-900/20";
  if (type === "debit")  return "bg-danger-bg dark:bg-red-900/20";
  return "bg-primary-50 dark:bg-primary-900/20";
};

export default function TransactionsPage() {
  const [txList,      setTxList]      = useState<Transaction[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState<TxType>("all");
  const [statusFilter,setStatus]      = useState<TxStatus>("all");
  const [category,    setCategory]    = useState("all");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [page,        setPage]        = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selected,    setSelected]    = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page:     String(page),
        per_page: String(PAGE_SIZE),
      };
      if (typeFilter   !== "all") params.type     = typeFilter;
      if (statusFilter !== "all") params.status   = statusFilter;
      if (category     !== "all") params.category = category;
      if (dateFrom)               params.from     = dateFrom;
      if (dateTo)                 params.to       = dateTo;
      if (search)                 params.search   = search;

      const res = await transactionsApi.list(params);
      setTxList((res.data ?? []) as Transaction[]);
      const pag = (res as { pagination?: { total: number } }).pagination;
      setTotal(pag?.total ?? 0);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, category, dateFrom, dateTo, search]);

  useEffect(() => { load(); }, [load]);

  // Summary from loaded page
  const totalIn  = txList.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = txList.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });

  const allSelected = txList.length > 0 && txList.every(t => selected.has(t.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(txList.map(t => t.id)));
  };

  const clearFilters = () => {
    setSearch(""); setTypeFilter("all"); setStatus("all");
    setCategory("all"); setDateFrom(""); setDateTo(""); setPage(1);
  };

  const activeFilters = [
    typeFilter   !== "all" && typeFilter,
    statusFilter !== "all" && statusFilter,
    category     !== "all" && category,
    dateFrom && `From ${dateFrom}`,
    dateTo   && `To ${dateTo}`,
  ].filter(Boolean) as string[];

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleType   = (v: TxType) => { setTypeFilter(v); setPage(1); };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${total} transactions found`}
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Download className="h-4 w-4" />}>
          Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total In",  value: totalIn,              positive: true  },
          { label: "Total Out", value: totalOut,             positive: false },
          { label: "Net",       value: totalIn - totalOut,   positive: totalIn >= totalOut },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            {loading
              ? <Skeleton width="140px" height="28px" />
              : <p className={cn("text-xl font-bold", s.positive ? "positive" : "negative")}>
                  {s.value >= 0 ? "+" : "-"}{formatCurrency(Math.abs(s.value), "USD")}
                </p>}
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search" placeholder="Search transactions…" value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-base pl-9 py-2 w-full"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(["all","credit","debit","transfer"] as TxType[]).map((t) => (
              <button key={t} onClick={() => handleType(t)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                  typeFilter === t ? "bg-primary-600 text-white"
                  : "bg-light-muted dark:bg-dark-muted text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-border"
                )}>{t}</button>
            ))}
          </div>
          <Button variant="secondary" size="sm" leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "border-primary-500 text-primary-600 dark:text-primary-400" : ""}
          >
            Filters
            {activeFilters.length > 0 && (
              <span className="ml-1 h-4 w-4 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="pt-4 mt-4 border-t border-light-border dark:border-dark-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Status</label>
                  <select value={statusFilter} onChange={(e) => { setStatus(e.target.value as TxStatus); setPage(1); }} className="input-base py-2 text-sm">
                    {["all","completed","pending","failed","cancelled"].map(s => (
                      <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Date From</label>
                  <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="input-base py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Date To</label>
                  <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="input-base py-2 text-sm" />
                </div>
              </div>
              {activeFilters.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Active:</span>
                  {activeFilters.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{f}</span>
                  ))}
                  <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-danger-light flex items-center gap-0.5 transition-colors">
                    <X className="h-3 w-3" /> Clear all
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Table */}
      <Card padding="none">
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-3 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800/40">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{selected.size} selected</span>
                <Button variant="ghost" size="xs" leftIcon={<Download className="h-3.5 w-3.5" />}>Export</Button>
                <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Deselect all</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border bg-light-muted/50 dark:bg-dark-muted/50">
                <th className="w-10 px-4 py-3 text-left">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded accent-primary-600" aria-label="Select all" />
                </th>
                {["Description","Category","Date","Status","Amount"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-4 py-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton height="36px" /></td></tr>
                ))
                : txList.length === 0
                  ? (
                    <tr><td colSpan={6} className="text-center py-16 text-slate-400 dark:text-slate-500">
                      <Filter className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No transactions found</p>
                      <p className="text-xs mt-1">Try adjusting your filters</p>
                    </td></tr>
                  )
                  : txList.map((tx) => (
                    <tr key={tx.id} className={cn(
                      "border-b border-light-border/50 dark:border-dark-border/50 last:border-0 transition-colors",
                      selected.has(tx.id) ? "bg-primary-50/60 dark:bg-primary-900/10" : "hover:bg-slate-50 dark:hover:bg-dark-muted/50"
                    )}>
                      <td className="w-10 px-4 py-3.5">
                        <input type="checkbox" checked={selected.has(tx.id)} onChange={() => toggleSelect(tx.id)} className="h-4 w-4 rounded accent-primary-600" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0", typeColor(tx.type))}>
                            {typeIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white leading-tight">{tx.description}</p>
                            <p className="text-xs text-slate-400 font-mono">{tx.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><Badge variant="neutral">{tx.category}</Badge></td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{formatDate(tx.created_at)}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusBadge[tx.status] ?? "neutral"} dot>{tx.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold whitespace-nowrap">
                        <span className={tx.amount > 0 ? "positive" : "negative"}>
                          {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-light-border dark:border-dark-border flex-wrap gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn("h-8 w-8 rounded-lg text-sm font-medium transition-all",
                      page === p ? "bg-primary-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-muted"
                    )}>{p}</button>
                );
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors" aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
