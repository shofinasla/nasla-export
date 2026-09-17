import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Check authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Check admin role
  // IMPORTANT:
  // profiles table does NOT contain an email column.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  // If profile cannot be read, do not grant admin access.
  if (profileError || !profile || profile.role !== "admin") {
    redirect("/account");
  }

  // 3. Build admin user information
  const userInfo = {
    id: user.id,
    email: user.email ?? "",
    full_name: profile.full_name ?? null,
    role: profile.role,
  };

  return (
    <AdminLayoutClient user={userInfo}>
      {children}
    </AdminLayoutClient>
  );
}