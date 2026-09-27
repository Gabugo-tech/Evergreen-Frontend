"use client";

import { useState, useEffect, useCallback } from "react";
import { Delete, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface PinModalProps {
  open:        boolean;
  onClose:     () => void;
  onSubmit:    (pin: string) => void | Promise<void>;
  loading?:    boolean;
  error?:      string | null;
  title?:      string;
  description?: string;
  showForgot?: boolean;
  onForgot?:   () => void;
}

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
const PIN_LENGTH = 4;

type PinMode = "verify" | "setup-enter" | "setup-confirm";

export default function PinModal({
  open, onClose, onSubmit, loading = false, error, title = "Enter Payment PIN",
  description = "Enter your 4-digit payment PIN to authorise this transfer.",
  showForgot = true, onForgot,
}: PinModalProps) {
  const [pin,       setPin]      = useState("");
  const [confirmPin,setConfirmPin]= useState("");
  const [reveal,    setReveal]   = useState(false);
  const [mode,      setMode]     = useState<PinMode>("verify");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError,   setSetupError]   = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setPin(""); setConfirmPin(""); setReveal(false); setMode("verify"); setSetupError(null); }
  }, [open]);

  // If verify returns "No payment PIN set" switch to setup mode
  const handleVerifyError = (msg: string) => {
    if (msg.toLowerCase().includes("no payment pin")) {
      setMode("setup-enter");
      setPin("");
    }
  };

  const handleKey = useCallback((key: string, target: "pin" | "confirm") => {
    if (target === "pin") {
      if (key === "⌫") setPin(p => p.slice(0, -1));
      else if (pin.length < PIN_LENGTH) setPin(p => p + key);
    } else {
      if (key === "⌫") setConfirmPin(p => p.slice(0, -1));
      else if (confirmPin.length < PIN_LENGTH) setConfirmPin(p => p + key);
    }
  }, [pin, confirmPin]);

  useEffect(() => {
    if (!open) return;
    const active = mode === "setup-confirm" ? "confirm" : "pin";
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleKey(e.key, active);
      else if (e.key === "Backspace")     handleKey("⌫", active);
      else if (e.key === "Enter") {
        if (mode === "verify" && pin.length === PIN_LENGTH) handleSubmit();
        if (mode === "setup-enter" && pin.length === PIN_LENGTH) { setMode("setup-confirm"); }
        if (mode === "setup-confirm" && confirmPin.length === PIN_LENGTH) handleSetupConfirm();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, pin, confirmPin, mode, handleKey]);

  const handleSubmit = async () => {
    if (pin.length !== PIN_LENGTH || loading) return;
    await onSubmit(pin);
  };

  const handleSetupConfirm = async () => {
    if (confirmPin !== pin) { setSetupError("PINs do not match"); setConfirmPin(""); return; }
    setSetupLoading(true); setSetupError(null);
    try {
      await authApi.setPin(pin);
      toast.success("Payment PIN set! Please enter it to continue.");
      setMode("verify");
      setPin(""); setConfirmPin("");
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Failed to set PIN");
    } finally {
      setSetupLoading(false);
    }
  };

  const activePin    = mode === "setup-confirm" ? confirmPin : pin;
  const activeSetKey = (key: string) => handleKey(key, mode === "setup-confirm" ? "confirm" : "pin");

  const modeTitle = mode === "verify" ? title
    : mode === "setup-enter" ? "Set Payment PIN"
    : "Confirm Payment PIN";

  const modeDesc = mode === "verify" ? description
    : mode === "setup-enter" ? "You haven't set a payment PIN yet. Create a 4-digit PIN to authorise transfers."
    : "Re-enter your PIN to confirm.";

  return (
    <Modal open={open} onClose={onClose} title={modeTitle} description={modeDesc} size="sm">
      <div className="py-2 space-y-6">
        {mode === "setup-enter" && (
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-primary-500" />
            </div>
          </div>
        )}

        {/* PIN dot display */}
        <div className="flex items-center justify-center gap-4">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const filled = i < activePin.length;
            const char   = reveal ? (activePin[i] ?? "") : "";
            return (
              <div key={i} className={cn(
                "h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all duration-150",
                filled ? "border-primary-500 bg-primary-500/10"
                       : "border-slate-300 dark:border-dark-border bg-light-muted dark:bg-dark-muted"
              )}>
                {reveal
                  ? <span className="text-lg font-bold text-slate-900 dark:text-white">{char}</span>
                  : filled ? <div className="h-3 w-3 rounded-full bg-primary-500" /> : null}
              </div>
            );
          })}
          <button type="button" onClick={() => setReveal(r => !r)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {(error || setupError) && (
            <motion.p initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
              className="text-center text-sm text-red-400">
              {error || setupError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((key, i) => {
            if (key === "") return <div key={i} />;
            const isBack = key === "⌫";
            return (
              <button key={i} type="button" onClick={() => activeSetKey(key)}
                disabled={(loading || setupLoading) || (!isBack && activePin.length >= PIN_LENGTH)}
                className={cn(
                  "h-14 rounded-2xl text-xl font-semibold transition-all duration-100 active:scale-95 select-none",
                  isBack
                    ? "bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-border flex items-center justify-center"
                    : "bg-light-surface dark:bg-dark-card text-slate-900 dark:text-white border border-light-border dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}>
                {isBack ? <Delete className="h-5 w-5 mx-auto" /> : key}
              </button>
            );
          })}
        </div>

        {/* Action button */}
        {mode === "verify" && (
          <Button fullWidth size="lg" loading={loading} disabled={pin.length !== PIN_LENGTH}
            onClick={handleSubmit} leftIcon={!loading ? <Lock className="h-4 w-4" /> : undefined}>
            Confirm Transfer
          </Button>
        )}
        {mode === "setup-enter" && (
          <Button fullWidth size="lg" disabled={pin.length !== PIN_LENGTH}
            onClick={() => { setSetupError(null); setMode("setup-confirm"); }}>
            Continue
          </Button>
        )}
        {mode === "setup-confirm" && (
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => { setMode("setup-enter"); setConfirmPin(""); setSetupError(null); }}>
              Back
            </Button>
            <Button fullWidth loading={setupLoading} disabled={confirmPin.length !== PIN_LENGTH}
              onClick={handleSetupConfirm}>
              Set PIN
            </Button>
          </div>
        )}

        {/* Forgot PIN — only in verify mode */}
        {mode === "verify" && showForgot && onForgot && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Forgot your PIN?{" "}
            <button type="button" onClick={onForgot}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Reset PIN
            </button>
          </p>
        )}
      </div>
    </Modal>
  );
}

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
const PIN_LENGTH = 4;

export default function PinModal({
  open, onClose, onSubmit, loading = false, error, title = "Enter Payment PIN",
  description = "Enter your 4-digit payment PIN to authorise this transfer.",
  showForgot = true, onForgot,
}: PinModalProps) {
  const [pin,     setPin]     = useState("");
  const [reveal,  setReveal]  = useState(false);

  // Reset PIN whenever modal opens/closes
  useEffect(() => {
    if (!open) { setPin(""); setReveal(false); }
  }, [open]);

  const handleKey = useCallback((key: string) => {
    if (key === "⌫") {
      setPin(p => p.slice(0, -1));
    } else if (pin.length < PIN_LENGTH) {
      setPin(p => p + key);
    }
  }, [pin]);

  // Also handle physical keyboard
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleKey(e.key);
      else if (e.key === "Backspace")     handleKey("⌫");
      else if (e.key === "Enter" && pin.length === PIN_LENGTH) handleSubmit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, pin, handleKey]);

  const handleSubmit = async () => {
    if (pin.length !== PIN_LENGTH || loading) return;
    await onSubmit(pin);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      <div className="py-2 space-y-6">
        {/* PIN dot display */}
        <div className="flex items-center justify-center gap-4">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const filled = i < pin.length;
            const char   = reveal ? (pin[i] ?? "") : "";
            return (
              <div key={i} className={cn(
                "h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all duration-150",
                filled
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-slate-300 dark:border-dark-border bg-light-muted dark:bg-dark-muted"
              )}>
                {reveal
                  ? <span className="text-lg font-bold text-slate-900 dark:text-white">{char}</span>
                  : filled
                    ? <div className="h-3 w-3 rounded-full bg-primary-500" />
                    : null
                }
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setReveal(r => !r)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label={reveal ? "Hide PIN" : "Show PIN"}
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((key, i) => {
            if (key === "") return <div key={i} />;
            const isBack = key === "⌫";
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleKey(key)}
                disabled={loading || (!isBack && pin.length >= PIN_LENGTH)}
                className={cn(
                  "h-14 rounded-2xl text-xl font-semibold transition-all duration-100 active:scale-95 select-none",
                  isBack
                    ? "bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-border flex items-center justify-center"
                    : "bg-light-surface dark:bg-dark-card text-slate-900 dark:text-white border border-light-border dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isBack ? <Delete className="h-5 w-5 mx-auto" /> : key}
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <Button
          fullWidth
          size="lg"
          loading={loading}
          disabled={pin.length !== PIN_LENGTH}
          onClick={handleSubmit}
          leftIcon={!loading ? <Lock className="h-4 w-4" /> : undefined}
        >
          Confirm Transfer
        </Button>

        {/* Forgot PIN */}
        {showForgot && onForgot && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Forgot your PIN?{" "}
            <button
              type="button"
              onClick={onForgot}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Reset PIN
            </button>
          </p>
        )}
      </div>
    </Modal>
  );
}
