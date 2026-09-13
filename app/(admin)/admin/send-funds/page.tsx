"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Send, CheckCircle2, AlertCircle, RefreshCw,
  DollarSign, User, Hash, FileText, ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const NODE = process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000";
const ADMIN_TOKEN_KEY = "eg_admin_token";
const ADMIN_EMAIL = "nnanwubagabriel@gmail.com";

const schema = z.object({
  to_account_number: z.string().min(5, "Enter account number"),
  recipient_name:    z.string().min(2, "Enter recipient name"),
  amount:            z.coerce.number().positive("Enter a positive amount").max(999_999_999_999_999, "Amount too large"),
  description:       z.string().min(1, "Add a description"),
  currency:          z.string().default("USD"),
});
type FormData = z.infer<typeof schema>;

interface AdminAccount {
  id: string;
  balance: number;
  currency: string;
  account_number: string;
  account_name: string;
}

interface TransferRecord {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  recipient_name: string;
  recipient_account: string;
  description: string;
  status: string;
  created_at: string;
}

interface ConfirmData extends FormData {
  fee: number;
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? localStorage.getItem("eg_token") ?? "";
  const res = await fetch(`${NODE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message ?? `Request failed (${res.status})`);
  return json.data as T;
}

export default function AdminSendFundsPage() {
  const [adminAccount,  setAdminAccount]  = useState<AdminAccount | null>(null);
  const [transfers,     setTransfers]     = useState<TransferRecord[]>([]);
  const [balLoading,    setBalLoading]    = useState(true);
  const [sending,       setSending]       = useState(false);
  const [confirmOpen,   setConfirmOpen]   = useState(false);
  const [successOpen,   setSuccessOpen]   = useState(false);
  const [pendingData,   setPendingData]   = useState<ConfirmData | null>(null);
  const [lastTransfer,  setLastTransfer]  = useState<TransferRecord | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD" },
  });

  const watchAmount = watch("amount");

  // Load admin account (look up by admin email, not hardcoded ID)
  const loadAccount = useCallback(async () => {
    setBalLoading(true);
    try {
      const account = await adminFetch<AdminAccount>("/api/admin/account");
      setAdminAccount(account);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load admin account");
    } finally {
      setBalLoading(false);
    }
  }, []);

  // Load recent transfers sent from admin
  const loadTransfers = useCallback(async () => {
    try {
      const txs = await adminFetch<TransferRecord[]>("/api/admin/transfers");
      setTransfers(txs);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    loadAccount();
    loadTransfers();
  }, [loadAccount, loadTransfers]);

  const onSubmit = (data: FormData) => {
    const fee = 0; // Admin transfers are free
    setPendingData({ ...data, fee });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingData || !adminAccount) return;
    setSending(true);
    try {
      const result = await adminFetch<{ transaction: TransferRecord; reference: string }>("/api/payments/send", {
        method: "POST",
        body: JSON.stringify({
          from_account_id:   adminAccount.id,
          to_account_number: pendingData.to_account_number,
          recipient_name:    pendingData.recipient_name,
          amount:            pendingData.amount,
          from_currency:     pendingData.currency,
          to_currency:       pendingData.currency,
          description:       pendingData.description,
          transfer_type:     "local",
        }),
      });

      setLastTransfer({
        id:               result.transaction?.id ?? "",
        reference:        result.reference ?? result.transaction?.reference ?? `EG${Date.now()}`,
        amount:           pendingData.amount,
        currency:         pendingData.currency,
        recipient_name:   pendingData.recipient_name,
        recipient_account:pendingData.to_account_number,
        description:      pendingData.description,
        status:           "completed",
        created_at:       new Date().toISOString(),
      });

      setConfirmOpen(false);
      setSuccessOpen(true);
      reset();
      await loadAccount();
      await loadTransfers();
    } catch (err) {
      setConfirmOpen(false);
      toast.error(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setSending(false);
    }
  };

  const balanceAfter = adminAccount && watchAmount
    ? adminAccount.balance - Number(watchAmount)
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Send Test Funds</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Transfer funds from the admin test account to any user in the app
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => { loadAccount(); loadTransfers(); }}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: form ─────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Admin balance card */}
          <div className="rounded-2xl bg-gradient-to-br from-primary-900 to-dark-card border border-primary-800/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Admin Test Account Balance</p>
                {balLoading
                  ? <Skeleton width="200px" height="36px" className="bg-white/10" />
                  : <p className="text-3xl font-extrabold text-white">
                      {adminAccount ? formatCurrency(adminAccount.balance, adminAccount.currency) : "—"}
                    </p>}
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {adminAccount?.account_number ?? "Loading…"}
                </p>
              </div>
              <Badge variant="blue" dot>Test Account</Badge>
            </div>

            {balanceAfter !== null && Number(watchAmount) > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="text-slate-400">Balance after transfer</span>
                <span className={cn("font-semibold", balanceAfter >= 0 ? "text-green-400" : "text-red-400")}>
                  {formatCurrency(Math.max(0, balanceAfter), adminAccount?.currency ?? "USD")}
                </span>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">World Bank Test Funds</p>
              <p className="text-xs text-amber-400/80 mt-0.5 leading-relaxed">
                These funds are for World Bank approval testing only. All transfers are logged and auditable.
                Do not use for real financial transactions.
              </p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader><CardTitle>Send Funds to User</CardTitle></CardHeader>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Input
                label="Recipient Account Number"
                placeholder="e.g. EG4729183056"
                leftElement={<Hash className="h-4 w-4" />}
                error={errors.to_account_number?.message}
                {...register("to_account_number")}
              />
              <Input
                label="Recipient Full Name"
                placeholder="Full name of the account holder"
                leftElement={<User className="h-4 w-4" />}
                error={errors.recipient_name?.message}
                {...register("recipient_name")}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount (USD)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="999999999999999"
                    placeholder="0.00"
                    className="input-base pl-9"
                    {...register("amount")}
                  />
                </div>
                {errors.amount && <p className="text-xs text-danger-light mt-1.5">{errors.amount.message}</p>}
                {/* Quick amount buttons */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[1000, 10000, 100000, 1000000, 10000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => reset({ ...watch(), amount: amt })}
                      className="text-xs px-2.5 py-1 rounded-lg bg-primary-900/30 text-primary-400 hover:bg-primary-900/50 transition-colors border border-primary-800/40"
                    >
                      ${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Description / Purpose"
                placeholder="e.g. World Bank approval test funding"
                leftElement={<FileText className="h-4 w-4" />}
                error={errors.description?.message}
                {...register("description")}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                leftIcon={<Send className="h-4 w-4" />}
                disabled={!adminAccount || adminAccount.balance <= 0}
              >
                Review Transfer
              </Button>
            </form>
          </Card>
        </div>

        {/* ── Right: recent transfers ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle>Recent Admin Transfers</CardTitle>
            </CardHeader>
            {transfers.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <Send className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No transfers yet</p>
                </div>
              )
              : (
                <div className="divide-y divide-dark-border">
                  {transfers.map(t => (
                    <div key={t.id} className="px-5 py-3.5 hover:bg-dark-muted/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white truncate max-w-[60%]">
                          {t.recipient_name}
                        </p>
                        <span className="text-sm font-semibold text-red-400">
                          -{formatCurrency(t.amount, t.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-mono">{t.recipient_account}</p>
                        <Badge variant={t.status === "completed" ? "green" : "yellow"} dot>
                          {t.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{formatDate(t.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
          </Card>
        </div>
      </div>

      {/* ── Confirm modal ─────────────────────────────────────────────── */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Transfer"
        description="Review the details before sending."
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button fullWidth loading={sending} onClick={handleConfirm}
              leftIcon={!sending ? <CheckCircle2 className="h-4 w-4" /> : undefined}>
              Send Now
            </Button>
          </div>
        }
      >
        {pendingData && (
          <div className="space-y-2 py-2">
            {[
              ["From",        adminAccount?.account_number ?? "Admin Account"],
              ["To",          pendingData.to_account_number],
              ["Recipient",   pendingData.recipient_name],
              ["Amount",      formatCurrency(pendingData.amount, pendingData.currency)],
              ["Description", pendingData.description],
              ["Fee",         "Free"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-light-border dark:border-dark-border last:border-0">
                <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white max-w-[55%] text-right break-all">{val}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ── Success modal ─────────────────────────────────────────────── */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} size="sm">
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-success-bg dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success-light" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Funds Sent!</h3>
          {lastTransfer && (
            <div className="mt-4 text-left rounded-xl bg-light-muted dark:bg-dark-muted p-4 space-y-2 text-sm">
              {[
                ["Amount",    formatCurrency(lastTransfer.amount, lastTransfer.currency)],
                ["To",        lastTransfer.recipient_name],
                ["Account",   lastTransfer.recipient_account],
                ["Reference", lastTransfer.reference],
                ["Status",    lastTransfer.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{k}</span>
                  <span className={cn("font-medium text-slate-900 dark:text-white", k === "Status" ? "text-green-400 capitalize" : "")}>{v}</span>
                </div>
              ))}
            </div>
          )}
          <Button fullWidth className="mt-5" onClick={() => setSuccessOpen(false)}
            rightIcon={<ArrowRight className="h-4 w-4" />}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
}
