"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, ElementType, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "dark";
  hover?: boolean;
  glow?: boolean;
  accentGlow?: boolean;
  rounded?: "card" | "2xl" | "3xl";
  as?: ElementType;
  style?: CSSProperties;
  id?: string;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  hover = false,
  glow = false,
  accentGlow = false,
  rounded = "card",
  as: Component = "div",
  style,
  id,
}: GlassCardProps) {
  const variantClasses = {
    default: "glass border-white/45 dark:border-white/10",
    strong: "glass-strong border-white/60 dark:border-white/15",
    dark: "glass-dark border-white/10 text-white",
  };

  const roundedClasses = {
    card: "rounded-[var(--radius-card)]",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
  };

  return (
    <Component
      id={id}
      className={cn(
        variantClasses[variant],
        roundedClasses[rounded],
        "shadow-2",
        hover && "hover-lift hover:hover-lift-active",
        glow && "hover:shadow-glow",
        accentGlow && "hover:shadow-glow-accent",
        className,
      )}
      style={style}
    >
      {children}
    </Component>
  );
}
