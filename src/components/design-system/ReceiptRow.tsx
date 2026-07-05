import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface ReceiptRowProps {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
  mono?: boolean;
}

export function ReceiptRow({
  label,
  value,
  className,
  valueClassName,
  mono = false,
}: ReceiptRowProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center gap-4 text-xs",
        className,
      )}
    >
      <span className="text-muted font-medium shrink-0">{label}</span>
      <span
        className={cn(
          "font-semibold text-ink text-right",
          mono && "font-mono",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export interface ReceiptDividerProps {
  className?: string;
}

export function ReceiptDivider({ className }: ReceiptDividerProps) {
  return <hr className={cn("border-outline", className)} />;
}
