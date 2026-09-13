"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Skeleton from "@/components/ui/Skeleton";

interface BalanceToggleProps {
  amount: number;
  currency: string;
  loading?: boolean;
}

export default function BalanceToggle({ amount, currency, loading = false }: BalanceToggleProps) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4">
      <div>
        <p className="text-white/60 text-xs font-medium mb-1">Net Worth</p>
        {loading
          ? <Skeleton width="160px" height="32px" className="bg-white/20" />
          : (
            <p className="text-2xl font-bold text-white tracking-tight">
              {visible ? formatCurrency(amount, currency) : "••••••••"}
            </p>
          )}
        <p className="text-white/50 text-xs mt-1">Updated just now</p>
      </div>
      <button
        onClick={() => setVisible(!visible)}
        className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
        aria-label={visible ? "Hide balance" : "Show balance"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
