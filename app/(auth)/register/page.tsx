"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight,
  CheckCircle2, Leaf, Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const personalSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
});

const securitySchema = z.object({
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
  confirm_password: z.string(),
  account_type: z.enum(["personal", "business"]),
  agree_terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type Step1Data = z.infer<typeof personalSchema>;
type Step2Data = z.infer<typeof securitySchema>;

type RegisterData = Step1Data & Step2Data;

const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Security" },
  { id: 3, label: "Confirm" },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["", "bg-danger-light", "bg-warning-light", "bg-primary-500", "bg-success-light"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= score ? colors[score] : "bg-slate-200 dark:bg-dark-border"
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map((c) => (
            <span
              key={c.label}
              className={cn(
                "text-xs flex items-center gap-1",
                c.pass ? "text-success-light" : "text-slate-400"
              )}
            >
              <CheckCircle2 className="h-3 w-3" />
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={cn("text-xs font-medium", `text-${["", "danger-light", "warning-light", "primary-500", "success-light"][score]}`)}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(personalSchema),
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(securitySchema),
    defaultValues: { account_type: "personal" },
  });

  const password = form2.watch("password", "");

  const onStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2 = async (data: Step2Data) => {
    if (!step1Data) return;
    setIsLoading(true);
    try {
      const payload: RegisterData = { ...step1Data, ...data };
      console.log("Register:", payload);
      await new Promise((r) => setTimeout(r, 1500));
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full"
    >
      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-gradient-blue flex items-center justify-center shadow-glow-sm">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white">Evergreen</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all duration-300",
                step > s.id
                  ? "bg-success-light text-white"
                  : step === s.id
                  ? "bg-gradient-blue text-white shadow-glow-sm"
                  : "bg-slate-200 dark:bg-dark-muted text-slate-500"
              )}
            >
              {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
            </div>
            <span
              className={cn(
                "text-xs font-medium hidden sm:block",
                step >= s.id
                  ? "text-slate-700 dark:text-slate-300"
                  : "text-slate-400"
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px transition-all duration-300",
                  step > s.id
                    ? "bg-success-light"
                    : "bg-slate-200 dark:bg-dark-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 — Personal */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create account
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
                Let&apos;s start with your basic information
              </p>
            </div>

            <form
              onSubmit={form1.handleSubmit(onStep1)}
              noValidate
              className="space-y-4"
            >
              <Input
                label="Full name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                leftElement={<User className="h-4 w-4" />}
                error={form1.formState.errors.full_name?.message}
                {...form1.register("full_name")}
              />
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftElement={<Mail className="h-4 w-4" />}
                error={form1.formState.errors.email?.message}
                {...form1.register("email")}
              />
              <Input
                label="Phone number"
                type="tel"
                placeholder="+1 234 567 8900"
                autoComplete="tel"
                leftElement={<Phone className="h-4 w-4" />}
                error={form1.formState.errors.phone?.message}
                {...form1.register("phone")}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                className="mt-2"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continue
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 2 — Security */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Secure your account
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
                Choose a strong password and account type
              </p>
            </div>

            <form
              onSubmit={form2.handleSubmit(onStep2)}
              noValidate
              className="space-y-4"
            >
              {/* Account type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Account type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["personal", "business"] as const).map((type) => (
                    <label key={type} className="cursor-pointer">
                      <input
                        type="radio"
                        value={type}
                        className="sr-only"
                        {...form2.register("account_type")}
                      />
                      <div
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-150",
                          form2.watch("account_type") === type
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : "border-light-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700"
                        )}
                      >
                        {type === "personal" ? (
                          <User className={cn("h-5 w-5", form2.watch("account_type") === type ? "text-primary-600" : "text-slate-400")} />
                        ) : (
                          <Building2 className={cn("h-5 w-5", form2.watch("account_type") === type ? "text-primary-600" : "text-slate-400")} />
                        )}
                        <span className={cn(
                          "text-sm font-medium capitalize",
                          form2.watch("account_type") === type
                            ? "text-primary-700 dark:text-primary-300"
                            : "text-slate-600 dark:text-slate-400"
                        )}>
                          {type}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Input
                  label="Password"
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
                  error={form2.formState.errors.password?.message}
                  {...form2.register("password")}
                />
                {password && <PasswordStrength password={password} />}
              </div>

              <Input
                label="Confirm password"
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
                error={form2.formState.errors.confirm_password?.message}
                {...form2.register("confirm_password")}
              />

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded accent-primary-600"
                  {...form2.register("agree_terms")}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {form2.formState.errors.agree_terms && (
                <p className="text-xs text-danger-light">
                  {form2.formState.errors.agree_terms.message}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  size="md"
                  rightIcon={!isLoading ? <ArrowRight className="h-4 w-4" /> : undefined}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <motion.div
            key="step3"
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
              Account created!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
              Welcome to Evergreen. We&apos;ve sent a verification email to{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {step1Data?.email}
              </span>
            </p>
            <Button fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Go to Dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 3 && (
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      )}
    </motion.div>
  );
}
