import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatIDR, getOrderStatusConfig } from "@/lib/orders";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/orders");
  }

  // 2. Fetch user's orders with items
  const { data: orders, error } = await supabase
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
      created_at,
      order_items (
        id,
        item_type,
        name,
        quantity,
        unit_price,
        total_price
      )
    `
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer orders:", error);
  }

  const orderList = orders || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Transaksi & Pembelian
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Riwayat Pesanan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar pesanan template, domain, dan layanan digital Anda di Nasla Export.
          </p>
        </div>

        <Link
          href="/templates"
          className="btn btn-secondary inline-flex items-center gap-1.5 self-start text-xs font-bold"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-slate-600" />
          <span>Katalog Template</span>
        </Link>
      </div>

      {orderList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Package className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            Belum Ada Pesanan
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            Anda belum memiliki riwayat transaksi. Pilih template website ekspor siap pakai untuk memulai.
          </p>
          <div className="mt-6">
            <Link href="/templates" className="btn btn-primary inline-flex text-xs font-bold">
              Jelajahi Template
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Nomor Pesanan</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Item</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orderList.map((order) => {
                  const statusConfig = getOrderStatusConfig(order.status);
                  const items = (order.order_items as any[]) || [];
                  const mainItemName =
                    items.length > 0 ? items[0].name : "Pesanan Layanan";
                  const extraItemsCount = items.length - 1;

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/account/orders/${order.order_number}`}
                          className="font-mono font-bold text-slate-900 hover:text-indigo-600"
                        >
                          {order.order_number}
                        </Link>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[240px]">
                          <p className="truncate font-semibold text-slate-800">
                            {mainItemName}
                          </p>
                          {extraItemsCount > 0 && (
                            <p className="text-[10px] text-slate-400">
                              +{extraItemsCount} item lainnya
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900">
                        {formatIDR(order.total)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
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
                            className={`h-1.5 w-1.5 rounded-full ${
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
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/account/orders/${order.order_number}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <span>Detail</span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
