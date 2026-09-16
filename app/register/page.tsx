import { redirect } from "next/navigation";
import Link from "next/link";
import { register } from "./actions";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
          NASLA EXPORT
        </p>
        <h1 className="mt-2 text-3xl font-black">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Buat akun customer untuk mengelola pesanan dan template yang dibeli.
        </p>

        <form action={register} className="mt-8 space-y-4">
          <label className="block text-sm font-bold">
            Nama lengkap
            <input name="full_name" required className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="block text-sm font-bold">
            Email
            <input name="email" type="email" required className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="block text-sm font-bold">
            Password
            <input name="password" type="password" minLength={8} required className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="block text-sm font-bold">
            Konfirmasi password
            <input name="password_confirmation" type="password" minLength={8} required className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <button className="btn btn-primary w-full" type="submit">
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
