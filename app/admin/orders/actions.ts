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

export async function updateOrderStatus(formData: FormData) {
  const supabase = await checkAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending");
  const notes = String(formData.get("notes") || "");

  if (!id) throw new Error("Order ID required");

  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (notes) {
    updateData.notes = notes;
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  revalidatePath("/account/orders");
  revalidatePath("/account");
}
