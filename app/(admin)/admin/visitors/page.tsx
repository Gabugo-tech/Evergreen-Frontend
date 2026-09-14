"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, Globe, RefreshCw, Wifi } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { formatRelativeTime } from "@/lib/utils";

const NODE = process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000";
const ADMIN_TOKEN_KEY = "eg_admin_token";

interface VisitorLog {
  id:         string;
  ip_address: string;
  page:       string;
  user_email: string | null;
  created_at: string;
}

function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ADMIN_TOKEN_KEY)
      ?? localStorage.getItem("eg_token")
      ?? "";
}

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAdminToken();
      const res = await fetch(`${NODE}/api/admin/visitors?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
      setVisitors((json.data ?? []) as VisitorLog[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load visitors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = visitors.filter(v =>
    new Date(v.created_at).toDateString() === new Date().toDateString()
  ).length;

  const unique = new Set(visitors.map(v => v.ip_address)).size;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Visitor Tracking</h2>
          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-900/30 text-green-400">
            <Wifi className="h-3 w-3" /> Live
          </span>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Visits", value: visitors.length, icon: Activity, color: "text-primary-400",  bg: "bg-primary-400/10"  },
          { label: "Today",        value: today,           icon: Globe,    color: "text-success-light", bg: "bg-success-light/10"},
          { label: "Unique IPs",   value: unique,          icon: Wifi,     color: "text-warning-light", bg: "bg-warning-light/10"},
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-5 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                {loading ? <Skeleton width="60px" height="28px" /> : <p className="text-2xl font-bold text-white">{s.value}</p>}
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visitor log table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-dark-border bg-dark-muted/50">
                {["IP Address","Page","User","Time"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => (
                  <tr key={i}><td colSpan={4} className="px-5 py-3"><Skeleton height="32px" /></td></tr>
                ))
                : visitors.length === 0
                  ? (
                    <tr><td colSpan={4} className="text-center py-12 text-slate-500">
                      <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      No visitor data yet
                    </td></tr>
                  )
                  : visitors.map((v, i) => (
                    <tr key={v.id ?? i} className="border-b border-dark-border/50 last:border-0 hover:bg-dark-muted/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-primary-400 text-xs">{v.ip_address}</td>
                      <td className="px-5 py-3 text-slate-300 text-xs max-w-[160px] truncate">{v.page}</td>
                      <td className="px-5 py-3 text-xs truncate max-w-[180px]">
                        {v.user_email
                          ? <Badge variant="neutral">{v.user_email}</Badge>
                          : <span className="text-slate-600">Guest</span>}
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {formatRelativeTime(v.created_at)}
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
