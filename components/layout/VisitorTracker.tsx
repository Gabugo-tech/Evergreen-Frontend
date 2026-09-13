"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NODE = process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000";

export default function VisitorTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Fire-and-forget — never block rendering
    const track = async () => {
      try {
        await fetch(`${NODE}/api/admin/visitors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page:       pathname,
            user_id:    user?.id    ?? null,
            user_email: user?.email ?? null,
          }),
        });
      } catch { /* silent — tracking should never break the app */ }
    };
    track();
  }, [pathname, user?.id]);

  return null; // Renders nothing
}
