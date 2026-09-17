"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  User,
  Calendar,
  CreditCard,
  FileText,
  X,
  Edit2,
  Package,
  ExternalLink,
} from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { formatIDR, getOrderStatusConfig } from "@/lib/orders";

export interface AdminOrderItem {
  id: string;
  order_number: string;
  customer_id?: string;
  customer?: {
    full_name?: string | null;
    email?: string | null;
    company?: string | null;
    phone?: string | null;
    country?: string | null;
  } | null;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  items?: {
    id: string;
    item_type: string;
    name: string;
    slug?: string | null;
    unit_price: number;
    total_price: number;
    quantity: number;
  }[];
}

interface OrderTableClientProps {
  initialOrders: AdminOrderItem[];
}

export function OrderTableClient({ initialOrders }: OrderTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Order Detail / Quick Status Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderItem | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = initialOrders.length;
    const pending = initialOrders.filter((o) => o.status === "pending" || o.status === "awaiting_payment").length;
    const processing = initialOrders.filter((o) => o.status === "processing").length;
    const completed = initialOrders.filter(
      (o) => o.status === "paid" || o.status === "completed"
    ).length;
    const grossVolume = initialOrders
      .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return { total, pending, processing, completed, grossVolume };
  }, [initialOrders]);

  const filteredOrders = useMemo(() => {
    return initialOrders
      .filter((o) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          o.order_number?.toLowerCase().includes(q) ||
          o.id?.toLowerCase().includes(q) ||
          (o.customer?.full_name &&
            o.customer.full_name.toLowerCase().includes(q)) ||
          (o.customer?.email && o.customer.email.toLowerCase().includes(q)) ||
          (o.payment_reference &&
            o.payment_reference.toLowerCase().includes(q));

        const matchesStatus =
          selectedStatus === "all" || o.status === selectedStatus;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        if (sortBy === "date-asc") {
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
        if (sortBy === "total-desc") {
          return Number(b.total || 0) - Number(a.total || 0);
        }
        if (sortBy === "total-asc") {
          return Number(a.total || 0) - Number(b.total || 0);
        }
        return 0;
      });
  }, [initialOrders, searchQuery, selectedStatus, sortBy]);

  const handleStatusSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateOrderStatus(formData);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Orders
          </span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {metrics.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">Semua pesanan terdaftar</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pending / Awaiting
          </span>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {metrics.pending}
          </p>
          <p className="mt-1 text-xs text-slate-500">Menunggu tindakan</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Processing / Active
          </span>
          <p className="mt-2 text-2xl font-black text-blue-600">
            {metrics.processing}
          </p>
          <p className="mt-1 text-xs text-slate-500">Sedang disiapkan</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Volume Transaksi
          </span>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {formatIDR(metrics.grossVolume)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {metrics.completed} pesanan sukses
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari order #, nama customer, email, payment ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-hidden"
          >
            <option value="date-desc">Terbaru</option>
            <option value="date-asc">Terlama</option>
            <option value="total-desc">Nominal Tertinggi</option>
            <option value="total-asc">Nominal Terendah</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <AdminEmptyState
          icon={<ShoppingCart className="h-6 w-6 stroke-[1.75]" />}
          title="Tidak Ada Pesanan"
          description={
            searchQuery || selectedStatus !== "all"
              ? "Tidak ada pesanan yang sesuai dengan filter pencarian Anda."
              : "Belum ada pesanan yang masuk dalam sistem."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Nomor Pesanan</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Item Produk</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => {
                  const items = order.items || [];
                  const mainItem = items[0]?.name || "Template Order";
                  const extraItems = items.length - 1;

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-slate-900 hover:text-indigo-600"
                        >
                          {order.order_number}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[200px]">
                          <p className="truncate font-bold text-slate-900">
                            {order.customer?.full_name || "Pelanggan Nasla"}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {order.customer?.email || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[220px]">
                          <p className="truncate font-semibold text-slate-800">
                            {mainItem}
                          </p>
                          {extraItems > 0 && (
                            <p className="text-[10px] text-slate-400">
                              +{extraItems} item lain
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900">
                        {formatIDR(order.total)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <AdminStatusBadge status={order.status} />
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            title="Buka Halaman Detail"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Detail</span>
                          </Link>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            title="Quick Status Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Status</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Update Status Pesanan
                </span>
                <h3 className="font-mono text-base font-black text-slate-900">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={selectedOrder.id} />

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Customer
                </label>
                <p className="mt-1 text-xs text-slate-600">
                  {selectedOrder.customer?.full_name || "Pelanggan"} (
                  {selectedOrder.customer?.email || "-"})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Status Operasional
                </label>
                <select
                  name="status"
                  defaultValue={selectedOrder.status}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                >
                  <option value="pending">Pending</option>
                  <option value="awaiting_payment">Awaiting Payment</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Pilih status yang sesuai dengan alur proses pesanan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Catatan Admin (Opsional)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={selectedOrder.notes || ""}
                  placeholder="Tambahkan catatan internal atau instruksi..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
                <Link
                  href={`/admin/orders/${selectedOrder.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Buka Halaman Lengkap</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn btn-primary px-4 py-2 text-xs font-bold disabled:opacity-50"
                  >
                    {isUpdating ? "Menyimpan..." : "Simpan Status"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
