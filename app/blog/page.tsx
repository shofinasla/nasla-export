import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog | Nasla Export",
  description:
    "Export guides, market insights, business tips, and digital resources from Nasla Export.",
};

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, category, featured_image, published_at, created_at"
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Public blog query error:", error.message);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Nasla Export Journal
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Export Insights & Business Resources
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Practical guides, market insights, export knowledge, and digital
              business resources for companies ready to grow globally.
            </p>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {posts && posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.featured_image ? (
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-slate-100">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Nasla Export
                      </span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-600">
                      {post.category || "General"}
                    </span>

                    <span className="text-slate-400">
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-black leading-tight text-slate-950">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="transition-colors hover:text-slate-600"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {post.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {post.excerpt}
                    </p>
                  )}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-6 inline-flex items-center text-sm font-bold text-slate-900"
                  >
                    Read article
                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No published articles yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Published articles from the Admin Blog will appear here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}