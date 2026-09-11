import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export default function Skeleton({
  width,
  height,
  rounded = "md",
  className,
  style,
  ...props
}: SkeletonProps) {
  const roundedMap = {
    sm: "rounded",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 dark:bg-dark-muted",
        roundedMap[rounded],
        className
      )}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="16px"
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}
