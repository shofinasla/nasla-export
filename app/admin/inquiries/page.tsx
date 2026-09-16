import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InquiryTableClient } from "@/components/admin/inquiries/InquiryTableClient";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const supabase = await createClient();

  let inquiries: any[] = [];
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .select("id, name, email, company_name, country, phone, subject, message, status, admin_notes, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase inquiries query error:", error.message);
    } else if (data) {
      inquiries = data;
    }
  } catch (err) {
    console.error("Error fetching inquiries:", err);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="LEAD PIPELINE"
        title="Buyer Inquiries"
        description="Review inbound business inquiries, export requests, and client communication records."
      />

      <InquiryTableClient initialInquiries={inquiries} />
    </div>
  );
}
