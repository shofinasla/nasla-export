import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { formatIDR, getOrderStatusConfig } from "@/lib/orders";
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

  const custProfile = Array.isArray(order.customer)
    ? order.customer[0]
    : order.customer;
  const items = (order.items as any[]) || [];
  const statusConfig = getOrderStatusConfig(order.status);

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
        tag="TRANSACTION DETAILS"
        title={`Order ${order.order_number}`}
        description={`Detail lengkap transaksi dan status pemrosesan untuk pesanan ${order.order_number}.`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column: Order Items & Pricing Details */}
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
                    Mata uang: {order.currency || "IDR"}
                  </p>
                </div>
              </div>
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
                  Status Operasional
                </label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                >
                  <option value="pending">Pending (Menunggu Pembayaran)</option>
                  <option value="awaiting_payment">Awaiting Payment</option>
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
                <span className="text-slate-400">Metode Bayar:</span>
                <span className="font-medium">
                  {order.payment_method || "Pending (Manual / Stage 5 Gateway)"}
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
