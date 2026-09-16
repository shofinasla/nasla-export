"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Globe,
  Sparkles,
  Layers,
  DollarSign,
  Image as ImageIcon,
  Check,
  ExternalLink,
  Code,
  ListPlus,
  Eye,
} from "lucide-react";

interface TemplateFormData {
  id?: string;
  name?: string;
  slug?: string;
  category?: string;
  price?: number;
  description?: string;
  demo_url?: string;
  preview_image?: string;
  storage_path?: string;
  screenshots?: string[];
  features?: string[];
  tech_stack?: string[];
  is_featured?: boolean;
  is_published?: boolean;
  sort_order?: number;
}

interface TemplateFormProps {
  initialData?: TemplateFormData;
  action: (formData: FormData) => Promise<void>;
  isEdit?: boolean;
}

export function TemplateForm({ initialData, action, isEdit }: TemplateFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isManualSlug, setIsManualSlug] = useState(!!initialData?.slug);
  const [previewImage, setPreviewImage] = useState(initialData?.preview_image || "");
  const [demoUrl, setDemoUrl] = useState(initialData?.demo_url || "");
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isManualSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generated);
    }
  };

  const screenshotsText = Array.isArray(initialData?.screenshots)
    ? initialData?.screenshots.join("\n")
    : "";

  const featuresText = Array.isArray(initialData?.features)
    ? initialData?.features.join("\n")
    : "";

  const techStackText = Array.isArray(initialData?.tech_stack)
    ? initialData?.tech_stack.join("\n")
    : "";

  return (
    <form action={action} className="space-y-6">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      {/* Editing Notification Banner if Edit */}
      {isEdit && (
        <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-3 text-xs text-blue-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>
              Editing template:{" "}
              <strong className="font-bold">{initialData?.name}</strong>
            </span>
          </div>
          <span className="font-mono text-[11px] text-blue-600">
            ID: {initialData?.id?.slice(0, 8)}...
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Left Column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Basic Information */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Basic Information
                </h3>
                <p className="text-[11px] text-slate-400">
                  Essential identifiers and classification
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleNameChange}
                  required
                  placeholder="e.g. Export Commodities Hub"
                  className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/40 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1.5 flex rounded-xl border border-slate-200/90 bg-slate-50/40 focus-within:border-slate-400 focus-within:bg-white">
                    <span className="flex items-center px-3 text-xs text-slate-400">
                      /
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={slug}
                      onChange={(e) => {
                        setIsManualSlug(true);
                        setSlug(e.target.value);
                      }}
                      required
                      placeholder="export-commodities"
                      className="w-full bg-transparent py-2.5 pr-3 text-xs font-mono text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={initialData?.category || "Export"}
                    required
                    placeholder="e.g. Export, UMKM, Corporate"
                    className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/40 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Description & Value Proposition
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={initialData?.description || ""}
                  placeholder="Explain who this template is for, key business value, and features..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/40 p-3.5 text-xs text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Media & Screenshots */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Media & Visual Assets
                </h3>
                <p className="text-[11px] text-slate-400">
                  Cover images, screenshots, and package storage paths
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Cover / Preview Image URL
                </label>
                <input
                  type="url"
                  name="preview_image"
                  value={previewImage}
                  onChange={(e) => setPreviewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/40 px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>

              {previewImage && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <p className="border-b border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    Preview Image Rendering
                  </p>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-48 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Screenshots Gallery (1 URL per line)
                </label>
                <textarea
                  name="screenshots"
                  rows={3}
                  defaultValue={screenshotsText}
                  placeholder="https://...&#10;https://..."
                  className="mt-1.5 w-full font-mono rounded-xl border border-slate-200/90 bg-slate-50/40 p-3.5 text-xs text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Storage / Distribution File Path
                </label>
                <input
                  type="text"
                  name="storage_path"
                  defaultValue={initialData?.storage_path || ""}
                  placeholder="templates/export-hub.zip"
                  className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/40 px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 3. Features & Tech Stack */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Code className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Features & Technology Specifications
                </h3>
                <p className="text-[11px] text-slate-400">
                  Key capabilities bullet points and tech framework tags
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Features List (1 item per line)
                </label>
                <textarea
                  name="features"
                  rows={4}
                  defaultValue={featuresText}
                  placeholder="Multi-language Support (EN/ID)&#10;RFQ Quotation Request Form&#10;SEO Optimized Product Catalog"
                  className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/40 p-3.5 text-xs text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Technology Stack (1 item per line)
                </label>
                <textarea
                  name="tech_stack"
                  rows={4}
                  defaultValue={techStackText}
                  placeholder="Next.js 15+&#10;Tailwind CSS&#10;TypeScript&#10;Supabase"
                  className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/40 p-3.5 text-xs text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (1 col) */}
        <div className="space-y-6">
          {/* Pricing & Commercial */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pricing</h3>
                <p className="text-[11px] text-slate-400">Template license cost</p>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-700">
                Price (IDR) <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1.5 flex rounded-xl border border-slate-200/90 bg-slate-50/40 focus-within:border-slate-400 focus-within:bg-white">
                <span className="flex items-center px-3 text-xs font-bold text-slate-500">
                  Rp
                </span>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="1000"
                  defaultValue={initialData?.price ?? 1250000}
                  required
                  className="w-full bg-transparent py-2.5 pr-3 text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Standard format: numeric value without punctuation.
              </p>
            </div>
          </div>

          {/* Live Preview Demo */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Demo</h3>
                <p className="text-[11px] text-slate-400">External prototype link</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  name="demo_url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://demo.naslaexport.com/..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/40 px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950"
                >
                  <ExternalLink className="h-3 w-3" />
                  Test Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Marketplace Status & Visibility */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Marketplace Status
                </h3>
                <p className="text-[11px] text-slate-400">
                  Publication and prominence
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Publish Immediately
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Visible to public storefront visitors
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Featured Template
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Pin with featured badge in marketplace
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Sort Order Index
                </label>
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={initialData?.sort_order ?? 0}
                  className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/40 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Lower numbers display first (0, 1, 2...).
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              <span>{isEdit ? "Save Changes" : "Create Template"}</span>
            </button>

            <Link
              href="/admin/templates"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
