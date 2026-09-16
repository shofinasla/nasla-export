import Link from "next/link";

export function Footer() {
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
          <div className="font-bold">Platform</div>

          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/domains">Domains</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/services">Services</Link>
          </div>
        </div>

        <div>
          <div className="font-bold">Business</div>

          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/export">Export Digitalization</Link>
            <Link href="/portfolio">Portfolio</Link>
            <Link href="/blog">Blog</Link>
          </div>
        </div>

        <div>
          <div className="font-bold">Account</div>

          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/login">Login</Link>
            <Link href="/account">Customer Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="border-t py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Nasla Export. All rights reserved.
      </div>
    </footer>
  );
}