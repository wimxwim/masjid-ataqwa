import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionShellProps {
  children: ReactNode;
  className?: string;
  id?: string;
  padded?: boolean;
  contained?: boolean;
}

export function SectionShell({
  children,
  className,
  id,
  padded = true,
  contained = true,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn(padded && "py-16 lg:py-20 px-4 sm:px-6 lg:px-8", className)}
    >
      {contained ? (
        <div className="max-w-7xl mx-auto">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
