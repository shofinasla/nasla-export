import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TemplateForm } from "@/components/admin/templates/TemplateForm";
import { updateTemplate } from "../../actions";

export const dynamic = "force-dynamic";

function list(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === "string")
    : [];
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();

  if (!template) {
    notFound();
  }

  const initialData = {
    id: template.id,
    name: template.name,
    slug: template.slug,
    category: template.category,
    price: template.price,
    description: template.description,
    demo_url: template.demo_url,
    preview_image: template.preview_image,
    storage_path: template.storage_path,
    screenshots: list(template.screenshots),
    features: list(template.features),
    tech_stack: list(template.tech_stack),
    is_featured: template.is_featured,
    is_published: template.is_published,
    sort_order: template.sort_order,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="MARKETPLACE CMS"
        title="Edit Template"
        description={`Updating properties and catalog settings for "${template.name}".`}
      >
        <Link
          href="/admin/templates"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Templates</span>
        </Link>
      </AdminPageHeader>

      <TemplateForm action={updateTemplate} initialData={initialData} isEdit={true} />
    </div>
  );
}
