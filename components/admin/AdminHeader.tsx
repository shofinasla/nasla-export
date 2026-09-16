"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Shield,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { logout } from "@/app/logout/actions";

interface AdminHeaderProps {
  user: {
    id: string;
    email?: string;
    full_name?: string;
    role?: string;
  };
  onToggleMobileMenu: () => void;
}

export function AdminHeader({ user, onToggleMobileMenu }: AdminHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const displayName = user.full_name || user.email?.split("@")[0] || "Admin";
  const displayEmail = user.email || "admin@naslaexport.com";
  const displayRole = user.role === "admin" ? "Administrator" : "Staff";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left side: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <AdminBreadcrumb />
        </div>
      </div>

      {/* Right side: Search, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Search trigger / link to templates */}
        <Link
          href="/admin/templates"
          className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100/70"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span>Quick search catalog...</span>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            /
          </kbd>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="View Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Notifications
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  System Online
                </span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="font-bold text-slate-800">Supabase Connected</p>
                  <p className="mt-0.5 text-slate-500">
                    Database tables synced. Ready for global inquiries & templates.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="font-bold text-slate-800">Export Marketplace</p>
                  <p className="mt-0.5 text-slate-500">
                    Live catalog ready for customer inquiries and domain checks.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white p-1.5 pr-3 text-left transition-all hover:border-slate-300 hover:bg-slate-50"
            aria-label="User profile menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-white font-black text-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-bold leading-none text-slate-900 line-clamp-1">
                {displayName}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                {displayRole}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="border-b border-slate-100 px-2 pb-3">
                <p className="text-xs font-bold text-slate-900">{displayName}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                  {displayEmail}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  <Shield className="h-3 w-3 text-slate-600" />
                  <span>{displayRole}</span>
                </div>
              </div>

              <div className="mt-2 space-y-1 text-xs font-medium">
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  href="/account"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  <span>Customer View</span>
                </Link>
              </div>

              <div className="mt-2 border-t border-slate-100 pt-2">
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
