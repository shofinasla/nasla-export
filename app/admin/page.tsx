import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Users,
  LayoutTemplate,
  ShoppingCart,
  MessageSquare,
  ArrowRight,
  Plus,
  Globe,
  ExternalLink,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role, full_name")
  .eq("id", user.id)
  .single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/account");
  }

  const adminName = profile?.full_name || user.email?.split("@")[0] || "Administrator";

  // Fetch real KPI counts safely from Supabase
  let totalCustomers = 0;
  let totalTemplates = 0;
  let featuredTemplates = 0;
  let publishedTemplates = 0;
  let totalOrders = 0;
  let pendingOrders = 0;
  let totalRevenue = 0;
  let totalInquiries = 0;
  let newInquiries = 0;

  // Recent data collections
  let recentOrders: any[] = [];
  let recentInquiries: any[] = [];
  let recentCustomers: any[] = [];

  try {
    // 1. Customers Count & Recent
    const { count: custCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    totalCustomers = custCount ?? 0;

    const { data: custData } = await supabase
      .from("profiles")
      .select("id, full_name, company, country, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    recentCustomers = custData ?? [];

    // 2. Templates Count
    const { data: templateData } = await supabase
      .from("templates")
      .select("id, is_published, is_featured");
    if (templateData) {
      totalTemplates = templateData.length;
      publishedTemplates = templateData.filter((t) => t.is_published).length;
      featuredTemplates = templateData.filter((t) => t.is_featured).length;
    }

    // 3. Orders Count & Recent
    const { data: orderData } = await supabase
      .from("orders")
      .select("id, order_number, total, status, created_at, customer_id")
      .order("created_at", { ascending: false });

    if (orderData) {
      totalOrders = orderData.length;
      pendingOrders = orderData.filter((o) => o.status === "pending").length;
      totalRevenue = orderData
        .filter((o) => o.status === "paid" || o.status === "completed")
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      recentOrders = orderData.slice(0, 5);
    }

    // 4. Inquiries Count & Recent
    const { data: inqData } = await supabase
      .from("inquiries")
      .select("id, name, email, company_name, country, subject, status, created_at")
      .order("created_at", { ascending: false });

    if (inqData) {
      totalInquiries = inqData.length;
      newInquiries = inqData.filter((i) => i.status === "new").length;
      recentInquiries = inqData.slice(0, 5);
    }
  } catch (err) {
    console.error("Dashboard Supabase queries error:", err);
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <AdminPageHeader
        tag="OVERVIEW"
        title="Dashboard"
        description={`Welcome back, ${adminName}. Here is the business summary for Nasla Export platform.`}
      >
        <Link
          href="/admin/templates/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          <span>Add Template</span>
        </Link>
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50"
        >
          <MessageSquare className="h-4 w-4 text-slate-500" />
          <span>Inquiries</span>
          {newInquiries > 0 && (
            <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] text-white">
              {newInquiries}
            </span>
          )}
        </Link>
      </AdminPageHeader>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Customers"
          value={totalCustomers}
          subtitle="Registered users & buyer accounts"
          icon={<Users className="h-5 w-5" />}
          href="/admin/customers"
        />

        <AdminStatCard
          title="Total Templates"
          value={totalTemplates}
          subtitle={`${publishedTemplates} published · ${featuredTemplates} featured`}
          icon={<LayoutTemplate className="h-5 w-5" />}
          href="/admin/templates"
          badge={
            featuredTemplates > 0
              ? { text: `${featuredTemplates} featured`, trend: "up" }
              : undefined
          }
        />

        <AdminStatCard
          title="Total Orders"
          value={totalOrders}
          subtitle={
            totalRevenue > 0
              ? `Rp ${totalRevenue.toLocaleString("id-ID")} settled`
              : `${pendingOrders} pending orders`
          }
          icon={<ShoppingCart className="h-5 w-5" />}
          href="/admin/orders"
          badge={
            pendingOrders > 0
              ? { text: `${pendingOrders} pending`, trend: "neutral" }
              : undefined
          }
        />

        <AdminStatCard
          title="Inquiries & Leads"
          value={totalInquiries}
          subtitle={`${newInquiries} new buyer inquiries`}
          icon={<MessageSquare className="h-5 w-5" />}
          href="/admin/inquiries"
          badge={
            newInquiries > 0
              ? { text: `${newInquiries} new`, trend: "up" }
              : undefined
          }
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Quick Actions
            </h3>
            <p className="mt-1 text-base font-black text-slate-900">
              Business Operations
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/templates/new"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                  New Template
                </p>
                <p className="text-[11px] text-slate-500">Publish to catalog</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
          </Link>

          <Link
            href="/admin/domains"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                  Manage Domains
                </p>
                <p className="text-[11px] text-slate-500">TLD catalog & pricing</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
          </Link>

          <Link
            href="/admin/inquiries"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                  Buyer Inquiries
                </p>
                <p className="text-[11px] text-slate-500">Follow up leads</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
          </Link>

          <Link
            href="/admin/settings"
            className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                  Site Settings
                </p>
                <p className="text-[11px] text-slate-500">Brand & contact info</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
          </Link>
        </div>
      </div>

      {/* Two-Column Recent Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Orders
                </h3>
                <p className="text-xs text-slate-500">
                  Latest customer purchases and transactions
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          #{order.order_number || order.id.slice(0, 8)}
                        </span>
                        <AdminStatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        Rp {Number(order.total || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No orders yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Inquiries
                </h3>
                <p className="text-xs text-slate-500">
                  Prospective buyers and export consultation requests
                </p>
              </div>
              <Link
                href="/admin/inquiries"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {recentInquiries.length > 0 ? (
                recentInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {inq.name}
                        </span>
                        {inq.company_name && (
                          <span className="text-[11px] text-slate-500">
                            ({inq.company_name})
                          </span>
                        )}
                        <AdminStatusBadge status={inq.status || "new"} />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {inq.subject || inq.email}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {inq.created_at
                        ? new Date(inq.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })
                        : "-"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No inquiries yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Customers List */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Customers
            </h3>
            <p className="text-xs text-slate-500">
              Registered business accounts and clients
            </p>
          </div>
          <Link
            href="/admin/customers"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            View all customers <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {recentCustomers.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold">Country</th>
                  <th className="pb-3 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-bold text-slate-900">
                      {cust.full_name || "Unnamed"}
                    </td>
                    <td className="py-3 text-slate-600">{cust.email || "-"}</td>
                    <td className="py-3 text-slate-600">{cust.company || "-"}</td>
                    <td className="py-3 text-slate-600">{cust.country || "-"}</td>
                    <td className="py-3">
                      <AdminStatusBadge status={cust.role || "customer"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No customers yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
