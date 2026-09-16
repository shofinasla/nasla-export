import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!full_name) {
    redirect("/account/profile?error=Nama%20lengkap%20wajib%20diisi");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone, company, country })
    .eq("id", data.user.id);

  if (error) {
    redirect(`/account/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/account/profile?message=Profile%20berhasil%20disimpan");
}
