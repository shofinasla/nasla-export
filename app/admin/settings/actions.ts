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

export async function saveSiteSettings(formData: FormData) {
  const supabase = await checkAdmin();
  const key = String(formData.get("key") || "general").trim();
  const formJson: Record<string, any> = {};

  formData.forEach((value, k) => {
    if (k !== "key") {
      formJson[k] = value;
    }
  });

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        key,
        value: formJson,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
