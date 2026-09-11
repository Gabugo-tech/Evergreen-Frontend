import { HTMLAttributes } from "react";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
}

const sizeMap = {
  xs: { container: "h-6 w-6", text: "text-xs", ring: "h-1.5 w-1.5" },
  sm: { container: "h-8 w-8", text: "text-xs", ring: "h-2 w-2" },
  md: { container: "h-10 w-10", text: "text-sm", ring: "h-2.5 w-2.5" },
  lg: { container: "h-12 w-12", text: "text-base", ring: "h-3 w-3" },
  xl: { container: "h-16 w-16", text: "text-xl", ring: "h-3.5 w-3.5" },
};

export default function Avatar({
  src,
  name = "",
  size = "md",
  online,
  className,
  ...props
}: AvatarProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("relative flex-shrink-0", className)} {...props}>
      <div
        className={cn(
          s.container,
          "rounded-full overflow-hidden flex items-center justify-center",
          "bg-gradient-blue text-white font-semibold",
          "ring-2 ring-white dark:ring-dark-card"
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <span className={s.text}>{getInitials(name)}</span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            s.ring,
            "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-dark-card",
            online ? "bg-success-light" : "bg-slate-400"
          )}
        />
      )}
    </div>
  );
}
