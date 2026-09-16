"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function TemplateFilters({ categories, currentCategory, currentQuery }: { categories: string[]; currentCategory: string; currentQuery: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(currentQuery);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (query.trim()) next.set("q", query.trim()); else next.delete("q");
    if (currentCategory) next.set("category", currentCategory); else next.delete("category");
    router.push(`/templates${next.toString() ? `?${next.toString()}` : ""}`);
  }

  function categoryChange(category: string) {
    const next = new URLSearchParams(params.toString());
    if (category) next.set("category", category); else next.delete("category");
    if (query.trim()) next.set("q", query.trim()); else next.delete("q");
    router.push(`/templates${next.toString() ? `?${next.toString()}` : ""}`);
  }

  return (
    <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
      <form onSubmit={submit} className="flex gap-2">
        <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari template..." aria-label="Cari template" />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>
      <select className="input md:w-64" value={currentCategory} onChange={(e) => categoryChange(e.target.value)} aria-label="Filter kategori">
        <option value="">Semua kategori</option>
        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
    </div>
  );
}
