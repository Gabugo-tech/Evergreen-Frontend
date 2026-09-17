"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Send, ArrowLeftRight, Globe, ChevronDown,
  CheckCircle2, Search, RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import TransactionReceipt, { type ReceiptData } from "@/components/receipts/TransactionReceipt";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { accountsApi, paymentsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import type { BankAccount } from "@/types";

// ─── Currency data ─────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", name: "US Dollar",        symbol: "$",   flag: "🇺🇸" },
  { code: "EUR", name: "Euro",             symbol: "€",   flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",    symbol: "£",   flag: "🇬🇧" },
  { code: "NGN", name: "Nigerian Naira",   symbol: "₦",   flag: "🇳🇬" },
  { code: "CAD", name: "Canadian Dollar",  symbol: "CA$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar",symbol: "A$",  flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen",     symbol: "¥",   flag: "🇯🇵" },
  { code: "CHF", name: "Swiss Franc",      symbol: "Fr",  flag: "🇨🇭" },
  { code: "INR", name: "Indian Rupee",     symbol: "₹",   flag: "🇮🇳" },
  { code: "CNY", name: "Chinese Yuan",     symbol: "¥",   flag: "🇨🇳" },
  { code: "BRL", name: "Brazilian Real",   symbol: "R$",  flag: "🇧🇷" },
  { code: "MXN", name: "Mexican Peso",     symbol: "$",   flag: "🇲🇽" },
  { code: "ZAR", name: "South African Rand",symbol:"R",   flag: "🇿🇦" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$",  flag: "🇸🇬" },
  { code: "THB", name: "Thai Baht",          symbol: "฿",   flag: "🇹🇭" },
  { code: "TWD", name: "Taiwan Dollar",       symbol: "NT$", flag: "🇹🇼" },
  { code: "AED", name: "UAE Dirham",          symbol: "د.إ", flag: "🇦🇪" },
];

// ─── World banks organised by country ──────────────────────────────────────
// Providers: NG=Paystack, GH/KE/ZA/TZ/UG/RW/ZM/CM/SN/CI=Flutterwave, others=manual
export const WORLD_BANKS: Record<string, { flag: string; name: string; currency: string; canAutoResolve: boolean; banks: { name: string; code: string }[] }> = {
  NG: {
    flag: "🇳🇬", name: "Nigeria", currency: "NGN", canAutoResolve: true,
    banks: [
      { name: "Evergreen Bank",                    code: "evergreen" },
      { name: "Access Bank",                       code: "044" },
      { name: "Citibank Nigeria",                  code: "023" },
      { name: "Ecobank Nigeria",                   code: "050" },
      { name: "Fidelity Bank",                     code: "070" },
      { name: "First Bank of Nigeria",             code: "011" },
      { name: "FCMB",                              code: "214" },
      { name: "Guaranty Trust Bank (GTBank)",      code: "058" },
      { name: "Keystone Bank",                     code: "082" },
      { name: "Kuda Bank",                         code: "50211" },
      { name: "Moniepoint MFB",                    code: "50515" },
      { name: "OPay",                              code: "100004" },
      { name: "Palmpay",                           code: "100033" },
      { name: "Polaris Bank",                      code: "076" },
      { name: "Stanbic IBTC Bank",                 code: "221" },
      { name: "Sterling Bank",                     code: "232" },
      { name: "UBA",                               code: "033" },
      { name: "Union Bank",                        code: "032" },
      { name: "Wema Bank",                         code: "035" },
      { name: "Zenith Bank",                       code: "057" },
    ],
  },
  GH: {
    flag: "🇬🇭", name: "Ghana", currency: "GHS", canAutoResolve: true,
    banks: [
      { name: "Absa Bank Ghana",       code: "GH270202" },
      { name: "Access Bank Ghana",     code: "GH280101" },
      { name: "Ecobank Ghana",         code: "GH300101" },
      { name: "Fidelity Bank Ghana",   code: "GH040101" },
      { name: "GCB Bank",              code: "GH020101" },
      { name: "Guaranty Trust Ghana",  code: "GH230101" },
      { name: "MTN Mobile Money",      code: "GHM" },
      { name: "Standard Chartered GH", code: "GH020201" },
      { name: "Stanbic Bank Ghana",    code: "GH190101" },
      { name: "Zenith Bank Ghana",     code: "GH180101" },
    ],
  },
  KE: {
    flag: "🇰🇪", name: "Kenya", currency: "KES", canAutoResolve: true,
    banks: [
      { name: "Absa Bank Kenya",       code: "ABSA" },
      { name: "Cooperative Bank",      code: "CO-OP" },
      { name: "DTB Bank",              code: "DTB" },
      { name: "Equity Bank",           code: "EQUITY" },
      { name: "Family Bank",           code: "FAMILY" },
      { name: "I&M Bank",              code: "IM" },
      { name: "KCB Bank",              code: "KCB" },
      { name: "M-Pesa (Safaricom)",    code: "MPS" },
      { name: "NCBA Bank",             code: "NCBA" },
      { name: "Standard Chartered KE", code: "SCBKE" },
    ],
  },
  ZA: {
    flag: "🇿🇦", name: "South Africa", currency: "ZAR", canAutoResolve: true,
    banks: [
      { name: "Absa Bank",             code: "632005" },
      { name: "African Bank",          code: "430000" },
      { name: "Capitec Bank",          code: "470010" },
      { name: "Discovery Bank",        code: "679000" },
      { name: "FNB",                   code: "250655" },
      { name: "Investec",              code: "580105" },
      { name: "Nedbank",               code: "198765" },
      { name: "Standard Bank",         code: "051001" },
      { name: "TymeBank",              code: "678910" },
    ],
  },
  TZ: {
    flag: "🇹🇿", name: "Tanzania", currency: "TZS", canAutoResolve: true,
    banks: [
      { name: "CRDB Bank",             code: "CRDB" },
      { name: "NMB Bank",              code: "NMB" },
      { name: "Stanbic Tanzania",      code: "STANBIC" },
      { name: "Standard Chartered TZ", code: "SCBTZ" },
      { name: "Vodacom M-Pesa",        code: "MPS" },
    ],
  },
  UG: {
    flag: "🇺🇬", name: "Uganda", currency: "UGX", canAutoResolve: true,
    banks: [
      { name: "Absa Uganda",           code: "ABSA" },
      { name: "Centenary Bank",        code: "CENTY" },
      { name: "DFCU Bank",             code: "DFCU" },
      { name: "MTN Mobile Money",      code: "MPS" },
      { name: "Stanbic Uganda",        code: "STANBIC" },
    ],
  },
  // ── Countries without auto-resolution (manual name entry) ──────────────
  US: {
    flag: "🇺🇸", name: "United States", currency: "USD", canAutoResolve: false,
    banks: [
      { name: "Bank of America",       code: "BOFA" },
      { name: "Chase Bank",            code: "CHASE" },
      { name: "Citibank",              code: "CITI" },
      { name: "Wells Fargo",           code: "WF" },
      { name: "Goldman Sachs",         code: "GS" },
      { name: "JPMorgan",              code: "JPM" },
      { name: "US Bancorp",            code: "USB" },
      { name: "Capital One",           code: "COF" },
    ],
  },
  GB: {
    flag: "🇬🇧", name: "United Kingdom", currency: "GBP", canAutoResolve: false,
    banks: [
      { name: "Barclays",              code: "BARCGB22" },
      { name: "HSBC UK",               code: "HBUKGB4B" },
      { name: "Lloyds Bank",           code: "LOYDGB21" },
      { name: "Metro Bank",            code: "MYMBGB2L" },
      { name: "Monzo",                 code: "MONZGB2L" },
      { name: "NatWest",               code: "NWBKGB2L" },
      { name: "Revolut",               code: "REVOGB21" },
      { name: "Starling Bank",         code: "SRLGGB3L" },
    ],
  },
  KR: {
    flag: "🇰🇷", name: "South Korea", currency: "KRW", canAutoResolve: false,
    banks: [
      { name: "KB Kookmin Bank",                    code: "004" },
      { name: "Shinhan Bank",                       code: "088" },
      { name: "KEB Hana Bank",                      code: "081" },
      { name: "Woori Bank",                         code: "020" },
      { name: "Standard Chartered Bank Korea",      code: "023" },
      { name: "Citibank Korea",                     code: "027" },
      { name: "KakaoBank",                          code: "090" },
      { name: "K Bank",                             code: "089" },
      { name: "Toss Bank",                          code: "092" },
      { name: "Korea Development Bank (KDB)",       code: "002" },
      { name: "Industrial Bank of Korea (IBK)",     code: "003" },
      { name: "Export-Import Bank of Korea (Kexim)",code: "008" },
      { name: "NH NongHyup Bank",                   code: "011" },
      { name: "Suhyup Bank",                        code: "007" },
      { name: "iM Bank (formerly Daegu Bank)",      code: "031" },
      { name: "Busan Bank",                         code: "032" },
      { name: "Kyongnam Bank",                      code: "039" },
      { name: "Kwangju Bank",                       code: "034" },
      { name: "Jeonbuk Bank",                       code: "037" },
      { name: "Jeju Bank",                          code: "035" },
    ],
  },
  DE: {
    flag: "🇩🇪", name: "Germany", currency: "EUR", canAutoResolve: false,
    banks: [
      { name: "Commerzbank",           code: "COBADEFF" },
      { name: "Deutsche Bank",         code: "DEUTDEDB" },
      { name: "DZ Bank",               code: "GENODEFF" },
      { name: "ING Germany",           code: "INGDDEFF" },
      { name: "N26",                   code: "NTSBDEB1" },
      { name: "Sparkasse",             code: "BELADEBE" },
    ],
  },
  FR: {
    flag: "🇫🇷", name: "France", currency: "EUR", canAutoResolve: false,
    banks: [
      { name: "BNP Paribas",           code: "BNPAFRPP" },
      { name: "Crédit Agricole",       code: "AGRIFRPP" },
      { name: "La Banque Postale",     code: "PSSTFRPP" },
      { name: "Lydia",                 code: "LYDIFRPP" },
      { name: "Société Générale",      code: "SOGEFRPP" },
      { name: "Revolut FR",            code: "REVOFR21" },
    ],
  },
  JP: {
    flag: "🇯🇵", name: "Japan", currency: "JPY", canAutoResolve: false,
    banks: [
      { name: "MUFG Bank",             code: "0005" },
      { name: "Mizuho Bank",           code: "0001" },
      { name: "PayPay Bank",           code: "0033" },
      { name: "Rakuten Bank",          code: "0036" },
      { name: "Resona Bank",           code: "0010" },
      { name: "SMBC",                  code: "0009" },
    ],
  },
  CN: {
    flag: "🇨🇳", name: "China", currency: "CNY", canAutoResolve: false,
    banks: [
      { name: "Agricultural Bank",     code: "ABC" },
      { name: "Alipay",                code: "ALIPAY" },
      { name: "Bank of China",         code: "BOC" },
      { name: "CCB",                   code: "CCB" },
      { name: "ICBC",                  code: "ICBC" },
      { name: "WeChat Pay",            code: "WECHAT" },
    ],
  },
  IN: {
    flag: "🇮🇳", name: "India", currency: "INR", canAutoResolve: false,
    banks: [
      { name: "Axis Bank",             code: "AXIS" },
      { name: "HDFC Bank",             code: "HDFC" },
      { name: "ICICI Bank",            code: "ICICI" },
      { name: "Kotak Mahindra",        code: "KOTAK" },
      { name: "Paytm",                 code: "PAYTM" },
      { name: "PhonePe",               code: "PHONEPE" },
      { name: "SBI",                   code: "SBI" },
    ],
  },
  AE: {
    flag: "🇦🇪", name: "UAE", currency: "AED", canAutoResolve: false,
    banks: [
      { name: "Abu Dhabi Commercial",  code: "ADCB" },
      { name: "Emirates NBD",          code: "EBILAEAD" },
      { name: "FAB",                   code: "NBADAEAA" },
      { name: "Mashreq Bank",          code: "BOMLAEAD" },
      { name: "Wio Bank",              code: "WIO" },
    ],
  },
  CA: {
    flag: "🇨🇦", name: "Canada", currency: "CAD", canAutoResolve: false,
    banks: [
      { name: "BMO",                   code: "BMO" },
      { name: "CIBC",                  code: "CIBC" },
      { name: "RBC",                   code: "RBC" },
      { name: "Scotiabank",            code: "SCOT" },
      { name: "TD Bank",               code: "TD" },
    ],
  },
  AU: {
    flag: "🇦🇺", name: "Australia", currency: "AUD", canAutoResolve: false,
    banks: [
      { name: "ANZ",                   code: "ANZ" },
      { name: "CommBank",              code: "CBA" },
      { name: "NAB",                   code: "NAB" },
      { name: "Westpac",               code: "WBC" },
    ],
  },
  BR: {
    flag: "🇧🇷", name: "Brazil", currency: "BRL", canAutoResolve: false,
    banks: [
      { name: "Banco do Brasil",       code: "001" },
      { name: "Bradesco",              code: "237" },
      { name: "Itaú",                  code: "341" },
      { name: "Nubank",                code: "260" },
      { name: "Pix (any bank)",        code: "PIX" },
    ],
  },
  SG: {
    flag: "🇸🇬", name: "Singapore", currency: "SGD", canAutoResolve: false,
    banks: [
      { name: "DBS Bank",              code: "DBS" },
      { name: "OCBC",                  code: "OCBC" },
      { name: "Revolut SG",            code: "REVSG" },
      { name: "UOB",                   code: "UOB" },
    ],
  },
};

// Sorted country list for the selector
const COUNTRY_LIST = Object.entries(WORLD_BANKS).map(([code, data]) => ({
  code,
  flag: data.flag,
  name: data.name,
  currency: data.currency,
  canAutoResolve: data.canAutoResolve,
})).sort((a, b) => {
  // Nigeria first (home country), then alphabetical
  if (a.code === "NG") return -1;
  if (b.code === "NG") return 1;
  return a.name.localeCompare(b.name);
});
const sendSchema = z.object({
  from_account_id:   z.string().min(1, "Select an account"),
  recipient_name:    z.string().min(2, "Enter recipient name"),
  recipient_account: z.string().min(5, "Enter account number"),
  amount:            z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, "Enter a valid amount"),
  description:       z.string().min(1, "Add a description").max(120),
  transfer_type:     z.enum(["local", "international"]),
});
type SendFormData = z.infer<typeof sendSchema>;

// ─── Currency picker ────────────────────────────────────────────────────────
function CurrencyPicker({ value, onChange, label }: { value: string; onChange: (c: string) => void; label?: string }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const selected = CURRENCIES.find(c => c.code === value) ?? CURRENCIES[0];
  const filtered = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {label && <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</p>}
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:border-primary-500 transition-all text-sm w-full">
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-semibold text-slate-900 dark:text-white">{selected.code}</span>
        <span className="text-slate-400 text-xs hidden sm:block truncate">{selected.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-auto flex-shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 w-64 bg-light-surface dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-light-border dark:border-dark-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input type="search" placeholder="Search currency..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-light-muted dark:bg-dark-muted rounded-lg focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400" autoFocus />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.map(c => (
                <button key={c.code} type="button" onClick={() => { onChange(c.code); setOpen(false); setSearch(""); }}
                  className={cn("w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-dark-muted transition-colors text-left",
                    c.code === value && "bg-primary-50 dark:bg-primary-900/20")}>
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

type Tab = "send" | "exchange";

interface PaymentHistoryItem {
  id: string; description: string; amount: number; currency: string;
  status: string; created_at: string; recipient_name?: string;
  reference: string; type: string;
}

export default function PaymentsPage() {
  const { user }                  = useAuth();
  const [tab,           setTab]   = useState<Tab>("send");
  const [fromCurrency,  setFrom]  = useState("USD");
  const [toCurrency,    setTo]    = useState("EUR");
  const [exchAmount,    setExchAmt] = useState("");
  const [fxRates,       setFxRates] = useState<Record<string, number>>({});
  const [accounts,      setAccounts] = useState<BankAccount[]>([]);
  const [history,       setHistory]  = useState<PaymentHistoryItem[]>([]);
  const [histLoading,   setHistLoad] = useState(true);
  const [confirmOpen,   setConfirmOpen] = useState(false);
  const [receiptOpen,   setReceiptOpen] = useState(false);
  const [receiptData,   setReceiptData] = useState<ReceiptData | null>(null);
  const [pendingData,   setPendingData] = useState<SendFormData | null>(null);
  const [sending,       setSending]     = useState(false);

  // Account lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult,  setLookupResult]  = useState<{ name: string; accountType: string; currency: string; found: boolean; canResolve?: boolean; message?: string } | null>(null);
  const lookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("NG");
  const [selectedBank,    setSelectedBank]    = useState("evergreen");

  const currentCountryData = WORLD_BANKS[selectedCountry];

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, getValues } = useForm<SendFormData>({
    resolver: zodResolver(sendSchema),
    defaultValues: { transfer_type: "local" },
  });
  const transferType    = watch("transfer_type");
  const watchAmount     = watch("amount");
  const watchFromAccId  = watch("from_account_id");

  // Debounced account number lookup — normalises spaces/dashes before querying
  const handleAccountNumberChange = useCallback((value: string) => {
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);

    // Strip all non-digit characters so "384 726 1950" or "EG3847261950" → "3847261950"
    const clean = value.replace(/\D/g, "");

    // External banks (international, non-Evergreen) — skip lookup entirely,
    // prompt the user to fill in their name manually.
    const isExternal = transferType === "international" && selectedBank !== "evergreen";
    if (isExternal) {
      setLookupLoading(false);
      if (clean.length >= 5) {
        setLookupResult({ name: "", accountType: "", currency: "", found: false, canResolve: false, message: "Enter the recipient name manually below." });
      } else {
        setLookupResult(null);
      }
      return;
    }

    // Need at least 5 chars to bother querying
    if (clean.length < 5) {
      setLookupResult(null);
      setLookupLoading(false);
      return;
    }

    setLookupLoading(true);
    setLookupResult(null);

    lookupTimerRef.current = setTimeout(async () => {
      try {
        // Local transfer or Evergreen selected — use internal lookup
        const res = await accountsApi.lookup(clean);
        const { account_name, account_type, currency } = res.data;
        setLookupResult({ name: account_name, accountType: account_type, currency, found: true, canResolve: true });
        setValue("recipient_name", account_name, { shouldValidate: true });
      } catch {
        // Account not found on Evergreen — fall through to manual entry
        // (canResolve: false triggers the manual name field to appear)
        setLookupResult({ name: "", accountType: "", currency: "", found: false, canResolve: false, message: "Account not found — enter the recipient name manually." });
      } finally {
        setLookupLoading(false);
      }
    }, 500);
  }, [setValue, selectedBank, transferType]);

  const loadData = useCallback(async () => {
    setHistLoad(true);
    const [accsRes, histRes, ratesRes] = await Promise.allSettled([
      accountsApi.list(),
      paymentsApi.history(),
      paymentsApi.rates(),
    ]);
    if (accsRes.status   === "fulfilled") {
      const accs = (accsRes.value.data ?? []) as BankAccount[];
      setAccounts(accs);
      // Only set default account on first load — don't override a user's manual selection
      const currentAccId = getValues("from_account_id");
      if (!currentAccId && accs.length > 0) setValue("from_account_id", accs[0].id);
    }
    if (histRes.status   === "fulfilled") setHistory((histRes.value.data ?? []) as PaymentHistoryItem[]);
    if (ratesRes.status  === "fulfilled") setFxRates((ratesRes.value.data as { rates: Record<string,number> })?.rates ?? {});
    setHistLoad(false);
  }, [setValue]);

  useEffect(() => { loadData(); }, [loadData]);

  // Clear lookup when transfer type changes (local ↔ international)
  useEffect(() => {
    setLookupResult(null);
    setLookupLoading(false);
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    // When switching to local, reset to Evergreen
    if (transferType === "local") {
      setSelectedCountry("NG");
      setSelectedBank("evergreen");
    }
  }, [transferType]);

  // Clear lookup when bank selection changes
  useEffect(() => {
    setLookupResult(null);
    setLookupLoading(false);
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
  }, [selectedBank, selectedCountry]);

  // Live FX preview
  const fromRate    = fxRates[fromCurrency] ?? 1;
  const toRate      = fxRates[toCurrency]   ?? 1;
  const previewAmt  = watchAmount ? ((Number(watchAmount) / fromRate) * toRate).toFixed(2) : "0.00";
  const exchConverted = exchAmount ? ((Number(exchAmount) / (fxRates[fromCurrency] ?? 1)) * (fxRates[toCurrency] ?? 1)).toFixed(2) : "0.00";

  const selectedAccount = accounts.find(a => a.id === watchFromAccId);

  const onSubmit = (data: SendFormData) => {
    setPendingData(data);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingData || sending) return;
    setSending(true);

    // Close confirm modal immediately — prevents double-submit
    setConfirmOpen(false);

    // Build receipt upfront from known data
    // (we update reference/date from the server response if available)
    // Convert the flat $2.50 USD fee into the sender's fromCurrency so the
    // receipt always shows the fee in the same currency the user sent.
    const feeUSD       = pendingData.transfer_type === "international" ? 2.5 : 0;
    const usdRate      = fxRates["USD"]          ?? 1;
    const fromRateNow  = fxRates[fromCurrency]   ?? 1;
    const feeInFromCurrency = feeUSD * (fromRateNow / usdRate);

    const optimisticReceipt: ReceiptData = {
      reference:         `EG${Date.now().toString(36).toUpperCase()}`,
      date:              new Date().toISOString(),
      description:       pendingData.description,
      recipient_name:    pendingData.recipient_name,
      recipient_account: pendingData.recipient_account,
      sender_name:       user?.full_name ?? "Account Holder",
      sender_account:    selectedAccount?.account_number ?? "—",
      amount:            Number(pendingData.amount),
      currency:          fromCurrency,
      fee:               +feeInFromCurrency.toFixed(2),
      status:            "completed",
      transfer_type:     pendingData.transfer_type,
      ...(pendingData.transfer_type === "international" ? {
        exchange_rate: +(toRate / fromRate).toFixed(4),
        to_currency:   toCurrency,
        to_amount:     +((Number(pendingData.amount) / fromRate) * toRate).toFixed(2),
      } : {}),
    };

    try {
      const res = await paymentsApi.send({
        from_account_id:   pendingData.from_account_id,
        to_account_number: pendingData.recipient_account,
        recipient_name:    pendingData.recipient_name,
        amount:            Number(pendingData.amount),
        from_currency:     fromCurrency,
        to_currency:       pendingData.transfer_type === "international" ? toCurrency : fromCurrency,
        description:       pendingData.description,
        transfer_type:     pendingData.transfer_type,
      });

      const txData = (res as { data: { transaction: { reference: string; created_at: string }; fee: number } }).data;

      // Update receipt with real server data
      optimisticReceipt.reference = txData?.transaction?.reference ?? optimisticReceipt.reference;
      optimisticReceipt.date      = txData?.transaction?.created_at ?? optimisticReceipt.date;
      optimisticReceipt.fee       = txData?.fee ?? optimisticReceipt.fee;

      toast.success("Transfer sent successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transfer failed";
      if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
        toast("Transfer processed — please check your balance.", { icon: "ℹ️" });
      } else {
        toast.error(msg);
        return; // genuine failure — finally still fires to reset sending state
      }
    } finally {
      setSending(false);
    }

    // Show receipt and reset form
    setReceiptData(optimisticReceipt);
    setTimeout(() => setReceiptOpen(true), 150);
    reset();
    setLookupResult(null);
    loadData();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payments</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Send money globally in any currency</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-light-muted dark:bg-dark-muted rounded-xl w-fit">
        {(["send","exchange"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-5 py-2 text-sm font-medium rounded-lg capitalize transition-all duration-150",
              tab === t ? "bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300")}>
            {t === "send" ? "Send Money" : "Currency Exchange"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left form */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {tab === "send" ? (
              <motion.div key="send" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }} transition={{ duration:0.2 }}>
                <Card>
                  <h3 className="section-title mb-5">Send Money</h3>
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {/* From account */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">From Account</label>
                      {accounts.length === 0
                        ? <Skeleton height="44px" rounded="lg" />
                        : (
                          <select className="input-base" {...register("from_account_id")}>
                            {accounts.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.account_name} — {formatCurrency(a.balance, a.currency)} ({a.account_number})
                              </option>
                            ))}
                          </select>
                        )}
                      {errors.from_account_id && <p className="text-xs text-danger-light mt-1">{errors.from_account_id.message}</p>}
                    </div>

                    {/* Transfer type */}
                    <div className="grid grid-cols-2 gap-3">
                      {(["local","international"] as const).map(type => (
                        <label key={type} className="cursor-pointer">
                          <input type="radio" value={type} className="sr-only" {...register("transfer_type")} />
                          <div className={cn("flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                            transferType === type ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                                  : "border-light-border dark:border-dark-border text-slate-500 dark:text-slate-400 hover:border-primary-300")}>
                            {type === "local" ? <Send className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                            <span className="capitalize">{type}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* ── Step 1: Bank selector + Account number ── */}
                    <div>
                      {/* Country + Bank selectors — only for international */}
                      {transferType === "international" && (
                        <>
                          {/* Country selector */}
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Country
                          </label>
                          <select
                            className="input-base mb-3"
                            value={selectedCountry}
                            onChange={(e) => {
                              const newCountry = e.target.value;
                              setSelectedCountry(newCountry);
                              const firstBank = WORLD_BANKS[newCountry]?.banks[0]?.code ?? "evergreen";
                              setSelectedBank(firstBank);
                              setValue("recipient_account", "");
                              setValue("recipient_name", "");
                            }}
                          >
                            {COUNTRY_LIST.filter(c => c.code !== "NG" || true).map(c => (
                              <option key={c.code} value={c.code}>
                                {c.flag} {c.name}
                              </option>
                            ))}
                          </select>

                          {/* Bank selector */}
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Bank
                          </label>
                          <select
                            className="input-base mb-3"
                            value={selectedBank}
                            onChange={(e) => {
                              setSelectedBank(e.target.value);
                              setValue("recipient_account", "");
                              setValue("recipient_name", "");
                            }}
                          >
                            {(WORLD_BANKS[selectedCountry]?.banks ?? []).map(b => (
                              <option key={b.code} value={b.code}>{b.name}</option>
                            ))}
                          </select>

                          {/* Auto-resolve availability notice */}
                          {!currentCountryData?.canAutoResolve && (
                            <div className="mb-3 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-400">
                              <span className="text-base leading-none mt-0.5">ℹ</span>
                              <span>Auto name-lookup is not available for {currentCountryData?.name ?? "this country"}. Please enter the recipient name manually.</span>
                            </div>
                          )}
                        </>
                      )}

                      <Input
                        label={transferType === "international" ? "IBAN / Account Number" : "Account Number"}
                        placeholder={
                          selectedCountry === "NG" ? "Enter 10-digit account number" :
                          transferType === "international" ? "IBAN or local account number" :
                          "Enter account number"
                        }
                        error={errors.recipient_account?.message}
                        {...register("recipient_account", {
                          onChange: (e) => handleAccountNumberChange(e.target.value),
                        })}
                      />

                      {/* Lookup states */}
                      {lookupLoading && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <div className="h-3 w-3 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
                          Fetching account details…
                        </div>
                      )}
                      {!lookupLoading && lookupResult?.found && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-green-400 truncate">{lookupResult.name}</p>
                            <p className="text-xs text-slate-400 capitalize">
                              {lookupResult.accountType} · {lookupResult.currency}
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {/* Can't auto-resolve — show manual entry prompt */}
                      {!lookupLoading && lookupResult?.found === false && lookupResult?.canResolve === false && (
                        <div className="mt-2 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-400">
                          <span className="text-base leading-none mt-0.5">ℹ</span>
                          <span>{lookupResult.message ?? "Enter the recipient name manually below."}</span>
                        </div>
                      )}
                      {/* Account not found (lookup attempted but failed) */}
                      {!lookupLoading && lookupResult?.found === false && lookupResult?.canResolve !== false && (
                        <div className="mt-2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400">
                          <span className="text-base leading-none">⚠</span>
                          Account not found — double-check the number
                        </div>
                      )}
                    </div>

                    {/* ── Step 2: Rest of form — shown after successful lookup OR manual-entry country ── */}
                    <AnimatePresence>
                      {(lookupResult?.found || lookupResult?.canResolve === false) && (
                        <motion.div
                          key="transfer-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 pt-1">
                            {/* Recipient name — auto-filled, still editable */}
                            <Input
                              label="Recipient Name"
                              placeholder="Full name"
                              error={errors.recipient_name?.message}
                              {...register("recipient_name")}
                            />

                            {/* Amount + currency */}
                            <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount</p>
                              <div className="flex gap-2">
                                <div className="w-36 flex-shrink-0">
                                  <CurrencyPicker value={fromCurrency} onChange={setFrom} />
                                </div>
                                <Input type="number" placeholder="0.00" step="0.01" min="0" error={errors.amount?.message} {...register("amount")} />
                              </div>
                              {transferType === "international" && Number(watchAmount) > 0 && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                  <Globe className="h-3.5 w-3.5 text-primary-500" />
                                  <span>Recipient gets ~</span>
                                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                                    {CURRENCIES.find(c => c.code === toCurrency)?.symbol}{previewAmt} {toCurrency}
                                  </span>
                                  <span>· Rate: 1 {fromCurrency} = {(toRate/fromRate).toFixed(4)} {toCurrency}</span>
                                </div>
                              )}
                            </div>

                            {transferType === "international" && (
                              <CurrencyPicker value={toCurrency} onChange={setTo} label="Recipient Currency" />
                            )}

                            <Input label="Description" placeholder="What's this for?" error={errors.description?.message} {...register("description")} />

                            <div className="pt-1">
                              <Button type="submit" fullWidth size="lg" leftIcon={<Send className="h-4 w-4" />}>
                                Review Transfer
                              </Button>
                              <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
                                Local transfers are instant · International: 1–3 business days
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Prompt when no lookup yet */}
                    {!lookupResult && !lookupLoading && (
                      <div className="flex items-center gap-3 rounded-xl border border-dashed border-dark-border px-4 py-4 text-sm text-slate-400">
                        <Search className="h-4 w-4 flex-shrink-0 text-slate-500" />
                        Enter the recipient&apos;s account number above to continue
                      </div>
                    )}
                  </form>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="exchange" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }} transition={{ duration:0.2 }}>
                <Card>
                  <h3 className="section-title mb-5">Currency Exchange</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">From</p>
                      <div className="flex gap-2">
                        <div className="w-36 flex-shrink-0"><CurrencyPicker value={fromCurrency} onChange={setFrom} /></div>
                        <input type="number" placeholder="0.00" value={exchAmount} onChange={e => setExchAmt(e.target.value)} className="input-base flex-1" />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button type="button" onClick={() => { setFrom(toCurrency); setTo(fromCurrency); }}
                        className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center hover:bg-primary-200 transition-all hover:rotate-180 duration-300" aria-label="Swap currencies">
                        <ArrowLeftRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">To</p>
                      <div className="flex gap-2">
                        <div className="w-36 flex-shrink-0"><CurrencyPicker value={toCurrency} onChange={setTo} /></div>
                        <div className="input-base flex-1 flex items-center text-slate-900 dark:text-white font-semibold">
                          {CURRENCIES.find(c => c.code === toCurrency)?.symbol}{exchConverted}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="h-4 w-4 text-primary-600" />
                          <span className="text-slate-600 dark:text-slate-400">Exchange Rate</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          1 {fromCurrency} = {(toRate/fromRate).toFixed(4)} {toCurrency}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>No hidden fees</span>
                        <span>Rates updated live</span>
                      </div>
                    </div>
                    <Button fullWidth size="lg" leftIcon={<ArrowLeftRight className="h-4 w-4" />}>Exchange Now</Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: history + currencies */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none">
            <CardHeader className="px-5 pt-5 pb-0 mb-0">
              <CardTitle>Recent Transfers</CardTitle>
              <button onClick={loadData} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </CardHeader>
            {histLoading
              ? <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} height="56px" rounded="lg" />)}</div>
              : history.length === 0
                ? <p className="text-center text-slate-400 py-8 text-sm">No transfers yet</p>
                : (
                  <div className="divide-y divide-light-border dark:divide-dark-border">
                    {history.slice(0,5).map(t => (
                      <div key={t.id} className="px-5 py-4 flex items-center gap-3 table-row-hover">
                        <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <Send className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{t.recipient_name ?? t.description}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(t.created_at)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn("text-sm font-semibold", t.type === "credit" ? "positive" : "negative")}>
                            {t.type === "credit" ? "+" : "-"}{formatCurrency(Math.abs(t.amount), t.currency)}
                          </p>
                          <Badge variant={t.status==="completed"?"green":t.status==="pending"?"yellow":"red"} dot className="mt-0.5">{t.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Currencies</CardTitle>
              <Badge variant="blue">{CURRENCIES.length}</Badge>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map(c => (
                <span key={c.code} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-light-muted dark:bg-dark-muted text-slate-600 dark:text-slate-400">
                  <span>{c.flag}</span> {c.code}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Transfer"
        description="Please review the details before proceeding."
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button fullWidth loading={sending} onClick={handleConfirm}
              leftIcon={!sending ? <CheckCircle2 className="h-4 w-4" /> : undefined}>
              Confirm & Send
            </Button>
          </div>
        }>
        {pendingData && (
          <div className="space-y-3 py-2">
            {(() => {
              const feeUSD = pendingData.transfer_type === "international" ? 2.5 : 0;
              const feeInFrom = feeUSD > 0
                ? +(feeUSD * ((fxRates[fromCurrency] ?? 1) / (fxRates["USD"] ?? 1))).toFixed(2)
                : 0;
              const feeCurrSymbol = CURRENCIES.find(c => c.code === fromCurrency)?.symbol ?? "";
              const feeLabel = feeUSD > 0 ? `${feeCurrSymbol}${feeInFrom} ${fromCurrency}` : "Free";
              return [
                ["Recipient",   pendingData.recipient_name],
                ["Account",     pendingData.recipient_account],
                ["Amount",      formatCurrency(Number(pendingData.amount), fromCurrency)],
                ["Type",        pendingData.transfer_type === "international" ? "International" : "Local"],
                ["Description", pendingData.description],
                ["Fee",         feeLabel],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-light-border dark:border-dark-border last:border-0">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{val}</span>
                </div>
              ));
            })()}
          </div>
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title="" showClose={false} size="lg">
        {receiptData && (
          <TransactionReceipt data={receiptData} onClose={() => {
            setReceiptOpen(false);
            setReceiptData(null);
          }} />
        )}
      </Modal>
    </div>
  );
}
