"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function adminClient(){
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user) redirect("/login");
  const {data:p}=await s.from("profiles").select("role").eq("id",user.id).single();
  if(p?.role!=="admin") redirect("/account");
  return s;
}
function slugify(v:string){return v.trim().toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")}
function payload(f:FormData){
  const name=String(f.get("name")||"").trim(), slug=slugify(String(f.get("slug")||name));
  const category=String(f.get("category")||"").trim();
  const price=Number(String(f.get("price")||"0").replace(/[^\d.]/g,"")||0);
  if(!name||!slug||!category) throw new Error("Name, slug, dan category wajib diisi.");
  if(!Number.isFinite(price)||price<0) throw new Error("Harga tidak valid.");
  return {name,slug,category,price,
    description:String(f.get("description")||"").trim(),
    demo_url:String(f.get("demo_url")||"").trim(),
    preview_image:String(f.get("preview_image")||"").trim(),
    storage_path:String(f.get("storage_path")||"").trim(),
    is_published:f.get("is_published")==="on"};
}
export async function createTemplate(f:FormData){
  const s=await adminClient(), p=payload(f);
  const {error}=await s.from("templates").insert(p);
  if(error) throw new Error(error.code==="23505"?"Slug sudah digunakan.":error.message);
  revalidatePath("/admin/templates"); revalidatePath("/templates"); redirect("/admin/templates");
}
export async function updateTemplate(f:FormData){
  const s=await adminClient(), id=String(f.get("id")||"");
  if(!id) throw new Error("Template ID tidak ditemukan.");
  const p=payload(f); const {error}=await s.from("templates").update(p).eq("id",id);
  if(error) throw new Error(error.code==="23505"?"Slug sudah digunakan.":error.message);
  revalidatePath("/admin/templates"); revalidatePath("/templates"); revalidatePath("/templates/"+p.slug);
  redirect("/admin/templates");
}
export async function deleteTemplate(f:FormData){
  const s=await adminClient(), id=String(f.get("id")||"");
  if(!id) throw new Error("Template ID tidak ditemukan.");
  const {error}=await s.from("templates").delete().eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/templates"); revalidatePath("/templates");
}
