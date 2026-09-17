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

export async function updateCustomerRole(formData: FormData) {
  const supabase = await checkAdmin();
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "customer");

  if (!id) throw new Error("Customer ID required");

  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/customers");
  revalidatePath("/admin");
}

export async function updateCustomerProfile(formData: FormData) {
  const supabase = await checkAdmin();
  const id = String(formData.get("id") || "");
  const full_name = String(formData.get("full_name") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const role = String(formData.get("role") || "customer");

  if (!id) throw new Error("Customer ID required");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: full_name || null,
      company: company || null,
      phone: phone || null,
      country: country || null,
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/customers");
  revalidatePath("/admin");
}
