import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,phone,company,country,role")
    .eq("id", authData.user.id)
    .single();

  const { count: orderCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", authData.user.id);

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
        Customer Dashboard
      </p>
      <h1 className="mt-2 text-3xl font-black">
        Halo, {profile?.full_name || authData.user.email}
      </h1>
      <p className="mt-2 text-slate-500">
        Kelola profil dan aktivitas akun NASLA EXPORT kamu.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Email</p>
          <p className="mt-2 font-bold">{profile?.email || authData.user.email}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Orders</p>
          <p className="mt-2 text-2xl font-black">{orderCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Account</p>
          <p className="mt-2 font-bold capitalize">{profile?.role || "customer"}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-black">Profile</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Nama</p>
            <p className="mt-1 font-semibold">{profile?.full_name || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Perusahaan</p>
            <p className="mt-1 font-semibold">{profile?.company || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Telepon</p>
            <p className="mt-1 font-semibold">{profile?.phone || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Negara</p>
            <p className="mt-1 font-semibold">{profile?.country || "-"}</p>
          </div>
        </div>

        <Link href="/account/profile" className="btn btn-secondary mt-6 inline-flex">
          Edit Profile
        </Link>
      </div>
    </>
  );
}
