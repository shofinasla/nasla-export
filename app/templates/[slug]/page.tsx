import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: template, error } = await supabase.from("templates").select("*").eq("slug", slug).eq("is_published", true).single();
  if (error || !template) notFound();

  const screenshots = list(template.screenshots);
  const features = list(template.features);
  const techStack = list(template.tech_stack);

  return (
    <main className="container py-12 md:py-16">
      <Link href="/templates" className="text-sm font-bold text-slate-500">← Back to Templates</Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.35fr_.65fr]">
        <section>
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            {template.preview_image ? <img src={template.preview_image} alt={template.name} className="max-h-[620px] w-full object-cover" /> : <div className="flex min-h-[420px] items-center justify-center bg-slate-100 font-black text-slate-400">NASLA EXPORT TEMPLATE</div>}
          </div>
          {screenshots.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {screenshots.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`${template.name} screenshot ${index + 1}`} className="w-full rounded-2xl border bg-white object-cover" />)}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border bg-white p-7 shadow-sm lg:sticky lg:top-6">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">{template.category || "Website"}</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight">{template.name}</h1>
          <p className="mt-4 leading-7 text-slate-500">{template.description || "Template profesional untuk kebutuhan bisnis."}</p>
          <div className="mt-7 border-t pt-6">
            <p className="text-xs text-slate-400">Harga template</p>
            <p className="mt-1 text-3xl font-black">Rp {Number(template.price).toLocaleString("id-ID")}</p>
          </div>
          <div className="mt-7 grid gap-3">
            {template.demo_url && <a className="btn btn-secondary" href={template.demo_url} target="_blank" rel="noreferrer">Live Demo ↗</a>}
            <Link className="btn btn-primary" href={`/contact?template=${encodeURIComponent(template.slug)}`}>Request / Buy Template</Link>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">Pembelian dan pembayaran akan diaktifkan pada tahap commerce. Untuk sekarang, gunakan Request / Buy untuk inquiry.</p>
        </aside>
      </div>

      {(features.length > 0 || techStack.length > 0) && (
        <section className="mt-14 grid gap-8 md:grid-cols-2">
          {features.length > 0 && <div className="card"><h2 className="text-2xl font-black">Features</h2><ul className="mt-5 grid gap-3">{features.map((item) => <li key={item} className="flex gap-3 text-slate-600"><span className="font-black">✓</span><span>{item}</span></li>)}</ul></div>}
          {techStack.length > 0 && <div className="card"><h2 className="text-2xl font-black">Technology</h2><div className="mt-5 flex flex-wrap gap-2">{techStack.map((item) => <span key={item} className="rounded-full border px-3 py-2 text-sm font-bold text-slate-600">{item}</span>)}</div></div>}
        </section>
      )}
    </main>
  );
}
