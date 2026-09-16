"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Map segments to friendly labels
  const labelMap: Record<string, string> = {
    admin: "Admin",
    templates: "Templates",
    new: "New Template",
    edit: "Edit",
    customers: "Customers",
    orders: "Orders",
    domains: "Domains",
    inquiries: "Inquiries",
    blog: "Blog CMS",
    settings: "Settings",
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-slate-400 transition-colors hover:text-slate-900"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const label = labelMap[segment] || segment;

        if (index === 0 && segment === "admin") return null;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-none">
                {label}
              </span>
            ) : (
              <Link
                href={path}
                className="text-slate-500 transition-colors hover:text-slate-900 truncate max-w-[120px] sm:max-w-none"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
