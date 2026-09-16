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

export async function updateInquiryStatus(formData: FormData) {
  const supabase = await checkAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new");
  const admin_notes = String(formData.get("admin_notes") || "");

  if (!id) throw new Error("Inquiry ID required");

  const { error } = await supabase
    .from("inquiries")
    .update({ status, admin_notes })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function deleteInquiry(formData: FormData) {
  const supabase = await checkAdmin();
  const id = String(formData.get("id") || "");

  if (!id) throw new Error("Inquiry ID required");

  const { error } = await supabase
    .from("inquiries")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}
