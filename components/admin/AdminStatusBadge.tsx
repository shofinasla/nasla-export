import React from "react";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "slate"
  | "emerald"
  | "amber"
  | "blue"
  | "rose";

interface AdminStatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

export function AdminStatusBadge({
  status,
  variant,
  className = "",
}: AdminStatusBadgeProps) {
  const normalized = (status || "").toLowerCase().trim();

  // Determine variant automatically if not provided
  let computedVariant: BadgeVariant = variant || "slate";

  if (!variant) {
    if (
      [
        "active",
        "published",
        "paid",
        "completed",
        "won",
        "qualified",
        "success",
      ].includes(normalized)
    ) {
      computedVariant = "emerald";
    } else if (
      [
        "pending",
        "processing",
        "quoted",
        "draft",
        "warning",
        "contacted",
      ].includes(normalized)
    ) {
      computedVariant = "amber";
    } else if (
      [
        "cancelled",
        "refunded",
        "inactive",
        "lost",
        "failed",
        "danger",
        "error",
      ].includes(normalized)
    ) {
      computedVariant = "rose";
    } else if (["new", "info", "admin"].includes(normalized)) {
      computedVariant = "blue";
    } else if (["featured", "vip", "customer"].includes(normalized)) {
      computedVariant = "purple";
    }
  }

  const variantStyles: Record<BadgeVariant, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10",
    amber: "bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/10",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/10",
    rose: "bg-rose-50 text-rose-700 border-rose-200/80 ring-1 ring-rose-500/10",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80 ring-1 ring-rose-500/10",
    blue: "bg-blue-50 text-blue-700 border-blue-200/80 ring-1 ring-blue-500/10",
    info: "bg-blue-50 text-blue-700 border-blue-200/80 ring-1 ring-blue-500/10",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80 ring-1 ring-purple-500/10",
    slate: "bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-400/10",
  };

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "-";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors ${
        variantStyles[computedVariant] || variantStyles.slate
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          computedVariant === "emerald" || computedVariant === "success"
            ? "bg-emerald-500"
            : computedVariant === "amber" || computedVariant === "warning"
            ? "bg-amber-500"
            : computedVariant === "rose" || computedVariant === "danger"
            ? "bg-rose-500"
            : computedVariant === "blue" || computedVariant === "info"
            ? "bg-blue-500"
            : computedVariant === "purple"
            ? "bg-purple-500"
            : "bg-slate-400"
        }`}
      />
      {label}
    </span>
  );
}
