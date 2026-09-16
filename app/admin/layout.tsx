import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  const userInfo = {
    id: data.user.id,
    email: profile?.email || data.user.email,
    full_name: profile?.full_name,
    role: profile?.role,
  };

  return <AdminLayoutClient user={userInfo}>{children}</AdminLayoutClient>;
}
