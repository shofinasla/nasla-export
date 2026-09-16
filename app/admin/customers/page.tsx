import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CustomerTableClient } from "@/components/admin/customers/CustomerTableClient";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  let customers: any[] = [];
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, company, phone, country, address, avatar_url, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase profiles query error:", error.message);
    } else if (data) {
      customers = data;
    }
  } catch (err) {
    console.error("Error fetching customers:", err);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="ACCOUNTS & PROFILES"
        title="Customers"
        description="View and manage buyer profiles, exporter credentials, customer addresses, and system permissions."
      />

      <CustomerTableClient initialCustomers={customers} />
    </div>
  );
}
