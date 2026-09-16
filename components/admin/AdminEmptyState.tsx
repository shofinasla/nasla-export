import React from "react";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";

interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function AdminEmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
  className = "",
}: AdminEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center transition-all ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shadow-xs">
        {icon || <FolderOpen className="h-6 w-6 stroke-[1.75]" />}
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800 hover:shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          {actionLabel}
        </Link>
      )}
      {!actionHref && onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800 hover:shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
