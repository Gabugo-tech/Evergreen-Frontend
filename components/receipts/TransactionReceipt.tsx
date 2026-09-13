"use client";

import { useRef } from "react";
import { Leaf, X, CheckCircle2, Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export interface ReceiptData {
  reference:        string;
  date:             string;
  description:      string;
  recipient_name:   string;
  recipient_account:string;
  sender_name:      string;
  sender_account:   string;
  amount:           number;
  currency:         string;
  fee:              number;
  status:           string;
  transfer_type:    "local" | "international";
  exchange_rate?:   number;
  to_currency?:     string;
  to_amount?:       number;
}

interface Props {
  data: ReceiptData;
  onClose: () => void;
}

export default function TransactionReceipt({ data, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=600,height=800");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Evergreen Transfer Receipt — ${data.reference}</title>
        <meta charset="UTF-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #0f172a; padding: 32px; }
          .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
          .logo { width: 36px; height: 36px; background: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; }
          .brand { font-size: 20px; font-weight: 700; color: #1e40af; }
          .brand-sub { font-size: 11px; color: #64748b; }
          .success { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
          .success-icon { color: #16a34a; font-size: 18px; }
          .success-text { font-size: 14px; font-weight: 600; color: #15803d; }
          .amount-box { text-align: center; padding: 20px; background: #eff6ff; border-radius: 12px; margin-bottom: 20px; }
          .amount { font-size: 36px; font-weight: 800; color: #1e40af; }
          .amount-label { font-size: 12px; color: #64748b; margin-top: 4px; }
          .section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; margin-top: 16px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
          .row:last-child { border-bottom: none; }
          .row-label { font-size: 13px; color: #64748b; }
          .row-value { font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; max-width: 55%; word-break: break-all; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; }
          .footer-text { font-size: 11px; color: #94a3b8; line-height: 1.6; }
          .ref { font-family: monospace; font-size: 12px; color: #3b82f6; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">EG</div>
          <div>
            <div class="brand">Evergreen</div>
            <div class="brand-sub">TRANSFER RECEIPT</div>
          </div>
          <div style="margin-left:auto;text-align:right;">
            <div class="ref">${data.reference}</div>
            <div style="font-size:11px;color:#94a3b8;">${formatDate(data.date)}</div>
          </div>
        </div>

        <div class="success">
          <span class="success-icon">✓</span>
          <span class="success-text">Transfer ${data.status === "completed" ? "Successful" : data.status}</span>
        </div>

        <div class="amount-box">
          <div class="amount">${formatCurrency(data.amount, data.currency)}</div>
          <div class="amount-label">Amount Transferred</div>
          ${data.fee > 0 ? `<div style="font-size:12px;color:#94a3b8;margin-top:4px;">+ ${formatCurrency(data.fee, data.currency)} fee</div>` : ""}
        </div>

        <div class="section-title">Recipient Details</div>
        <div class="row"><span class="row-label">Name</span><span class="row-value">${data.recipient_name}</span></div>
        <div class="row"><span class="row-label">Account Number</span><span class="row-value">${data.recipient_account}</span></div>
        ${data.transfer_type === "international" && data.to_currency ? `
        <div class="row"><span class="row-label">Receives</span><span class="row-value">${formatCurrency(data.to_amount ?? 0, data.to_currency)} ${data.to_currency}</span></div>
        <div class="row"><span class="row-label">Exchange Rate</span><span class="row-value">1 ${data.currency} = ${data.exchange_rate ?? 1} ${data.to_currency}</span></div>
        ` : ""}

        <div class="section-title">Sender Details</div>
        <div class="row"><span class="row-label">Name</span><span class="row-value">${data.sender_name}</span></div>
        <div class="row"><span class="row-label">Account Number</span><span class="row-value">${data.sender_account}</span></div>

        <div class="section-title">Transaction Details</div>
        <div class="row"><span class="row-label">Reference</span><span class="row-value ref">${data.reference}</span></div>
        <div class="row"><span class="row-label">Date & Time</span><span class="row-value">${new Date(data.date).toLocaleString()}</span></div>
        <div class="row"><span class="row-label">Description</span><span class="row-value">${data.description}</span></div>
        <div class="row"><span class="row-label">Transfer Type</span><span class="row-value">${data.transfer_type === "international" ? "International Transfer" : "Local Transfer"}</span></div>
        <div class="row"><span class="row-label">Fee</span><span class="row-value">${data.fee > 0 ? formatCurrency(data.fee, data.currency) : "Free"}</span></div>
        <div class="row"><span class="row-label">Status</span><span class="row-value" style="color:#16a34a;text-transform:capitalize;">${data.status}</span></div>

        <div class="footer">
          <div class="footer-text">
            This is an auto-generated receipt from Evergreen Financial Limited.<br/>
            CBN Digital Banking License No. DBL/2024/001 · NDIC Insured<br/>
            For disputes, contact support@evergreen.com within 14 days of transaction.<br/>
            Reference: ${data.reference}
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      {/* Receipt UI */}
      <div ref={printRef} className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-blue p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-base">Evergreen</p>
                <p className="text-white/70 text-xs">TRANSFER RECEIPT</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-white/70">{data.reference}</p>
              <p className="text-xs text-white/60">{formatDate(data.date)}</p>
            </div>
          </div>

          {/* Success badge */}
          <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
            <CheckCircle2 className="h-5 w-5 text-green-300" />
            <span className="text-sm font-semibold">Transfer {data.status === "completed" ? "Successful" : data.status}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center py-6 bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-800/30">
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(data.amount, data.currency)}
          </p>
          {data.fee > 0 && (
            <p className="text-xs text-slate-400 mt-1">+ {formatCurrency(data.fee, data.currency)} fee</p>
          )}
          {data.transfer_type === "international" && data.to_currency && (
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-2">
              Recipient gets: {formatCurrency(data.to_amount ?? 0, data.to_currency)} {data.to_currency}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          {[
            {
              title: "Recipient",
              rows: [
                ["Name",           data.recipient_name   ],
                ["Account",        data.recipient_account ],
                ...(data.transfer_type === "international" && data.to_currency
                  ? [["Exchange Rate", `1 ${data.currency} = ${data.exchange_rate ?? "—"} ${data.to_currency}`]]
                  : []),
              ],
            },
            {
              title: "Sender",
              rows: [
                ["Name",    data.sender_name    ],
                ["Account", data.sender_account ],
              ],
            },
            {
              title: "Transaction",
              rows: [
                ["Reference",   data.reference                                    ],
                ["Date",        new Date(data.date).toLocaleString()              ],
                ["Description", data.description                                  ],
                ["Type",        data.transfer_type === "international" ? "International" : "Local" ],
                ["Fee",         data.fee > 0 ? formatCurrency(data.fee, data.currency) : "Free"   ],
                ["Status",      data.status                                       ],
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                {section.title}
              </p>
              <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
                {section.rows.map(([label, value], i) => (
                  <div key={label} className={cn("flex items-center justify-between px-4 py-2.5 text-sm",
                    i < section.rows.length - 1 ? "border-b border-light-border dark:border-dark-border" : "")}>
                    <span className="text-slate-500 dark:text-slate-400">{label}</span>
                    <span className={cn("font-medium text-slate-900 dark:text-white text-right max-w-[55%] break-all",
                      label === "Status" ? "text-success-light capitalize" : "",
                      label === "Reference" ? "font-mono text-xs text-primary-500" : ""
                    )}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CBN disclaimer */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-generated receipt · Evergreen Financial Limited<br />
              CBN License No. DBL/2024/001 · NDIC Insured<br />
              Disputes: support@evergreen.com within 14 days
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <Button variant="secondary" fullWidth leftIcon={<X className="h-4 w-4" />} onClick={onClose}>
          Close
        </Button>
        <Button fullWidth leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
          Print / Download
        </Button>
      </div>
    </motion.div>
  );
}
