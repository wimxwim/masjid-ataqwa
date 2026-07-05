import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  size?: "default" | "large";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  size = "default",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        align === "left" && "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-display font-extrabold text-ink tracking-tighter leading-tight",
          size === "large"
            ? "text-3xl sm:text-4xl md:text-5xl"
            : "text-2xl sm:text-3xl md:text-4xl",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-sm text-muted leading-relaxed",
            align === "center" && "max-w-2xl",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
