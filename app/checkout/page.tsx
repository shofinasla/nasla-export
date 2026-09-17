import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/orders";
import { createTemplateOrder } from "./actions";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import {
  ShieldCheck,
  LayoutTemplate,
  ArrowRight,
  User,
  Mail,
  Building,
  Phone,
  AlertCircle,
  CreditCard,
  Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: Promise<{
    template?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { template: templateSlug } = await searchParams;
  const supabase = await createClient();

  // 1. Check user authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = templateSlug
      ? `/checkout?template=${encodeURIComponent(templateSlug)}`
      : "/templates";
    redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  // 2. Fetch customer profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company, phone, country")
    .eq("id", user.id)
    .single();

  // 3. If template specified, fetch template details
  let template = null;
  if (templateSlug) {
    const { data: tplData } = await supabase
      .from("templates")
      .select("*")
      .eq("slug", templateSlug)
      .eq("is_published", true)
      .single();
    template = tplData;
  }

  if (!template) {
    return (
      <main className="container py-12 md:py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">
            Template Tidak Ditemukan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Silakan pilih template yang ingin Anda pesan melalui katalog marketplace template kami.
          </p>
          <div className="mt-6">
            <Link href="/templates" className="btn btn-primary inline-flex">
              Lihat Katalog Template
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = Number(template.price) || 0;
  const discount = 0;
  const total = subtotal - discount;

  return (
    <main className="container py-10 md:py-14">
      {/* Breadcrumb / Top step indicator */}
      <div className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <Link href="/templates" className="hover:text-slate-900">
          Templates
        </Link>
        <span>/</span>
        <Link href={`/templates/${template.slug}`} className="hover:text-slate-900">
          {template.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900">Review & Checkout</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column: Order Items, Customer Info & Payment Method Selection */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Multi-Provider Payment Core
            </span>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Pembayaran & Checkout
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pilih metode pembayaran yang Anda inginkan dan periksa detail pesanan Anda.
            </p>
          </div>

          {/* Item Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <LayoutTemplate className="h-4 w-4 text-indigo-600" />
                Item yang Dipesan
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                1 Item
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {template.preview_image ? (
                  <img
                    src={template.preview_image}
                    alt={template.name}
                    className="h-16 w-20 rounded-xl border border-slate-100 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold text-slate-400">
                    NASLA TPL
                  </div>
                )}
                <div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    {template.category || "Website Template"}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-slate-900">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Koleksi: {template.slug} • Lisensi Komersial Standar
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">Harga Satuan</p>
                <p className="text-base font-black text-slate-900">
                  {formatIDR(template.price)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Account Information */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <User className="h-4 w-4 text-indigo-600" />
                Informasi Pemesan
              </h2>
              <Link
                href="/account/profile"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Edit Profil ↗
              </Link>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50/80 p-3.5">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Nama Lengkap
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-800">
                  {profile?.full_name || user.user_metadata?.full_name || "Pelanggan Nasla"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-3.5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Alamat Email
                  </span>
                </div>
                <p className="mt-1 truncate text-xs font-bold text-slate-800">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-3.5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Building className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Perusahaan
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-800">
                  {profile?.company || "Individu / Belum Diisi"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/80 p-3.5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    No. WhatsApp / Telepon
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-800">
                  {profile?.phone || "Belum Diisi"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Method Selection & Checkout Form */}
        <div className="space-y-6">
          <form
            action={createTemplateOrder}
            className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm"
          >
            <input type="hidden" name="template_slug" value={template.slug} />

            <h2 className="text-base font-black text-slate-900">
              Ringkasan Pembayaran
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Template</span>
                <span className="font-semibold text-slate-900">
                  {formatIDR(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Diskon Promo</span>
                <span className="font-semibold text-emerald-600">
                  {discount > 0 ? `-${formatIDR(discount)}` : "Rp 0"}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900">Total Tagihan</span>
                  <span className="text-2xl font-black text-slate-900">
                    {formatIDR(total)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Mata uang penyelesaian: IDR (Rupiah Indonesia)
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <label className="mb-2.5 flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                  Pilih Metode Pembayaran
                </span>
                <span className="text-[10px] text-slate-400">Otomatis / Real-Time</span>
              </label>

              <PaymentMethodSelector defaultMethod="qris" />
            </div>

            {/* Order Notes Field */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <label
                htmlFor="order-notes"
                className="block text-xs font-bold text-slate-700"
              >
                Catatan Pesanan (Opsional)
              </label>
              <textarea
                id="order-notes"
                name="notes"
                rows={2}
                placeholder="Tuliskan catatan khusus jika ada..."
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              id="confirm-order-button"
              className="btn btn-primary mt-6 w-full py-3.5 text-sm font-black shadow-md transition-all hover:shadow-lg"
            >
              <span>Bayar Sekarang (Pay Now)</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-slate-400">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>Pembayaran Aman & Terenkripsi • Provider Agnostic</span>
            </div>
          </form>

          {/* Support Guarantee Card */}
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900">Butuh Bantuan Transaksi?</h4>
            <p className="mt-1 text-slate-500">
              Tim finance Nasla Export siap membantu proses faktur perusahaan, PPh/PPN, maupun pembayaran lintas negara.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex font-bold text-slate-900 hover:underline"
            >
              Hubungi Tim Support →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
