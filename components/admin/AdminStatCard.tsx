import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  href?: string;
  badge?: {
    text: string;
    trend?: "up" | "down" | "neutral";
  };
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon,
  href,
  badge,
}: AdminStatCardProps) {
  const content = (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-200/60 transition-colors group-hover:bg-slate-900 group-hover:text-white">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900">
            {value}
          </span>
          {badge && (
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                badge.trend === "up"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20"
                  : badge.trend === "down"
                  ? "bg-rose-50 text-rose-700 ring-1 ring-rose-500/20"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-1">{subtitle}</p>
        )}
      </div>

      {href && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-600 group-hover:text-slate-950">
          <span>Manage</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
