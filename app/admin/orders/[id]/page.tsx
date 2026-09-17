import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { formatIDR, getOrderStatusConfig } from "@/lib/orders";
import { getPaymentsForOrder } from "@/lib/payments/service";
import { PAYMENT_STATUS_CONFIG, PaymentStatus } from "@/lib/payments/types";
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Building,
  Phone,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Package,
  Layers,
  ShieldCheck,
  QrCode,
  Building2,
  Wallet,
  Send,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Authenticate user & verify admin authorization
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile, error: profileCheckError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileCheckError || !currentProfile || currentProfile.role !== "admin") {
    redirect("/account");
  }

  // 2. Fetch order with line items and customer profile
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
      payment_method,
      payment_provider,
      payment_reference,
      notes,
      created_at,
      updated_at,
      customer:profiles (
        id,
        full_name,
        company,
        phone,
        country
      ),
      items:order_items (
        id,
        item_type,
        name,
        slug,
        unit_price,
        total_price,
        quantity,
        metadata
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  // 3. Fetch customer email from Auth Admin
  let customerEmail = "";
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminClient = createAdminClient();
      const { data: authUser } = await adminClient.auth.admin.getUserById(
        order.customer_id
      );
      if (authUser?.user?.email) {
        customerEmail = authUser.user.email;
      }
    } catch (authErr) {
      console.warn("Error fetching customer email for admin detail:", authErr);
    }
  }

  // 4. Fetch Payment Records for this order
  const payments = await getPaymentsForOrder(order.id);

  const custProfile = Array.isArray(order.customer)
    ? order.customer[0]
    : order.customer;
  const items = (order.items as any[]) || [];
  const statusConfig = getOrderStatusConfig(order.status);

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case "qris":
        return <QrCode className="h-4 w-4" />;
      case "virtual_account":
        return <Building2 className="h-4 w-4" />;
      case "ewallet":
        return <Wallet className="h-4 w-4" />;
      case "bank_transfer":
        return <Send className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Daftar Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">
            ID: {order.id}
          </span>
          <AdminStatusBadge status={order.status} />
        </div>
      </div>

      <AdminPageHeader
        tag="TRANSACTION & PAYMENT DETAILS"
        title={`Order ${order.order_number}`}
        description={`Detail lengkap pesanan, riwayat pembayaran gateway, dan status pemenuhan layanan.`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column: Order Items, Pricing Details & Payments History */}
        <div className="space-y-6">
          {/* Items Table Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Package className="h-4 w-4 text-indigo-600" />
              Item Pesanan ({items.length})
            </h2>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Produk / Layanan</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3 text-right">Harga Satuan</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        {item.slug && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            slug: {item.slug}
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

            {/* Financial Summary */}
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
              <div className="w-full space-y-2.5 text-xs sm:max-w-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    {formatIDR(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Diskon Promo</span>
                  <span className="font-bold text-emerald-600">
                    {order.discount > 0 ? `-${formatIDR(order.discount)}` : "Rp 0"}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      Total Tagihan
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {formatIDR(order.total)}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 text-right">
                    Mata uang penyelesaian: {order.currency || "IDR"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Attempts History Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Riwayat Pembayaran & Transaksi ({payments.length})
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Multi-Provider Ready
              </span>
            </div>

            <div className="mt-4">
              {payments.length > 0 ? (
                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
                  {payments.map((p) => {
                    const pStatus =
                      PAYMENT_STATUS_CONFIG[p.status as PaymentStatus] ||
                      PAYMENT_STATUS_CONFIG.pending;
                    return (
                      <div
                        key={p.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700">
                            {getMethodIcon(p.payment_method)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 capitalize">
                                {p.payment_method?.replace("_", " ")}
                              </span>
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">
                                {p.provider}
                              </span>
                              {p.payment_channel && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  ({p.payment_channel})
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Ref:{" "}
                              <span className="font-mono text-slate-600">
                                {p.provider_payment_id || p.provider_reference || "-"}
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Dibuat: {new Date(p.created_at).toLocaleString("id-ID")}
                              {p.paid_at && ` • Lunas: ${new Date(p.paid_at).toLocaleString("id-ID")}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:text-right">
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {formatIDR(p.amount)}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                                pStatus.variant === "success"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : pStatus.variant === "danger"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  pStatus.variant === "success"
                                    ? "bg-emerald-500"
                                    : pStatus.variant === "danger"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              {pStatus.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  Belum ada catatan transaksi pembayaran terinisiasi untuk pesanan ini.
                </div>
              )}
            </div>
          </div>

          {/* Customer Profile Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <User className="h-4 w-4 text-indigo-600" />
              Informasi Pelanggan
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50/70 p-4 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nama Lengkap
                </span>
                <p className="mt-1 font-bold text-slate-900">
                  {custProfile?.full_name || "Pelanggan Nasla"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-4 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Akun
                </span>
                <p className="mt-1 truncate font-bold text-slate-900">
                  {customerEmail || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-4 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Perusahaan / Instansi
                </span>
                <p className="mt-1 font-bold text-slate-900">
                  {custProfile?.company || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50/70 p-4 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nomor Telepon / WA
                </span>
                <p className="mt-1 font-bold text-slate-900">
                  {custProfile?.phone || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Management Form */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900">
              Kelola Status Pesanan
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Perbarui status operasional dan catatan administrasi untuk pesanan ini.
            </p>

            <form action={updateOrderStatus} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={order.id} />

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Status Operasional (Fulfillment)
                </label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                >
                  <option value="pending">Pending (Menunggu Konfirmasi)</option>
                  <option value="awaiting_payment">Awaiting Payment (Menunggu Pembayaran)</option>
                  <option value="paid">Paid (Pembayaran Terverifikasi)</option>
                  <option value="processing">Processing (Sedang Disiapkan)</option>
                  <option value="completed">Completed (Selesai / Terpenuhi)</option>
                  <option value="cancelled">Cancelled (Dibatalkan)</option>
                  <option value="refunded">Refunded (Dana Dikembalikan)</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Status saat ini: <strong>{statusConfig.label}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Catatan Admin / Internal
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={order.notes || ""}
                  placeholder="Instruksi pengerjaan, catatan kustomisasi, atau informasi verifikasi..."
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary mt-2 w-full py-2.5 text-xs font-bold"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </form>
          </div>

          {/* Timestamps & Meta */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs text-xs">
            <h3 className="font-bold text-slate-900">Metadata Transaksi</h3>
            <div className="mt-3 space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Dibuat:</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Terakhir Update:</span>
                <span className="font-medium">
                  {new Date(order.updated_at).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Provider:</span>
                <span className="font-medium capitalize">
                  {order.payment_provider || "Multi-Provider"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Bayar:</span>
                <span className="font-medium capitalize">
                  {order.payment_method?.replace("_", " ") || "Pilih Saat Bayar"}
                </span>
              </div>
              {order.payment_reference && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Ref:</span>
                  <span className="font-mono">{order.payment_reference}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
