import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatIDR, getOrderStatusConfig } from "@/lib/orders";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  User,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // 1. Fetch user profile safely
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,phone,company,country,role")
    .eq("id", authData.user.id)
    .single();

  // 2. Fetch total count of user's orders
  const { count: orderCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", authData.user.id);

  // 3. Fetch recent 3 orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      total,
      created_at,
      order_items (
        name,
        quantity
      )
    `
    )
    .eq("customer_id", authData.user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const orders = recentOrders || [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Customer Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
          Halo, {profile?.full_name || authData.user.email}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola pesanan template, domain ekspor, dan informasi akun Anda di Nasla Export.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Email Terdaftar
          </p>
          <p className="mt-2 truncate font-bold text-slate-900">
            {authData.user.email}
          </p>
          <p className="mt-1 text-xs text-slate-400">Akun terverifikasi</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Pesanan
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {orderCount ?? 0}
          </p>
          <Link
            href="/account/orders"
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Lihat semua pesanan</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tipe Akun
          </p>
          <p className="mt-2 font-bold capitalize text-slate-900">
            {profile?.role || "Customer"}
          </p>
          <p className="mt-1 text-xs text-slate-400">Member Nasla Export</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Pesanan Terbaru
            </h2>
            <p className="text-xs text-slate-500">
              Aktivitas transaksi terakhir pada akun Anda
            </p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Lihat Semua ({orderCount ?? 0}) →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-semibold text-slate-600">
              Belum ada pesanan yang dibuat.
            </p>
            <Link
              href="/templates"
              className="mt-3 inline-flex text-xs font-bold text-indigo-600 hover:underline"
            >
              Lihat Katalog Template →
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {orders.map((order) => {
              const statusConfig = getOrderStatusConfig(order.status);
              const items = (order.order_items as any[]) || [];
              const mainName = items[0]?.name || "Pesanan Template";

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="font-mono text-xs font-bold text-slate-900 hover:text-indigo-600"
                    >
                      {order.order_number}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-600 font-medium">{mainName}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-900">
                      {formatIDR(order.total)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
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
                      {statusConfig.label}
                    </span>
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Details Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-black text-slate-900">
            Profil Pelanggan
          </h2>
          <Link
            href="/account/profile"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Edit Profil ↗
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Nama Lengkap
            </p>
            <p className="mt-1 text-xs font-bold text-slate-800">
              {profile?.full_name || "-"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Perusahaan
            </p>
            <p className="mt-1 text-xs font-bold text-slate-800">
              {profile?.company || "-"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              No. Telepon / WA
            </p>
            <p className="mt-1 text-xs font-bold text-slate-800">
              {profile?.phone || "-"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Negara
            </p>
            <p className="mt-1 text-xs font-bold text-slate-800">
              {profile?.country || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
