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
  return supabase;
}

export async function createDomainTld(formData: FormData) {
  const supabase = await checkAdmin();
  let tld = String(formData.get("tld") || "").trim().toLowerCase();
  if (!tld.startsWith(".")) tld = "." + tld;

  const price_registration = Number(formData.get("price_registration") || 0);
  const price_renewal = Number(formData.get("price_renewal") || price_registration);
  const price_transfer = Number(formData.get("price_transfer") || price_registration);
  const sort_order = Number(formData.get("sort_order") || 0);
  const is_active = formData.get("is_active") === "on";

  if (!tld) throw new Error("TLD extension is required (e.g. .com, .id)");

  const { error } = await supabase.from("domain_tlds").insert({
    tld,
    price_registration,
    price_renewal,
    price_transfer,
    currency: "IDR",
    sort_order,
    is_active,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/domains");
  revalidatePath("/domains");
}

export async function updateDomainTld(formData: FormData) {
  const supabase = await checkAdmin();
  const id = String(formData.get("id") || "");
  let tld = String(formData.get("tld") || "").trim().toLowerCase();
  if (!tld.startsWith(".")) tld = "." + tld;

  const price_registration = Number(formData.get("price_registration") || 0);
  const price_renewal = Number(formData.get("price_renewal") || price_registration);
  const price_transfer = Number(formData.get("price_transfer") || price_registration);
  const sort_order = Number(formData.get("sort_order") || 0);
  const is_active = formData.get("is_active") === "on";

  if (!id) throw new Error("TLD ID is required");

  const { error } = await supabase
    .from("domain_tlds")
    .update({
      tld,
      price_registration,
      price_renewal,
      price_transfer,
      sort_order,
      is_active,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/domains");
  revalidatePath("/domains");
}

export async function deleteDomainTld(formData: FormData) {
  const supabase = await checkAdmin();
  const id = String(formData.get("id") || "");

  if (!id) throw new Error("TLD ID is required");

  const { error } = await supabase.from("domain_tlds").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/domains");
  revalidatePath("/domains");
}
