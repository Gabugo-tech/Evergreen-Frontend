"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, Leaf, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

const ADMIN_EMAIL = "nnanwubagabriel@gmail.com";
const ADMIN_TOKEN_KEY = "eg_admin_token";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Only allow the designated admin email
      if (data.email.toLowerCase() !== ADMIN_EMAIL) {
        toast.error("Access denied. This portal is for administrators only.");
        return;
      }

      // Call Node backend to authenticate
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message ?? "Invalid credentials");
        return;
      }

      const token = json.data?.token;
      if (!token) { toast.error("Authentication failed"); return; }

      // Store admin session
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      sessionStorage.setItem("eg_admin_email", data.email.toLowerCase());
      // Also store in normal token so dashboard auth guard passes
      localStorage.setItem("eg_token", token);
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg bg-mesh flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-glow-blue mb-4">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-1">Evergreen Secure Administration</p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-6">
            <Lock className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300 leading-relaxed">
              Restricted access. Unauthorised access attempts are logged and may result in legal action.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              leftElement={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              leftElement={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              Access Admin Panel
            </Button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            Not an admin?{" "}
            <a href="/login" className="text-primary-400 hover:underline">Return to app</a>
          </p>
        </div>

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="h-6 w-6 rounded-lg bg-gradient-blue flex items-center justify-center">
            <Leaf className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-400">Evergreen</span>
        </div>
      </motion.div>
    </div>
  );
}
