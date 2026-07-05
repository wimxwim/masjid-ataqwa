import { cn } from "@/lib/utils";

interface IslamicDividerProps {
  className?: string;
}

export function IslamicDivider({ className }: IslamicDividerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 sm:gap-4 text-primary/20",
        className,
      )}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-current" />
      <svg
        viewBox="0 0 48 48"
        className="w-6 h-6 sm:w-8 sm:h-8 fill-current shrink-0"
        aria-hidden="true"
      >
        <path d="M24 0L27.5 18.5L42 9L31.5 21L48 24L31.5 27L42 39L27.5 29.5L24 48L20.5 29.5L6 39L16.5 27L0 24L16.5 21L6 9L20.5 18.5L24 0Z" />
      </svg>
      <div className="h-px flex-1 bg-current" />
    </div>
  );
}
