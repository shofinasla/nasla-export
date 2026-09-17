import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPost(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, category, featured_image, published_at, created_at"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | Nasla Export",
    };
  }

  return {
    title: `${post.title} | Nasla Export`,
    description:
      post.excerpt ||
      "Export insights and business resources from Nasla Export.",
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description:
        post.excerpt ||
        "Export insights and business resources from Nasla Export.",
      type: "article",
      publishedTime: post.published_at || post.created_at,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Article Header */}
      <header className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
          <Link
            href="/blog"
            className="text-sm font-bold text-slate-500 hover:text-slate-900"
          >
            ← Back to Blog
          </Link>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-slate-900 px-3 py-1 font-bold text-white">
                {post.category || "General"}
              </span>

              <span className="text-slate-500">
                {formatDate(post.published_at || post.created_at)}
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-6 text-lg leading-8 text-slate-600">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="mx-auto max-w-5xl px-6 pt-10 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={post.featured_image}
              alt={post.title}
              className="max-h-[600px] w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="mx-auto max-w-3xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
          {post.content}
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-bold text-slate-900 hover:text-slate-600"
          >
            ← Back to all articles
          </Link>
        </div>
      </article>
    </main>
  );
}

function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}