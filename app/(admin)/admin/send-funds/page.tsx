"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const NODE = process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000";
const ADMIN_TOKEN_KEY = "eg_admin_token";

// Admin test account ID is fixed — seeded with $1B
const ADMIN_ACCOUNT_ID = "b0000ad0-0000-0000-0000-000000000001";

const schema = z.object({
  to_account_number: z.string().min(5, "Enter account number"),
  recipient_name:    z.string().min(2, "Enter recipient name"),
  amount:            z.coerce.number().positive("Enter a positive amount"),
  description:       z.string().min(1, "Add a description"),
});
type FormData = z.infer<typeof schema>;

interface AdminAccount { balance: number; currency: string; account_number: string }

export default function AdminSendFundsPage() {
  const [adminBalance, setAdminBalance] = useState<AdminAccount | null>(null);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function loadBalance() {
      const token = sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
      try {
        const res  = await fetch(`${NODE}/api/admin/account`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        setAdminBalance(json.data as AdminAccount);
      } catch { /* show nothing */ }
    }
    loadBalance();
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setSuccess(null);
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
    try {
      const res = await fetch(`${NODE}/api/payments/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          from_account_id:   ADMIN_ACCOUNT_ID,
          to_account_number: data.to_account_number,
          recipient_name:    data.recipient_name,
          amount:            data.amount,
          from_currency:     "USD",
          to_currency:       "USD",
          description:       data.description,
          transfer_type:     "local",
        }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.message ?? "Transfer failed"); return; }
      setSuccess(`$${data.amount.toLocaleString()} sent to ${data.recipient_name} successfully.`);
      reset();
      // Refresh balance
      const balRes  = await fetch(`${NODE}/api/admin/account`, { headers: { Authorization: `Bearer ${token}` } });
      const balJson = await balRes.json();
      setAdminBalance(balJson.data as AdminAccount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-white">Send Test Funds</h2>

      {/* Admin balance */}
      <Card>
        <CardHeader><CardTitle>Admin Test Account</CardTitle></CardHeader>
        <div className="flex items-center justify-between p-4 rounded-xl bg-dark-muted border border-dark-border">
          <div>
            <p className="text-xs text-slate-400 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-white">
              {adminBalance ? formatCurrency(adminBalance.balance, adminBalance.currency) : "Loading…"}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {adminBalance?.account_number ?? "ADMIN-TEST-ACCOUNT"}
            </p>
          </div>
          <Badge variant="blue" dot>Test Account</Badge>
        </div>
      </Card>

      {/* Send form */}
      <Card>
        <CardHeader><CardTitle>Transfer Funds</CardTitle></CardHeader>
        {success && (
          <div className="flex items-start gap-3 bg-green-900/20 border border-green-500/30 rounded-xl p-4 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-300">{success}</p>
          </div>
        )}

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              This sends real test funds from the admin account to any user account number within the app. For CBN testing purposes only.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Recipient Account Number"
            placeholder="EG4729183056"
            error={errors.to_account_number?.message}
            {...register("to_account_number")}
          />
          <Input
            label="Recipient Name"
            placeholder="Full name of the recipient"
            error={errors.recipient_name?.message}
            {...register("recipient_name")}
          />
          <Input
            label="Amount (USD)"
            type="number"
            placeholder="1000"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <Input
            label="Description"
            placeholder="e.g. Test funding for CBN review"
            error={errors.description?.message}
            {...register("description")}
          />
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            leftIcon={!loading ? <Send className="h-4 w-4" /> : undefined}
          >
            Send Funds
          </Button>
        </form>
      </Card>
    </div>
  );
}
