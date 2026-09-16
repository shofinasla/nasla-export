"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function adminClient() {
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await s
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (p?.role !== "admin") redirect("/account");
  return s;
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

function parseLines(text: unknown): string[] {
  if (typeof text !== "string") return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function payload(f: FormData) {
  const name = String(f.get("name") || "").trim();
  const rawSlug = String(f.get("slug") || "").trim();
  const slug = slugify(rawSlug || name);
  const category = String(f.get("category") || "").trim();
  const price = Number(String(f.get("price") || "0").replace(/[^\d.]/g, "") || 0);

  if (!name || !slug || !category) {
    throw new Error("Name, slug, and category are required.");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Price is invalid.");
  }

  const screenshots = parseLines(f.get("screenshots"));
  const features = parseLines(f.get("features"));
  const tech_stack = parseLines(f.get("tech_stack"));
  const sort_order = Number(f.get("sort_order") || 0);

  return {
    name,
    slug,
    category,
    price,
    description: String(f.get("description") || "").trim(),
    demo_url: String(f.get("demo_url") || "").trim(),
    preview_image: String(f.get("preview_image") || "").trim(),
    storage_path: String(f.get("storage_path") || "").trim(),
    screenshots,
    features,
    tech_stack,
    is_featured: f.get("is_featured") === "on",
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    is_published: f.get("is_published") === "on",
    updated_at: new Date().toISOString(),
  };
}

export async function createTemplate(f: FormData) {
  const s = await adminClient();
  const p = payload(f);
  const { error } = await s.from("templates").insert(p);
  if (error) {
    throw new Error(error.code === "23505" ? "Slug is already in use." : error.message);
  }
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
  redirect("/admin/templates");
}

export async function updateTemplate(f: FormData) {
  const s = await adminClient();
  const id = String(f.get("id") || "");
  if (!id) throw new Error("Template ID not found.");
  const p = payload(f);
  const { error } = await s.from("templates").update(p).eq("id", id);
  if (error) {
    throw new Error(error.code === "23505" ? "Slug is already in use." : error.message);
  }
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
  revalidatePath("/templates/" + p.slug);
  redirect("/admin/templates");
}

export async function deleteTemplate(f: FormData) {
  const s = await adminClient();
  const id = String(f.get("id") || "");
  if (!id) throw new Error("Template ID not found.");
  const { error } = await s.from("templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
}

export async function toggleTemplateStatus(id: string, currentStatus: boolean) {
  const s = await adminClient();
  if (!id) throw new Error("Template ID not found.");
  const { error } = await s
    .from("templates")
    .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
}
