"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Send, ArrowLeftRight, Globe, ChevronDown,
  CheckCircle2, Search, ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Currency data ────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", name: "US Dollar",       symbol: "$",  flag: "🇺🇸" },
  { code: "EUR", name: "Euro",            symbol: "€",  flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",   symbol: "£",  flag: "🇬🇧" },
  { code: "NGN", name: "Nigerian Naira",  symbol: "₦",  flag: "🇳🇬" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$",flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar",symbol:"A$", flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen",    symbol: "¥",  flag: "🇯🇵" },
  { code: "CHF", name: "Swiss Franc",     symbol: "Fr", flag: "🇨🇭" },
  { code: "INR", name: "Indian Rupee",    symbol: "₹",  flag: "🇮🇳" },
  { code: "CNY", name: "Chinese Yuan",    symbol: "¥",  flag: "🇨🇳" },
  { code: "BRL", name: "Brazilian Real",  symbol: "R$", flag: "🇧🇷" },
  { code: "MXN", name: "Mexican Peso",    symbol: "$",  flag: "🇲🇽" },
  { code: "ZAR", name: "South African Rand",symbol:"R", flag: "🇿🇦" },
  { code: "SGD", name: "Singapore Dollar",symbol:"S$",  flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham",      symbol: "د.إ",flag: "🇦🇪" },
];

// Mock FX rates relative to USD
const FX: Record<string, number> = {
  USD:1, EUR:0.92, GBP:0.79, NGN:1620, CAD:1.36, AUD:1.53,
  JPY:157, CHF:0.90, INR:84, CNY:7.27, BRL:5.05, MXN:17.1,
  ZAR:18.6, SGD:1.34, AED:3.67,
};

const recentPayees = [
  { id: "1", name: "Sarah Connor",  account: "****4821", currency: "USD", avatar: "SC", color: "bg-violet-500" },
  { id: "2", name: "James Liu",     account: "****3390", currency: "EUR", avatar: "JL", color: "bg-emerald-500" },
  { id: "3", name: "Amara Diallo",  account: "****7712", currency: "NGN", avatar: "AD", color: "bg-amber-500" },
  { id: "4", name: "David Kim",     account: "****5543", currency: "USD", avatar: "DK", color: "bg-rose-500" },
];

const recentTransfers = [
  { id: "1", recipient: "Sarah Connor",  amount: 250,   from:"USD", to:"USD", status:"completed", date: new Date(Date.now()-3600000*2).toISOString() },
  { id: "2", recipient: "James Liu",     amount: 500,   from:"USD", to:"EUR", status:"completed", date: new Date(Date.now()-3600000*26).toISOString() },
  { id: "3", recipient: "Amara Diallo",  amount: 1200,  from:"USD", to:"NGN", status:"pending",   date: new Date(Date.now()-3600000*50).toISOString() },
  { id: "4", recipient: "David Kim",     amount: 75,    from:"USD", to:"USD", status:"completed", date: new Date(Date.now()-3600000*74).toISOString() },
];

// ─── Schema ───────────────────────────────────────────────────────────────────
const sendSchema = z.object({
  recipient_name:    z.string().min(2, "Enter recipient name"),
  recipient_account: z.string().min(5, "Enter account number or IBAN"),
  amount:            z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Enter a valid amount"),
  description:       z.string().min(1, "Add a description").max(120),
  transfer_type:     z.enum(["local", "international"]),
});

type SendFormData = z.infer<typeof sendSchema>;

// ─── Currency Picker ──────────────────────────────────────────────────────────
function CurrencyPicker({
  value, onChange, label,
}: { value: string; onChange: (c: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = CURRENCIES.find((c) => c.code === value) ?? CURRENCIES[0];
  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {label && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</p>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:border-primary-500 transition-all text-sm w-full"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-semibold text-slate-900 dark:text-white">{selected.code}</span>
        <span className="text-slate-400 text-xs hidden sm:block truncate">{selected.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-auto flex-shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 w-64 bg-light-surface dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-light-border dark:border-dark-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search currency..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-light-muted dark:bg-dark-muted rounded-lg focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setSearch(""); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-dark-muted transition-colors text-left",
                    c.code === value && "bg-primary-50 dark:bg-primary-900/20"
                  )}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{c.code}</span>
                  <span className="text-slate-400 text-xs truncate">{c.name}</span>
                  <span className="ml-auto text-slate-400 text-xs">{c.symbol}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = "send" | "exchange";

export default function PaymentsPage() {
  const [tab, setTab] = useState<Tab>("send");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency]   = useState("EUR");
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [pendingData, setPendingData] = useState<SendFormData | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedPayee, setSelectedPayee] = useState<typeof recentPayees[0] | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<SendFormData>({
    resolver: zodResolver(sendSchema),
    defaultValues: { transfer_type: "local" },
  });

  const transferType = watch("transfer_type");

  // FX calculation
  const fromRate = FX[fromCurrency] ?? 1;
  const toRate   = FX[toCurrency]   ?? 1;
  const converted = amount ? ((Number(amount) / fromRate) * toRate).toFixed(2) : "0.00";
  const rate = (toRate / fromRate).toFixed(4);

  const onSubmit = (data: SendFormData) => {
    setPendingData(data);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSendLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSendLoading(false);
    setConfirmOpen(false);
    setSuccessOpen(true);
    reset();
    setSelectedPayee(null);
  };

  const selectPayee = (p: typeof recentPayees[0]) => {
    setSelectedPayee(p);
    setValue("recipient_name", p.name);
    setValue("recipient_account", p.account);
    setValue("transfer_type", p.currency === fromCurrency ? "local" : "international");
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payments</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Send money globally in any currency
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-light-muted dark:bg-dark-muted rounded-xl w-fit">
        {(["send", "exchange"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-lg capitalize transition-all duration-150",
              tab === t
                ? "bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            {t === "send" ? "Send Money" : "Currency Exchange"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: form */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {tab === "send" ? (
              <motion.div
                key="send"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <h3 className="section-title mb-5">Send Money</h3>

                  {/* Recent payees */}
                  <div className="mb-5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium uppercase tracking-wide">
                      Recent Payees
                    </p>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                      {recentPayees.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPayee(p)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 flex-shrink-0 group",
                          )}
                        >
                          <div className={cn(
                            "h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-bold",
                            p.color,
                            selectedPayee?.id === p.id && "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-dark-card"
                          )}>
                            {p.avatar}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {p.name.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        className="flex flex-col items-center gap-1.5 flex-shrink-0"
                      >
                        <div className="h-11 w-11 rounded-full border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-all">
                          +
                        </div>
                        <span className="text-xs text-slate-400">New</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {/* Transfer type */}
                    <div className="grid grid-cols-2 gap-3">
                      {(["local", "international"] as const).map((type) => (
                        <label key={type} className="cursor-pointer">
                          <input type="radio" value={type} className="sr-only" {...register("transfer_type")} />
                          <div className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                            transferType === type
                              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                              : "border-light-border dark:border-dark-border text-slate-500 dark:text-slate-400 hover:border-primary-300"
                          )}>
                            {type === "local"
                              ? <Send className="h-4 w-4" />
                              : <Globe className="h-4 w-4" />}
                            <span className="capitalize">{type}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <Input
                      label="Recipient Name"
                      placeholder="Full name"
                      error={errors.recipient_name?.message}
                      {...register("recipient_name")}
                    />

                    <Input
                      label={transferType === "international" ? "IBAN / Account Number" : "Account Number"}
                      placeholder={transferType === "international" ? "GB29 NWBK 6016 1331 9268 19" : "Enter account number"}
                      error={errors.recipient_account?.message}
                      {...register("recipient_account")}
                    />

                    {/* Amount + currency */}
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Amount
                      </p>
                      <div className="flex gap-2">
                        <CurrencyPicker value={fromCurrency} onChange={setFromCurrency} />
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="flex-1"
                          error={errors.amount?.message}
                          {...register("amount")}
                        />
                      </div>
                      {transferType === "international" && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Globe className="h-3.5 w-3.5 text-primary-500" />
                          <span>Recipient gets ~</span>
                          <span className="font-semibold text-primary-600 dark:text-primary-400">
                            {(() => {
                              const amt = watch("amount");
                              const from = FX[fromCurrency] ?? 1;
                              const to = FX[toCurrency] ?? 1;
                              const conv = amt ? ((Number(amt) / from) * to).toFixed(2) : "0.00";
                              return `${CURRENCIES.find(c => c.code === toCurrency)?.symbol}${conv} ${toCurrency}`;
                            })()}
                          </span>
                          <span className="ml-1">· Rate: 1 {fromCurrency} = {(FX[toCurrency]/FX[fromCurrency]).toFixed(4)} {toCurrency}</span>
                        </div>
                      )}
                    </div>

                    {transferType === "international" && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Recipient Currency
                        </p>
                        <CurrencyPicker value={toCurrency} onChange={setToCurrency} />
                      </div>
                    )}

                    <Input
                      label="Description"
                      placeholder="What's this for?"
                      error={errors.description?.message}
                      {...register("description")}
                    />

                    <div className="pt-1">
                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        leftIcon={<Send className="h-4 w-4" />}
                      >
                        Review Transfer
                      </Button>
                      <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
                        Transfers are processed within 1–3 business days for international and instantly for local.
                      </p>
                    </div>
                  </form>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="exchange"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <h3 className="section-title mb-5">Currency Exchange</h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">From</p>
                      <div className="flex gap-2">
                        <CurrencyPicker value={fromCurrency} onChange={setFromCurrency} />
                        <input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input-base flex-1"
                        />
                      </div>
                    </div>

                    {/* Swap button */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={swapCurrencies}
                        className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all hover:rotate-180 duration-300"
                        aria-label="Swap currencies"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">To</p>
                      <div className="flex gap-2">
                        <CurrencyPicker value={toCurrency} onChange={setToCurrency} />
                        <div className="input-base flex-1 flex items-center text-slate-900 dark:text-white font-semibold">
                          {CURRENCIES.find(c=>c.code===toCurrency)?.symbol}{converted}
                        </div>
                      </div>
                    </div>

                    {/* Rate card */}
                    <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="h-4 w-4 text-primary-600" />
                          <span className="text-slate-600 dark:text-slate-400">Exchange Rate</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          1 {fromCurrency} = {rate} {toCurrency}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>No hidden fees</span>
                        <span>Updated just now</span>
                      </div>
                    </div>

                    <Button fullWidth size="lg" leftIcon={<ArrowLeftRight className="h-4 w-4" />}>
                      Exchange Now
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: recent transfers */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none">
            <CardHeader className="px-5 pt-5 pb-0 mb-0">
              <CardTitle>Recent Transfers</CardTitle>
            </CardHeader>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {recentTransfers.map((t) => (
                <div key={t.id} className="px-5 py-4 flex items-center gap-3 table-row-hover">
                  <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Send className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {t.recipient}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.from} → {t.to} · {formatRelativeTime(t.date)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold negative">
                      -{formatCurrency(t.amount, t.from)}
                    </p>
                    <Badge variant={t.status === "completed" ? "green" : "yellow"} dot className="mt-0.5">
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Supported currencies */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Currencies</CardTitle>
              <Badge variant="blue">{CURRENCIES.length}</Badge>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <span
                  key={c.code}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-light-muted dark:bg-dark-muted text-slate-600 dark:text-slate-400"
                >
                  <span>{c.flag}</span> {c.code}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Transfer"
        description="Please review the transfer details before proceeding."
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button fullWidth loading={sendLoading} onClick={handleConfirm}
              leftIcon={!sendLoading ? <CheckCircle2 className="h-4 w-4" /> : undefined}>
              Confirm & Send
            </Button>
          </div>
        }
      >
        {pendingData && (
          <div className="space-y-3 py-2">
            {[
              { label: "Recipient",   value: pendingData.recipient_name },
              { label: "Account",     value: pendingData.recipient_account },
              { label: "Amount",      value: formatCurrency(Number(pendingData.amount), fromCurrency) },
              { label: "Type",        value: pendingData.transfer_type === "international" ? "International" : "Local" },
              { label: "Description", value: pendingData.description },
              { label: "Fee",         value: pendingData.transfer_type === "international" ? "$2.50" : "Free" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-light-border dark:border-dark-border last:border-0">
                <span className="text-sm text-slate-500 dark:text-slate-400">{r.label}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} size="sm">
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-success-bg dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success-light" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Transfer Sent!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Your transfer has been initiated successfully.
          </p>
          <Button fullWidth onClick={() => setSuccessOpen(false)} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
}
