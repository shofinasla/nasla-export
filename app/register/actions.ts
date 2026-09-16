import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  "use server";

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (!fullName || !email || password.length < 8) {
    redirect("/register?error=Data%20pendaftaran%20belum%20lengkap");
  }

  if (password !== confirmation) {
    redirect("/register?error=Konfirmasi%20password%20tidak%20sama");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error || !data.user) {
    redirect(`/register?error=${encodeURIComponent(error?.message ?? "Registrasi gagal")}`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: fullName,
      email,
      role: "customer",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    redirect(`/register?error=${encodeURIComponent(profileError.message)}`);
  }

  if (!data.session) {
    redirect("/login?message=Silakan%20cek%20email%20untuk%20verifikasi%20akun");
  }

  redirect("/account");
}
