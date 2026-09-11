"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Leaf, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // TODO: call auth API
      console.log("Login:", data);
      await new Promise((r) => setTimeout(r, 1200));
      // router.push("/dashboard");
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

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Sign in to your Evergreen account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftElement={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="current-password"
          leftElement={<Lock className="h-4 w-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className={cn(
                "h-4 w-4 rounded border-light-border dark:border-dark-border",
                "accent-primary-600 cursor-pointer"
              )}
              {...register("remember")}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Remember me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          size="lg"
          rightIcon={!isLoading ? <ArrowRight className="h-4 w-4" /> : undefined}
        >
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          OR
        </span>
        <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Google",
            icon: (
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            ),
          },
          {
            label: "Apple",
            icon: (
              <svg className="h-5 w-5 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.017 0C8.396.06 5.5 3.09 5.5 3.09S3.5 1.5 1 3c0 0 2 2.5 2 6 0 4.5-2 6-2 6s2.5 1 4.5-.5c0 0 1 2.5 4.5 3 0 0-1-2 0-4s3-2 3-2-1 0-1-2c0 0 4 1 5-3 0 0-2 0-3-2 0 0 .5-3-1.983-5z" />
              </svg>
            ),
          },
        ].map((provider) => (
          <button
            key={provider.label}
            type="button"
            className="btn-secondary justify-center gap-2 py-2.5"
            aria-label={`Continue with ${provider.label}`}
          >
            {provider.icon}
            <span className="text-sm">{provider.label}</span>
          </button>
        ))}
      </div>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Create account
        </Link>
      </p>
    </motion.div>
  );
}
