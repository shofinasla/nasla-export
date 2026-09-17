import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  OrderTableClient,
  AdminOrderItem,
} from "@/components/admin/orders/OrderTableClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
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

  let orders: AdminOrderItem[] = [];

  try {
    // 2. Query orders with line items and profile info
    const { data: ordersData, error: ordersError } = await supabase
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
          quantity
        )
      `
      )
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.warn("Supabase orders query error:", ordersError.message);
    }

    // 3. Map customer emails from Auth Admin securely
    const authEmailMap = new Map<string, string>();
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminClient = createAdminClient();
        const { data: authUsers } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        if (authUsers?.users) {
          authUsers.users.forEach((u) => {
            if (u.email) authEmailMap.set(u.id, u.email);
          });
        }
      } catch (authErr) {
        console.warn("Admin client auth lookup error:", authErr);
      }
    }

    if (ordersData) {
      orders = ordersData.map((o: any) => {
        const custProfile = Array.isArray(o.customer)
          ? o.customer[0]
          : o.customer;
        const email = authEmailMap.get(o.customer_id) || "";

        return {
          id: o.id,
          order_number: o.order_number,
          customer_id: o.customer_id,
          customer: {
            full_name: custProfile?.full_name || null,
            email: email || null,
            company: custProfile?.company || null,
            phone: custProfile?.phone || null,
            country: custProfile?.country || null,
          },
          status: o.status,
          subtotal: Number(o.subtotal) || 0,
          discount: Number(o.discount) || 0,
          total: Number(o.total) || 0,
          currency: o.currency || "IDR",
          payment_method: o.payment_method || null,
          payment_reference: o.payment_reference || null,
          notes: o.notes || null,
          created_at: o.created_at,
          updated_at: o.updated_at,
          items: (o.items || []).map((item: any) => ({
            id: item.id,
            item_type: item.item_type,
            name: item.name,
            slug: item.slug,
            unit_price: Number(item.unit_price) || 0,
            total_price: Number(item.total_price) || 0,
            quantity: Number(item.quantity) || 1,
          })),
        };
      });
    }
  } catch (err) {
    console.error("Error fetching admin orders:", err);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="COMMERCE & BILLING"
        title="Orders"
        description="Monitor marketplace purchases, verify order statuses, and manage customer transaction records."
      />

      <OrderTableClient initialOrders={orders} />
    </div>
  );
}
