"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

const NODE = process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000";
const ADMIN_TOKEN_KEY = "eg_admin_token";

interface AdminTx {
  id: string; description: string; amount: number; currency: string;
  type: string; status: string; reference: string;
  recipient_name: string | null; category: string; created_at: string;
  user_email?: string;
}

async function fetchAllTx(): Promise<AdminTx[]> {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
  const res = await fetch(`${NODE}/api/admin/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return (json.data ?? []) as AdminTx[];
}

export default function AdminTransactionsPage() {
  const [txList,  setTxList]  = useState<AdminTx[]>([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setTxList(await fetchAllTx()); } catch { setTxList([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = txList.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.reference.toLowerCase().includes(search.toLowerCase()) ||
    (t.user_email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalVol = txList.reduce((s,t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">All Transactions ({txList.length})</h2>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: txList.length.toLocaleString()           },
          { label: "Volume",    value: formatCurrency(totalVol, "USD")           },
          { label: "Completed", value: txList.filter(t=>t.status==="completed").length.toLocaleString() },
          { label: "Pending",   value: txList.filter(t=>t.status==="pending").length.toLocaleString()   },
        ].map(s => (
          <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-4">
            {loading ? <Skeleton width="80px" height="24px" /> : <p className="text-xl font-bold text-white">{s.value}</p>}
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="search" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}
          className="input-base pl-9 py-2 bg-dark-card border-dark-border text-white" />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="border-b border-dark-border bg-dark-muted/50">
                {["","Description","User","Reference","Category","Status","Amount","Date"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => <tr key={i}><td colSpan={8} className="px-5 py-3"><Skeleton height="36px" /></td></tr>)
                : filtered.length === 0
                  ? <tr><td colSpan={8} className="text-center py-10 text-slate-500">No transactions found</td></tr>
                  : filtered.map(tx => (
                    <tr key={tx.id} className="border-b border-dark-border/50 last:border-0 hover:bg-dark-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        {tx.amount > 0
                          ? <ArrowDownLeft className="h-4 w-4 text-green-400" />
                          : <ArrowUpRight  className="h-4 w-4 text-red-400"   />}
                      </td>
                      <td className="px-4 py-3 font-medium text-white max-w-[160px] truncate">{tx.description}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[140px]">{tx.user_email ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{tx.reference}</td>
                      <td className="px-4 py-3"><Badge variant="neutral">{tx.category}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge variant={tx.status==="completed"?"green":tx.status==="pending"?"yellow":"red"} dot>{tx.status}</Badge>
                      </td>
                      <td className={`px-4 py-3 font-semibold text-sm ${tx.amount>0?"text-green-400":"text-red-400"}`}>
                        {tx.amount>0?"+":""}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(tx.created_at)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
