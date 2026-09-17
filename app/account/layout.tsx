import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { logout } from "@/app/logout/actions";

export default async function AccountLayout({
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
    .select("full_name,role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "admin") {
    // Admin may use the customer account area, but the admin area remains separate.
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border bg-white p-4">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            My Account
          </p>
          <nav className="mt-2 grid gap-1">
            <Link
              href="/account"
              id="account-nav-dashboard"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/account/orders"
              id="account-nav-orders"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              Orders
            </Link>
            <Link
              href="/account/profile"
              id="account-nav-profile"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              Profile
            </Link>
          </nav>

          <div className="mt-6 border-t pt-4">
            <form action={logout}>
              <button className="w-full rounded-xl border px-3 py-2 text-left text-sm font-bold hover:bg-slate-50" type="submit">
                Logout
              </button>
            </form>
          </div>
        </aside>

        <section>
          {children}
        </section>
      </div>
    </main>
  );
}
