"use client";

import { Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface SmartEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  ghostRows?: number;
}

export default function SmartEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  ghostRows = 3,
}: SmartEmptyStateProps) {
  const ActionButton = () => (
    <button
      onClick={onAction}
      className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors shadow-sm"
    >
      <Plus className="w-4 h-4" />
      {actionLabel}
    </button>
  );

  return (
    <div className="bg-surface border border-outline rounded-2xl p-8 md:p-12">
      <div className="max-w-md mx-auto text-center space-y-5">
        {Icon && (
          <div className="mx-auto w-16 h-16 rounded-2xl bg-success-subtle flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-display font-bold text-xl text-ink">{title}</h3>
          <p className="text-sm text-muted leading-relaxed">{description}</p>
        </div>

        {actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </Link>
        ) : (
          <ActionButton />
        )}

        {secondaryLabel && secondaryHref && (
          <div className="pt-2">
            <Link
              href={secondaryHref}
              className="text-xs text-primary hover:underline font-medium"
            >
              {secondaryLabel}
            </Link>
          </div>
        )}
      </div>

      {/* Ghost rows preview */}
      {ghostRows > 0 && (
        <div className="mt-8 border border-dashed border-outline rounded-xl overflow-hidden opacity-40">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg border-b border-outline">
                {Array.from({ length: 4 }).map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ghostRows }).map((_, i) => (
                <tr key={i} className="border-b border-outline last:border-0">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-gray-100 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
