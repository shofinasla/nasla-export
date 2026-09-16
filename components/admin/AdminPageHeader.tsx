import React from "react";

interface AdminPageHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  tag = "NASLA EXPORT ADMIN",
  title,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 md:flex-row md:items-center md:justify-between">
      <div>
        {tag && (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {tag}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-slate-500 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2.5 pt-1 md:pt-0">
          {children}
        </div>
      )}
    </div>
  );
}
