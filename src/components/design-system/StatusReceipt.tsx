import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

type ReceiptStatus = "success" | "pending" | "error";

const statusConfig: Record<
  ReceiptStatus,
  { wrapperBg: string; iconColor: string; glow: string }
> = {
  success: {
    wrapperBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    glow: "shadow-glow",
  },
  pending: {
    wrapperBg: "bg-amber-100",
    iconColor: "text-amber-600",
    glow: "shadow-glow-amber",
  },
  error: {
    wrapperBg: "bg-red-100",
    iconColor: "text-red-600",
    glow: "shadow-glow-red",
  },
};

interface StatusReceiptAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
}

export interface StatusReceiptProps {
  status: ReceiptStatus;
  icon: ReactNode;
  title: string;
  message: string;
  children: ReactNode;
  primaryAction?: StatusReceiptAction;
  secondaryAction?: StatusReceiptAction;
}

export function StatusReceipt({
  status,
  icon,
  title,
  message,
  children,
  primaryAction,
  secondaryAction,
}: StatusReceiptProps) {
  const cfg = statusConfig[status];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div
        className={cn(
          "w-full max-w-lg glass-strong rounded-[var(--radius-card)] shadow-4 overflow-hidden",
          "animate-scale-in",
        )}
      >
        {/* Header */}
        <div className="glass-dark text-white px-6 py-8 text-center space-y-3 relative">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
              cfg.wrapperBg,
              cfg.iconColor,
              cfg.glow,
            )}
          >
            {icon}
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-emerald-100/80 max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">{children}</div>

        {/* Footer actions */}
        {(primaryAction || secondaryAction) && (
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 grid grid-cols-2 gap-3">
            {primaryAction && (
              <Link
                href={primaryAction.href}
                className={cn(
                  "flex items-center justify-center gap-1.5",
                  !secondaryAction && "col-span-2",
                  "bg-primary hover:bg-primary-dark text-white",
                  "font-bold py-3 rounded-xl text-xs sm:text-sm",
                  "shadow-md shadow-primary/10 hover:shadow-glow",
                  "active:scale-95 transition-all",
                )}
              >
                {primaryAction.icon}
                {primaryAction.label}
              </Link>
            )}
            {secondaryAction && (
              <Link
                href={secondaryAction.href}
                className={cn(
                  "flex items-center justify-center gap-1.5",
                  "glass border-white/40 dark:border-white/10 text-ink",
                  "font-bold py-3 rounded-xl text-xs sm:text-sm",
                  "hover:bg-surface/80 active:scale-95 transition-all",
                )}
              >
                {secondaryAction.icon}
                {secondaryAction.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
