"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LayoutTemplate,
  ShoppingCart,
  Globe,
  MessageSquare,
  FileText,
  Settings,
  ChevronDown,
  Plus,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  subItems?: { name: string; href: string; icon?: React.ElementType }[];
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  // Navigation Items
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      name: "Templates",
      href: "/admin/templates",
      icon: LayoutTemplate,
      subItems: [
        { name: "All Templates", href: "/admin/templates" },
        { name: "Add Template", href: "/admin/templates/new", icon: Plus },
      ],
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Domains",
      href: "/admin/domains",
      icon: Globe,
    },
    {
      name: "Inquiries",
      href: "/admin/inquiries",
      icon: MessageSquare,
    },
    {
      name: "Blog CMS",
      href: "/admin/blog",
      icon: FileText,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  // Accordion state for items with subItems (auto-open if current path matches)
  const isTemplateActive = pathname.startsWith("/admin/templates");
  const [templateOpen, setTemplateOpen] = useState<boolean>(isTemplateActive || true);

  return (
    <aside className="flex h-full flex-col justify-between bg-slate-950 text-white w-64 border-r border-slate-800/80">
      {/* Brand Header */}
      <div>
        <div className="border-b border-slate-800/80 px-6 py-5">
          <Link
            href="/admin"
            className="group flex items-center gap-3"
            onClick={onCloseMobile}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-950 font-black shadow-md shadow-white/5 transition-transform group-hover:scale-105">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white">
                  NASLA EXPORT
                </span>
                <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-slate-300">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 tracking-wide">
                Digital Platform for Global Business
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Management
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasSub = !!item.subItems;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              if (hasSub) {
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setTemplateOpen(!templateOpen)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-white/10 text-white shadow-xs"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-white"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                          templateOpen ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </button>

                    {templateOpen && (
                      <div className="ml-4 space-y-1 border-l border-slate-800 pl-3 pt-1">
                        {item.subItems?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={onCloseMobile}
                              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                isSubActive
                                  ? "bg-white text-slate-950 font-bold"
                                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span>{sub.name}</span>
                              {SubIcon && (
                                <SubIcon className="h-3 w-3 opacity-70" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-slate-950 font-bold shadow-md shadow-white/5"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-slate-950"
                          : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Storefront Quick Link */}
      <div className="border-t border-slate-800/80 p-3">
        <Link
          href="/"
          target="_blank"
          className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-900 hover:text-white"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 group-hover:text-white">
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-200">View Storefront</p>
              <p className="text-[10px] text-slate-400">naslaexport.com</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400">↗</span>
        </Link>
      </div>
    </aside>
  );
}
