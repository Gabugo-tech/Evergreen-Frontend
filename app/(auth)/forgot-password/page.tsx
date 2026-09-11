"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, ArrowRight, Leaf, CheckCircle2, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const _otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type EmailData = z.infer<typeof emailSchema>;
type _OtpData = z.infer<typeof _otpSchema>;
type ResetData = z.infer<typeof resetSchema>;

type Stage = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  const emailForm = useForm<EmailData>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetData>({ resolver: zodResolver(resetSchema) });

  const onEmailSubmit = async (data: EmailData) => {
    setIsLoading(true);
    setEmail(data.email);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setStage("otp");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    // auto-advance
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    // auto-submit when all filled
    if (updated.every((d) => d) && updated.join("").length === 6) {
      setTimeout(() => verifyOtp(updated.join("")), 300);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    setIsLoading(true);
    console.log("OTP:", code);
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    setStage("reset");
  };

  const onResetSubmit = async (data: ResetData) => {
    setIsLoading(true);
    console.log("New password:", data.password);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setStage("done");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-gradient-blue flex items-center justify-center shadow-glow-sm">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white">Evergreen</span>
      </div>

      <AnimatePresence mode="wait">
        {/* Stage: Email */}
        {stage === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-8">
              <div className="h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-5">
                <KeyRound className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Forgot password?
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                No worries. Enter your email and we&apos;ll send you a reset code.
              </p>
            </div>

            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              noValidate
              className="space-y-4"
            >
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftElement={<Mail className="h-4 w-4" />}
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register("email")}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isLoading}
                rightIcon={!isLoading ? <ArrowRight className="h-4 w-4" /> : undefined}
              >
                Send Reset Code
              </Button>
            </form>

            <p className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </p>
          </motion.div>
        )}

        {/* Stage: OTP */}
        {stage === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-8">
              <div className="h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-5">
                <Mail className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Check your email
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {email}
                </span>
              </p>
            </div>

            {/* OTP input boxes */}
            <div className="flex gap-3 justify-center mb-6">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-14 w-12 text-center text-xl font-semibold rounded-xl border-2 border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition-all"
                  aria-label={`OTP digit ${i + 1}`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <Button
              fullWidth
              size="lg"
              loading={isLoading}
              onClick={() => verifyOtp(otpDigits.join(""))}
              disabled={otpDigits.some((d) => !d)}
            >
              Verify Code
            </Button>

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                onClick={() => onEmailSubmit({ email })}
              >
                Resend
              </button>
            </p>

            <p className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setStage("email")}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Change email
              </button>
            </p>
          </motion.div>
        )}

        {/* Stage: New Password */}
        {stage === "reset" && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-8">
              <div className="h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-5">
                <Lock className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                New password
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                Choose a strong password for your account
              </p>
            </div>

            <form
              onSubmit={resetForm.handleSubmit(onResetSubmit)}
              noValidate
              className="space-y-4"
            >
              <Input
                label="New password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                leftElement={<Lock className="h-4 w-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={resetForm.formState.errors.password?.message}
                {...resetForm.register("password")}
              />

              <Input
                label="Confirm new password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                autoComplete="new-password"
                leftElement={<Lock className="h-4 w-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={resetForm.formState.errors.confirm_password?.message}
                {...resetForm.register("confirm_password")}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isLoading}
                rightIcon={!isLoading ? <ArrowRight className="h-4 w-4" /> : undefined}
              >
                Reset Password
              </Button>
            </form>
          </motion.div>
        )}

        {/* Stage: Done */}
        {stage === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="text-center py-8"
          >
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-success-bg dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-success-light" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Password reset!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
            <Link href="/login">
              <Button fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Back to Sign In
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
