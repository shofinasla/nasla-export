import Link from "next/link";

export function Header() {
  return <header className="border-b bg-white">
    <div className="container flex h-16 items-center justify-between">
      <Link href="/" className="text-xl font-black tracking-tight">NASLA EXPORT</Link>
      <nav className="hidden gap-5 text-sm font-semibold md:flex">
        <Link href="/domains">Domain</Link>
        <Link href="/templates">Templates</Link>
        <Link href="/services">Services</Link>
        <Link href="/export">Export Digitalization</Link>
        <Link href="/blog">Blog</Link>
      </nav>
      <div className="flex gap-2">
        <Link className="btn btn-secondary text-sm" href="/login">Login</Link>
        <Link className="btn btn-primary text-sm" href="/contact">Contact</Link>
      </div>
    </div>
  </header>;
}