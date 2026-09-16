"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { updateOrderStatus } from "@/app/admin/orders/actions";

interface OrderItem {
  id: string;
  order_number: string;
  customer_id?: string;
  customer?: {
    full_name?: string;
    email?: string;
    company?: string;
  } | null;
  status: string;
  subtotal?: number;
  tax?: number;
  total: number;
  currency?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items?: {
    id: string;
    item_type: string;
    title: string;
    price: number;
    quantity: number;
  }[];
}

interface OrderTableClientProps {
  initialOrders: OrderItem[];
}

export function OrderTableClient({ initialOrders }: OrderTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Order Detail / Status Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Metrics
  const metrics = useMemo(() => {
    const total = initialOrders.length;
    const pending = initialOrders.filter((o) => o.status === "pending").length;
    const paid = initialOrders.filter(
      (o) => o.status === "paid" || o.status === "completed"
    ).length;
    const grossRevenue = initialOrders
      .filter((o) => o.status === "paid" || o.status === "completed")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return { total, pending, paid, grossRevenue };
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
          <p className="mt-1 text-xs text-slate-500">All customer checkouts</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pending Payment
          </span>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {metrics.pending}
          </p>
          <p className="mt-1 text-xs text-slate-500">Awaiting invoice settlement</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Settled / Paid
          </span>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {metrics.paid}
          </p>
          <p className="mt-1 text-xs text-slate-500">Completed transactions</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Gross Revenue
          </span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            Rp {metrics.grossRevenue.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-xs text-slate-500">Total settled platform value</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 py-2.5 pr-4 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-2.5 right-3 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="total-desc">Total (High to Low)</option>
            <option value="total-asc">Total (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Orders Table or Empty State */}
      {filteredOrders.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Order #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    {/* Order # */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900">
                        #{o.order_number || o.id.slice(0, 8)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-900">
                          {o.customer?.full_name || "Guest / Buyer"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {o.customer?.email || "-"}
                        </p>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                        <span>{o.payment_method || "Direct Gateway"}</span>
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      Rp {Number(o.total || 0).toLocaleString("id-ID")}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <AdminStatusBadge status={o.status || "pending"} />
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3 w-3 text-slate-400" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AdminEmptyState
          title="No orders found"
          description={
            searchQuery || selectedStatus !== "all"
              ? "No orders match your filter criteria. Try resetting your search."
              : "No customer transactions have been recorded in the platform yet."
          }
        />
      )}

      {/* Order Details & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Order Details
              </span>
              <div className="mt-1 flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}
                </h3>
                <AdminStatusBadge status={selectedOrder.status} />
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Customer Info */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <p className="font-bold text-slate-400 uppercase text-[10px]">
                  Customer
                </p>
                <p className="font-bold text-slate-900">
                  {selectedOrder.customer?.full_name || "Guest Account"}
                </p>
                <p className="text-slate-500">{selectedOrder.customer?.email}</p>
                {selectedOrder.customer?.company && (
                  <p className="text-slate-500">
                    Company: {selectedOrder.customer.company}
                  </p>
                )}
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">
                    Items
                  </p>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50 p-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          Rp {Number(item.price).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Calculation */}
              <div className="flex justify-between items-center rounded-xl bg-slate-900 text-white p-3.5">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Total Settlement
                </span>
                <span className="text-base font-black">
                  Rp {Number(selectedOrder.total || 0).toLocaleString("id-ID")}
                </span>
              </div>

              {/* Status Update Form */}
              <form
                onSubmit={handleStatusSubmit}
                className="mt-4 border-t border-slate-100 pt-4 space-y-3"
              >
                <input type="hidden" name="id" value={selectedOrder.id} />

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Update Order Status
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedOrder.status || "pending"}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Admin Notes / Transaction Ref
                  </label>
                  <input
                    type="text"
                    name="notes"
                    defaultValue={selectedOrder.notes || ""}
                    placeholder="Internal reference notes..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Update Status"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
