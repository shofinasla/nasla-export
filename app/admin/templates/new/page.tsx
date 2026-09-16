import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TemplateForm } from "@/components/admin/templates/TemplateForm";
import { createTemplate } from "../actions";

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="MARKETPLACE CMS"
        title="Add New Template"
        description="Fill in template details, pricing, screenshots, features, and publication settings."
      >
        <Link
          href="/admin/templates"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Templates</span>
        </Link>
      </AdminPageHeader>

      <TemplateForm action={createTemplate} isEdit={false} />
    </div>
  );
}
