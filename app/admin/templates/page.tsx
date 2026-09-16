import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TemplateTableClient } from "@/components/admin/templates/TemplateTableClient";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const supabase = await createClient();

  let templates: any[] = [];
  try {
    const { data, error } = await supabase
      .from("templates")
      .select(
        "id, name, slug, description, category, price, demo_url, preview_image, is_published, is_featured, sort_order, created_at, updated_at"
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase templates query error:", error.message);
    } else if (data) {
      templates = data;
    }
  } catch (err) {
    console.error("Error fetching templates:", err);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="MARKETPLACE CATALOG"
        title="Templates"
        description="Manage website templates, live demos, pricing, features, and publication status."
      >
        <Link
          href="/admin/templates/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          <span>Add Template</span>
        </Link>
      </AdminPageHeader>

      <TemplateTableClient initialTemplates={templates} />
    </div>
  );
}
