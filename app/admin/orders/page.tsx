import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderTableClient } from "@/components/admin/orders/OrderTableClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  let orders: any[] = [];
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        customer_id,
        status,
        subtotal,
        tax,
        total,
        currency,
        payment_method,
        payment_reference,
        notes,
        created_at,
        updated_at,
        customer:profiles (
          full_name,
          email,
          company
        ),
        items:order_items (
          id,
          item_type,
          title,
          price,
          quantity
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase orders query error:", error.message);
    } else if (data) {
      orders = data;
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="COMMERCE & BILLING"
        title="Orders"
        description="Monitor marketplace purchases, verify payment statuses, and manage transaction records."
      />

      <OrderTableClient initialOrders={orders} />
    </div>
  );
}
