import { createClient } from "@/lib/supabase/server";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateFilters } from "@/components/templates/TemplateFilters";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  category?: string;
}>;

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const q =
    typeof params.q === "string"
      ? params.q.trim()
      : "";

  const category =
    typeof params.category === "string"
      ? params.category.trim()
      : "";

  const supabase = await createClient();

  let query = supabase
    .from("templates")
    .select(
      "id,name,slug,description,category,price,demo_url,preview_image,is_featured,sort_order,created_at"
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`
    );
  }

  const { data: templatesData, error } = await query;

  if (error) {
    console.warn("Supabase templates query error:", error.message);
  }
  const templates = error ? [] : (templatesData ?? []);

  const { data: categoryRows } = await supabase
    .from("templates")
    .select("category")
    .eq("is_published", true)
    .not("category", "is", null);

  const categories = Array.from(
    new Set(
      (categoryRows ?? [])
        .map((row) => row.category)
        .filter(
          (value): value is string =>
            Boolean(value)
        )
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <main className="container py-12 md:py-16">

      {/* HERO */}
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
          NASLA EXPORT
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Website Templates
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-500">
          Template profesional untuk UMKM, perusahaan,
          e-commerce, dan bisnis ekspor.
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <TemplateFilters
        categories={categories}
        currentCategory={category}
        currentQuery={q}
      />

      {/* RESULT COUNT */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-slate-500">
          {templates?.length ?? 0} template tersedia
        </p>

        {q || category ? (
          <a
            href="/templates"
            className="text-sm font-bold text-slate-700 underline"
          >
            Reset filter
          </a>
        ) : null}
      </div>

      {/* TEMPLATE GRID */}
      {templates && templates.length > 0 ? (
        <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
            />
          ))}

        </div>
      ) : (

        /* EMPTY STATE */

        <div className="mt-5 rounded-3xl border bg-white px-6 py-16 text-center">

          <h2 className="text-2xl font-black">
            Template tidak ditemukan
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Belum ada template yang cocok dengan
            pencarian atau kategori tersebut.
          </p>

          <a
            href="/templates"
            className="btn btn-primary mt-6"
          >
            Lihat Semua Template
          </a>

        </div>
      )}

    </main>
  );
}