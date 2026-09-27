"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, Mail, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

interface PinResetModalProps {
  open:    boolean;
  onClose: () => void;
  onDone:  () => void;
}

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
const PIN_LENGTH = 4;

function PinKeypad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const handleKey = (key: string) => {
    if (key === "⌫") onChange(value.slice(0, -1));
    else if (value.length < PIN_LENGTH) onChange(value + key);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div key={i} className={cn(
            "h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all",
            i < value.length
              ? "border-primary-500 bg-primary-500/10"
              : "border-slate-300 dark:border-dark-border bg-light-muted dark:bg-dark-muted"
          )}>
            {i < value.length && <div className="h-3 w-3 rounded-full bg-primary-500" />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key, i) => {
          if (key === "") return <div key={i} />;
          const isBack = key === "⌫";
          return (
            <button key={i} type="button" onClick={() => handleKey(key)}
              disabled={!isBack && value.length >= PIN_LENGTH}
              className={cn(
                "h-14 rounded-2xl text-xl font-semibold transition-all active:scale-95 select-none",
                isBack
                  ? "bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-border flex items-center justify-center"
                  : "bg-light-surface dark:bg-dark-card text-slate-900 dark:text-white border border-light-border dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-900/20",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}>
              {isBack ? <Delete className="h-5 w-5 mx-auto" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ResetStep = "request" | "otp" | "new-pin" | "confirm-pin" | "done";

export default function PinResetModal({ open, onClose, onDone }: PinResetModalProps) {
  const [resetStep,   setResetStep]   = useState<ResetStep>("request");
  const [otp,         setOtp]         = useState("");
  const [newPin,      setNewPin]      = useState("");
  const [confirmPin,  setConfirmPin]  = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const reset = () => {
    setResetStep("request"); setOtp(""); setNewPin("");
    setConfirmPin(""); setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleRequestOtp = async () => {
    setLoading(true); setError(null);
    try {
      await authApi.requestPinReset();
      setResetStep("otp");
      toast.success("OTP sent to your registered email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true); setError(null);
    try {
      await authApi.verifyPinOtp(otp);
      setResetStep("new-pin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async () => {
    if (newPin !== confirmPin) { setError("PINs do not match"); return; }
    setLoading(true); setError(null);
    try {
      await authApi.resetPin(otp, newPin);
      setResetStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Reset Payment PIN" size="sm">
      <div className="py-2">
        <AnimatePresence mode="wait">
          {/* Step 1 — Request OTP */}
          {resetStep === "request" && (
            <motion.div key="request" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }} className="space-y-5">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-14 w-14 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-primary-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  We&apos;ll send a 6-digit OTP to your registered email address to verify your identity.
                </p>
              </div>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button fullWidth loading={loading} onClick={handleRequestOtp}>
                Send OTP to Email
              </Button>
            </motion.div>
          )}

          {/* Step 2 — Enter OTP */}
          {resetStep === "otp" && (
            <motion.div key="otp" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }} className="space-y-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Enter the 6-digit code sent to your email.
              </p>
              <Input
                label="OTP Code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center tracking-[0.5em] text-lg font-bold"
              />
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button fullWidth loading={loading} disabled={otp.length !== 6} onClick={handleVerifyOtp}>
                Verify OTP
              </Button>
              <p className="text-center text-sm text-slate-400">
                Didn&apos;t receive it?{" "}
                <button type="button" onClick={handleRequestOtp} className="text-primary-500 hover:underline">
                  Resend
                </button>
              </p>
            </motion.div>
          )}

          {/* Step 3 — New PIN */}
          {resetStep === "new-pin" && (
            <motion.div key="new-pin" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }} className="space-y-5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">Enter your new 4-digit PIN</p>
              <PinKeypad value={newPin} onChange={setNewPin} />
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button fullWidth disabled={newPin.length !== PIN_LENGTH} onClick={() => { setError(null); setResetStep("confirm-pin"); }}>
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 4 — Confirm new PIN */}
          {resetStep === "confirm-pin" && (
            <motion.div key="confirm-pin" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }} className="space-y-5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">Confirm your new PIN</p>
              <PinKeypad value={confirmPin} onChange={setConfirmPin} />
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button fullWidth loading={loading} disabled={confirmPin.length !== PIN_LENGTH} onClick={handleResetPin}>
                Set New PIN
              </Button>
            </motion.div>
          )}

          {/* Done */}
          {resetStep === "done" && (
            <motion.div key="done" initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} className="flex flex-col items-center gap-4 py-6">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">PIN Reset Successfully</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Your new payment PIN is active. Use it for your next transfer.
              </p>
              <Button fullWidth onClick={() => { reset(); onDone(); }}>Done</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
