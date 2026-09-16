import Link from "next/link";

type Template = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number | string;
  demo_url: string | null;
  preview_image: string | null;
  is_featured?: boolean;
};

export function TemplateCard({ template }: { template: Template }) {
  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/templates/${template.slug}`} aria-label={`Lihat ${template.name}`}>
        {template.preview_image ? (
          <img src={template.preview_image} alt={template.name} className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-52 items-center justify-center bg-slate-100 text-sm font-bold text-slate-400">NASLA EXPORT</div>
        )}
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">{template.category || "Website"}</span>
          {template.is_featured && <span className="text-xs font-bold text-slate-900">Featured</span>}
        </div>
        <h2 className="mt-3 text-xl font-black">{template.name}</h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">{template.description || "Template profesional untuk kebutuhan bisnis."}</p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Mulai dari</p>
            <p className="text-lg font-black">Rp {Number(template.price).toLocaleString("id-ID")}</p>
          </div>
          <Link className="btn btn-primary text-sm" href={`/templates/${template.slug}`}>View Details</Link>
        </div>
      </div>
    </article>
  );
}
