import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
          NASLA EXPORT
        </p>
        <h1 className="mt-2 text-3xl font-black">Login</h1>

        {params.error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {params.error}
          </div>
        ) : null}

        {params.message ? (
          <div className="mt-5 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
            {params.message}
          </div>
        ) : null}

        <form action={login} className="mt-8 space-y-4">
          <label className="block text-sm font-bold">
            Email
            <input name="email" type="email" required className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="block text-sm font-bold">
            Password
            <input name="password" type="password" required className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <button className="btn btn-primary w-full" type="submit">
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
