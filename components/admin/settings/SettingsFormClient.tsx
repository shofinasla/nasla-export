"use client";

import React, { useState } from "react";
import {
  Settings,
  Building,
  Globe,
  CreditCard,
  Shield,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Database,
  Lock,
} from "lucide-react";
import { saveSiteSettings } from "@/app/admin/settings/actions";

interface SettingsFormClientProps {
  initialSettings: Record<string, any>;
}

export function SettingsFormClient({ initialSettings }: SettingsFormClientProps) {
  const [activeTab, setActiveTab] = useState<"general" | "seo" | "integrations" | "system">("general");
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generalData = initialSettings.general || {
    site_name: "NASLA EXPORT",
    tagline: "Digital Platform for Global Business",
    contact_email: "contact@naslaexport.com",
    contact_phone: "+62 812-3456-7890",
    business_address: "Jakarta, Indonesia",
    whatsapp_number: "6281234567890",
  };

  const seoData = initialSettings.seo || {
    meta_title: "Nasla Export — Digital Platform for Global Business",
    meta_description: "Scale your global export trade with modern website templates, custom digital infrastructure, and international business tools.",
    keywords: "export indonesia, b2b website templates, export marketplace, global trade platform",
  };

  const integrationsData = initialSettings.integrations || {
    payment_mode: "sandbox",
    currency: "IDR",
    registrar_service: "standard",
    supabase_sync: "active",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSaved(false);
    try {
      const formData = new FormData(e.currentTarget);
      await saveSiteSettings(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/90 pb-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors ${
            activeTab === "general"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building className="h-4 w-4" />
          <span>General & Brand</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors ${
            activeTab === "seo"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>SEO & Metadata</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors ${
            activeTab === "integrations"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payments & APIs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors ${
            activeTab === "system"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>System & Security</span>
        </button>
      </div>

      {isSaved && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Tab 1: General & Brand */}
      {activeTab === "general" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="key" value="general" />

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Platform Identity
              </h3>
              <p className="text-xs text-slate-500">
                Public branding information shown across headers and footers
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Platform Name
                </label>
                <input
                  type="text"
                  name="site_name"
                  defaultValue={generalData.site_name}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  defaultValue={generalData.tagline}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Contact Support Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  defaultValue={generalData.contact_email}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Official Phone Number
                </label>
                <input
                  type="text"
                  name="contact_phone"
                  defaultValue={generalData.contact_phone}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  WhatsApp Direct Number (Format: 628...)
                </label>
                <input
                  type="text"
                  name="whatsapp_number"
                  defaultValue={generalData.whatsapp_number}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Headquarters Address
                </label>
                <input
                  type="text"
                  name="business_address"
                  defaultValue={generalData.business_address}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Saving..." : "Save Identity"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: SEO & Metadata */}
      {activeTab === "seo" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="key" value="seo" />

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                SEO & OpenGraph Metadata
              </h3>
              <p className="text-xs text-slate-500">
                Optimize search engine discovery and social media previews
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Default Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                defaultValue={seoData.meta_title}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Meta Description (Recommended: 140–160 characters)
              </label>
              <textarea
                name="meta_description"
                rows={3}
                defaultValue={seoData.meta_description}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Target Keywords (Comma-separated)
              </label>
              <input
                type="text"
                name="keywords"
                defaultValue={seoData.keywords}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Saving..." : "Save SEO Settings"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Payments & APIs */}
      {activeTab === "integrations" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="key" value="integrations" />

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Payment Gateways & Integrations
              </h3>
              <p className="text-xs text-slate-500">
                Midtrans gateway configuration and webhook endpoints
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Payment Environment Mode
                </label>
                <select
                  name="payment_mode"
                  defaultValue={integrationsData.payment_mode}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
                >
                  <option value="sandbox">Sandbox (Testing / Development)</option>
                  <option value="production">Production (Live Payments)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Default Platform Currency
                </label>
                <input
                  type="text"
                  name="currency"
                  defaultValue={integrationsData.currency || "IDR"}
                  disabled
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Webhook Notification Endpoint URL
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700">
                <span>/api/payments/webhook</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Configure this URL in your payment gateway dashboard to receive transaction callbacks.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Saving..." : "Save Gateway Settings"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: System & Security */}
      {activeTab === "system" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              System Architecture & Health
            </h3>
            <p className="text-xs text-slate-500">
              Active cloud runtime, Supabase authorization, and security boundaries
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-xs text-slate-900">
                  Supabase Database
                </span>
              </div>
              <p className="text-xs text-slate-500">
                PostgreSQL with Row Level Security (RLS) policies enforcing admin RBAC via <code className="font-mono text-slate-800">public.is_admin()</code>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-xs text-slate-900">
                  Route Protection
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Server-side Next.js layouts enforce authenticated administrator sessions on all <code className="font-mono text-slate-800">/admin/*</code> routes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
