"use client";

import { FormEvent, useState } from "react";

type Props = {
  categories: string[];
  currentCategory?: string;
  currentQuery?: string;
};

export function TemplateFilters({
  categories,
  currentCategory = "",
  currentQuery = "",
}: Props) {
  const [query, setQuery] = useState(currentQuery);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (currentCategory) {
      params.set("category", currentCategory);
    }

    const search = params.toString();

    window.location.href = search
      ? `/templates?${search}`
      : "/templates";
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_220px_auto]"
    >
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari template..."
        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
      />

      <select
        value={currentCategory}
        onChange={(event) => {
          const category = event.target.value;
          const params = new URLSearchParams();

          if (query.trim()) {
            params.set("q", query.trim());
          }

          if (category) {
            params.set("category", category);
          }

          const search = params.toString();

          window.location.href = search
            ? `/templates?${search}`
            : "/templates";
        }}
        className="rounded-xl border px-4 py-3 outline-none"
      >
        <option value="">Semua kategori</option>

        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="btn btn-primary"
      >
        Cari
      </button>
    </form>
  );
}