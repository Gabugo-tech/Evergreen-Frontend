import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "green" | "red" | "yellow" | "neutral" | "purple";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue:    "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  green:   "bg-success-bg text-success-dark dark:bg-green-900/40 dark:text-green-400",
  red:     "bg-danger-bg text-danger-dark dark:bg-red-900/40 dark:text-red-400",
  yellow:  "bg-warning-bg text-warning-dark dark:bg-yellow-900/40 dark:text-yellow-400",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  purple:  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const dotColors: Record<BadgeVariant, string> = {
  blue:    "bg-primary-500",
  green:   "bg-success-light",
  red:     "bg-danger-light",
  yellow:  "bg-warning-light",
  neutral: "bg-slate-400",
  purple:  "bg-purple-500",
};

export default function Badge({
  variant = "neutral",
  dot = false,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
