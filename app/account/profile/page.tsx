import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,phone,company,country")
    .eq("id", data.user.id)
    .single();

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
        My Profile
      </p>
      <h1 className="mt-2 text-3xl font-black">Profile</h1>

      {params.error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{params.error}</div>
      ) : null}
      {params.message ? (
        <div className="mt-5 rounded-xl border bg-slate-50 p-4 text-sm">{params.message}</div>
      ) : null}

      <form action={updateProfile} className="mt-8 rounded-3xl border bg-white p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-bold">
            Nama lengkap
            <input name="full_name" defaultValue={profile?.full_name ?? ""} required className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="text-sm font-bold">
            Email
            <input value={profile?.email ?? data.user.email ?? ""} disabled className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-500" />
          </label>

          <label className="text-sm font-bold">
            Nomor telepon
            <input name="phone" defaultValue={profile?.phone ?? ""} className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="text-sm font-bold">
            Perusahaan
            <input name="company" defaultValue={profile?.company ?? ""} className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="text-sm font-bold">
            Negara
            <input name="country" defaultValue={profile?.country ?? ""} className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>
        </div>

        <button type="submit" className="btn btn-primary mt-6">
          Simpan Profile
        </button>
      </form>
    </>
  );
}
