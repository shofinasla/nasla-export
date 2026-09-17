"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-20 border-t bg-white">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="font-black">NASLA EXPORT</div>
          <p className="mt-2 text-sm text-slate-500">
            Digital platform for global business.
          </p>
        </div>

        <div>
          <div className="font-bold text-slate-900">Platform</div>

          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/domains" className="hover:text-slate-900">Domains</Link>
            <Link href="/templates" className="hover:text-slate-900">Templates</Link>
            <Link href="/services" className="hover:text-slate-900">Services</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
          </div>
        </div>

        <div>
          <div className="font-bold text-slate-900">Business</div>

          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/export" className="hover:text-slate-900">Export Digitalization</Link>
            <Link href="/portfolio" className="hover:text-slate-900">Portfolio</Link>
            <Link href="/blog" className="hover:text-slate-900">Blog</Link>
            <Link href="/contact" className="hover:text-slate-900">Contact Us</Link>
          </div>
        </div>

        <div>
          <div className="font-bold text-slate-900">Account</div>

          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/login" className="hover:text-slate-900">Login</Link>
            <Link href="/register" className="hover:text-slate-900">Create Account</Link>
            <Link href="/account" className="hover:text-slate-900">Customer Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="border-t py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Nasla Export. All rights reserved.
      </div>
    </footer>
  );
}
