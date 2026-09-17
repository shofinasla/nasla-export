"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Globe,
  LayoutTemplate,
  Briefcase,
  TrendingUp,
  FileText,
  DollarSign,
  PhoneCall,
  Menu,
  X,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Desktop user dropdown state
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  // Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  // If inside admin dashboard, public header is hidden (Admin has its own layout)
  const isAdminRoute = pathname?.startsWith("/admin");

  // Fetch and listen to Supabase auth state
  useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", authUser.id)
            .single();

          setUser({
            id: authUser.id,
            email: authUser.email ?? "",
            full_name: profile?.full_name || authUser.user_metadata?.full_name || null,
            role: profile?.role || "customer",
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth fetch error:", err);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    }

    fetchUser();

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: profile?.full_name || session.user.user_metadata?.full_name || null,
          role: profile?.role || "customer",
        });
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Handle outside click for desktop user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }

    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  if (isAdminRoute) return null;

  const navLinks = [
    { label: "Domains", href: "/domains", icon: Globe },
    { label: "Templates", href: "/templates", icon: LayoutTemplate },
    { label: "Services", href: "/services", icon: Briefcase },
    { label: "Export Digital", href: "/export", icon: TrendingUp },
    { label: "Portfolio", href: "/portfolio", icon: Layers },
    { label: "Pricing", href: "/pricing", icon: DollarSign },
    { label: "Blog", href: "/blog", icon: FileText },
  ];

  const getInitials = (name?: string | null, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  return (
    <header
      id="main-public-header"
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all"
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            id="header-brand-logo"
            className="group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs transition-transform group-hover:scale-105">
              <Globe className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-lg">
                NASLA EXPORT
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-600 sm:block">
                Global Digital Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          id="desktop-navigation"
          aria-label="Main Navigation"
          className="hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  isActive
                    ? "bg-slate-100 font-bold text-slate-900"
                    : "hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Contact Us - Quick Link on Desktop */}
          <Link
            href="/contact"
            id="header-contact-link"
            className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
          >
            <PhoneCall className="h-3.5 w-3.5 text-slate-600" />
            <span>Contact</span>
          </Link>

          {/* Dynamic Authentication Controls */}
          {loadingAuth ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-100" />
          ) : user ? (
            /* Authenticated User Menu */
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                id="user-menu-button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 text-left transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-xs">
                  {getInitials(user.full_name, user.email)}
                </div>
                <div className="hidden max-w-[120px] flex-col text-left sm:flex md:max-w-[150px]">
                  <span className="truncate text-xs font-bold text-slate-900">
                    {user.full_name || user.email.split("@")[0]}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 capitalize">
                    {user.role || "customer"}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-600 transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Desktop User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5"
                >
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="text-xs font-bold text-slate-900">
                      {user.full_name || "Nasla User"}
                    </p>
                    <p className="truncate text-[11px] text-slate-600">{user.email}</p>
                    <div className="mt-1.5">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {user.role === "admin" ? "Admin Access" : "Customer Account"}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        id="dropdown-link-admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      href="/account"
                      id="dropdown-link-account"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <User className="h-4 w-4 text-slate-600" />
                      <span>Customer Dashboard</span>
                    </Link>

                    <Link
                      href="/account/profile"
                      id="dropdown-link-profile"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <User className="h-4 w-4 text-slate-600" />
                      <span>Edit Profile</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      id="dropdown-btn-signout"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Controls */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                id="header-login-button"
                className="btn btn-secondary text-xs font-bold sm:text-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                id="header-register-button"
                className="btn btn-primary hidden text-xs font-bold sm:inline-flex sm:text-sm"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            id="mobile-menu-toggle-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-slate-900" />
            ) : (
              <Menu className="h-5 w-5 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 top-16 z-50 flex flex-col bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="flex max-h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto border-b border-slate-200 bg-white p-5 shadow-2xl transition-all">
            {/* User Info Bar if Logged In */}
            {user ? (
              <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-xs">
                    {getInitials(user.full_name, user.email)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user.full_name || "Customer Account"}
                    </p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-xs">
                    {user.role || "customer"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3">
                  <Link
                    href="/account"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/account/profile"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
                  >
                    <span>Profile</span>
                  </Link>
                </div>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Open Admin Panel</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="btn btn-secondary flex items-center justify-center py-2.5 text-xs font-bold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary flex items-center justify-center py-2.5 text-xs font-bold"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Navigation Group 1: Platform & Solutions */}
            <div className="space-y-1 py-2">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Platform & Solutions
              </p>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-white" : "text-slate-500"
                        }`}
                      />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 ${
                        isActive ? "text-white/70" : "text-slate-300"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Navigation Group 2: Support & Company */}
            <div className="mt-2 space-y-1 border-t border-slate-100 pt-3">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Support & Contact
              </p>
              <Link
                href="/contact"
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname === "/contact"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <PhoneCall
                    className={`h-4 w-4 ${
                      pathname === "/contact" ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <span>Contact Sales & Support</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 ${
                    pathname === "/contact" ? "text-white/70" : "text-slate-300"
                  }`}
                />
              </Link>
            </div>

            {/* Logout button in mobile drawer if logged in */}
            {user && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100/80"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
