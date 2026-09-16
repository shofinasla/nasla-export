import { DomainSearch } from "@/components/DomainSearch";

export default function DomainsPage() {
  return <main className="container py-16">
    <h1 className="text-4xl font-black">Domain</h1>
    <p className="mt-3 text-slate-500">Search domains through the registrar integration boundary.</p>
    <div className="mt-8"><DomainSearch /></div>
  </main>;
}