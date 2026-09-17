import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatIDR, getOrderStatusConfig } from "@/lib/orders";
import {
  Package,
  Calendar,
  User,
  Mail,
  Building,
  Phone,
  FileText,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CustomerOrderDetailPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
}

export default async function CustomerOrderDetailPage({
  params,
  searchParams,
}: CustomerOrderDetailPageProps) {
  const { orderNumber } = await params;
  const { success } = await searchParams;
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/account/orders/${orderNumber}`)}`);
  }

  // 2. Fetch order with order_items
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      customer_id,
      status,
      subtotal,
      discount,
      total,
      currency,
      notes,
      payment_method,
      payment_reference,
      created_at,
      updated_at,
      order_items (
        id,
        item_type,
        name,
        slug,
        quantity,
        unit_price,
        total_price,
        metadata
      )
    `
    )
    .eq("order_number", orderNumber)
    .single();

  if (error || !order) {
    notFound();
  }

  // 3. Strict security check: Ensure order belongs to the logged-in user
  if (order.customer_id !== user.id) {
    // Check if user is admin (admins can view via /admin/orders/[id], but if checking here):
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      notFound();
    }
  }

  // 4. Fetch customer profile info
  const { data: customerProfile } = await supabase
    .from("profiles")
    .select("full_name, company, phone, country")
    .eq("id", order.customer_id)
    .single();

  const statusConfig = getOrderStatusConfig(order.status);
  const items = (order.order_items as any[]) || [];

  return (
    <div className="space-y-6">
      {/* Top Back Link & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Riwayat Pesanan</span>
        </Link>

        <span className="font-mono text-xs font-semibold text-slate-400">
          ID: {order.id.slice(0, 8)}...
        </span>
      </div>

      {/* Success banner if redirected from checkout */}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-emerald-900">
              Pesanan Berhasil Dibuat!
            </h3>
            <p className="mt-0.5 text-xs text-emerald-700">
              Pesanan Anda dengan nomor <strong>{order.order_number}</strong> telah tersimpan dalam sistem kami.
            </p>
          </div>
        </div>
      )}

      {/* Main Order Header Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Nomor Pesanan
            </span>
            <h1 className="mt-1 font-mono text-2xl font-black text-slate-900 sm:text-3xl">
              {order.order_number}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Dibuat pada:{" "}
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Pesanan
            </span>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                  statusConfig.variant === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : statusConfig.variant === "warning"
                    ? "bg-amber-50 text-amber-700"
                    : statusConfig.variant === "info"
                    ? "bg-blue-50 text-blue-700"
                    : statusConfig.variant === "danger"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    statusConfig.variant === "success"
                      ? "bg-emerald-500"
                      : statusConfig.variant === "warning"
                      ? "bg-amber-500"
                      : statusConfig.variant === "info"
                      ? "bg-blue-500"
                      : statusConfig.variant === "danger"
                      ? "bg-rose-500"
                      : "bg-slate-400"
                  }`}
                />
                {statusConfig.label}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {statusConfig.description}
            </p>
          </div>
        </div>

        {/* Customer Details & Order Items Grid */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Customer Info */}
          <div className="rounded-2xl bg-slate-50/70 p-5">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <User className="h-3.5 w-3.5" />
              Informasi Pemesan
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama:</span>
                <span className="font-semibold text-slate-800">
                  {customerProfile?.full_name || user.user_metadata?.full_name || "Pelanggan Nasla"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Perusahaan:</span>
                <span className="font-semibold text-slate-800">
                  {customerProfile?.company || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telepon / WA:</span>
                <span className="font-semibold text-slate-800">
                  {customerProfile?.phone || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Status Info */}
          <div className="rounded-2xl bg-slate-50/70 p-5">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Informasi Transaksi
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Mata Uang:</span>
                <span className="font-semibold text-slate-800">
                  {order.currency || "IDR"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Pembayaran:</span>
                <span className="font-semibold text-slate-800">
                  {order.payment_method || "Menunggu Integrasi Gateway"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Terakhir Diperbarui:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(order.updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900">Rincian Item</h3>
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3 text-right">Harga Satuan</th>
                  <th className="px-4 py-3 text-center">Jumlah</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any) => (
                  <tr key={item.id} className="font-medium text-slate-700">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.slug && (
                        <p className="text-[10px] text-slate-400">
                          Slug: {item.slug}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        {item.item_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {formatIDR(item.unit_price)}
                    </td>
                    <td className="px-4 py-3.5 text-center">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatIDR(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="mt-6 flex flex-col justify-end border-t border-slate-100 pt-6 sm:flex-row">
          <div className="w-full space-y-2 text-xs sm:max-w-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatIDR(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Diskon</span>
              <span className="font-semibold text-emerald-600">
                {order.discount > 0 ? `-${formatIDR(order.discount)}` : "Rp 0"}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900">Total</span>
                <span className="text-xl font-black text-slate-900">
                  {formatIDR(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes if any */}
        {order.notes && (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs">
            <h4 className="font-bold text-slate-700">Catatan Pesanan:</h4>
            <p className="mt-1 whitespace-pre-wrap text-slate-600">
              {order.notes}
            </p>
          </div>
        )}

        {/* Stage 4 Information Notice */}
        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-900">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <h4 className="font-bold text-blue-900">
                Informasi Pemrosesan Transaksi (Stage 4)
              </h4>
              <p className="mt-1 leading-relaxed text-blue-800">
                Pesanan ini telah tercatat secara resmi di database transaksi Nasla Export. Integrasi kanal pembayaran digital (Payment Gateway / Bank Transfer) akan diaktifkan pada modul Commerce (Stage 5).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
