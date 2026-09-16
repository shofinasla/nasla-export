import Link from "next/link";

type Template = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number | string | null;
  demo_url: string | null;
  preview_image: string | null;
  is_featured: boolean;
};

export function TemplateCard({
  template,
}: {
  template: Template;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border bg-white transition hover:-translate-y-1 hover:shadow-xl">

      {/* Preview */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">

        {template.preview_image ? (
          <img
            src={template.preview_image}
            alt={template.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm font-bold text-slate-400">
              Preview belum tersedia
            </span>
          </div>
        )}

        {template.is_featured && (
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-black shadow">
            Featured
          </span>
        )}

      </div>

      {/* Content */}
      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {template.category || "Website"}
            </p>

            <h2 className="mt-2 text-xl font-black">
              {template.name}
            </h2>
          </div>

        </div>

        {template.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
            {template.description}
          </p>
        )}

        <div className="mt-5 flex items-end justify-between gap-4">

          <div>
            <p className="text-xs text-slate-400">
              Starting from
            </p>

            <p className="text-lg font-black">
              Rp{" "}
              {Number(template.price || 0).toLocaleString(
                "id-ID"
              )}
            </p>
          </div>

          <Link
            href={`/templates/${template.slug}`}
            className="btn btn-primary text-sm"
          >
            View Detail
          </Link>

        </div>

      </div>
    </article>
  );
}