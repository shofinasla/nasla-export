"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/account");
  return { supabase, user };
}

function slugify(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createBlogPost(formData: FormData) {
  const { supabase, user } = await checkAdmin();
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const slug = slugify(rawSlug || title);
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const featured_image = String(formData.get("featured_image") || "").trim();
  const category = String(formData.get("category") || "General").trim();
  const is_published = formData.get("is_published") === "on";

  if (!title || !slug) {
    throw new Error("Article title and slug are required.");
  }

  const { error } = await supabase.from("blog_posts").insert({
    title,
    slug,
    excerpt,
    content,
    featured_image,
    category,
    author_id: user.id,
    is_published,
    published_at: is_published ? new Date().toISOString() : null,
  });

  if (error) {
    throw new Error(error.code === "23505" ? "Slug already exists." : error.message);
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function updateBlogPost(formData: FormData) {
  const { supabase } = await checkAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const slug = slugify(rawSlug || title);
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const featured_image = String(formData.get("featured_image") || "").trim();
  const category = String(formData.get("category") || "General").trim();
  const is_published = formData.get("is_published") === "on";

  if (!id) throw new Error("Blog post ID is required.");
  if (!title || !slug) throw new Error("Title and slug are required.");

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug,
      excerpt,
      content,
      featured_image,
      category,
      is_published,
      published_at: is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.code === "23505" ? "Slug already exists." : error.message);
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deleteBlogPost(formData: FormData) {
  const { supabase } = await checkAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Blog post ID required.");

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
