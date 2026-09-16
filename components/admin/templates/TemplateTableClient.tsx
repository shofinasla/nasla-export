"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
  Eye,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { deleteTemplate } from "@/app/admin/templates/actions";

interface TemplateItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description?: string;
  preview_image?: string;
  demo_url?: string;
  is_published: boolean;
  is_featured?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

interface TemplateTableClientProps {
  initialTemplates: TemplateItem[];
}

export function TemplateTableClient({ initialTemplates }: TemplateTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFeatured, setSelectedFeatured] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  // State for delete modal confirmation
  const [deletingTemplate, setDeletingTemplate] = useState<TemplateItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialTemplates.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [initialTemplates]);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    return initialTemplates
      .filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q));

        const matchesCat =
          selectedCategory === "all" || item.category === selectedCategory;

        const matchesStatus =
          selectedStatus === "all" ||
          (selectedStatus === "published" && item.is_published) ||
          (selectedStatus === "draft" && !item.is_published);

        const matchesFeatured =
          selectedFeatured === "all" ||
          (selectedFeatured === "featured" && item.is_featured) ||
          (selectedFeatured === "standard" && !item.is_featured);

        return matchesSearch && matchesCat && matchesStatus && matchesFeatured;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "price-desc") {
          return Number(b.price || 0) - Number(a.price || 0);
        }
        if (sortBy === "price-asc") {
          return Number(a.price || 0) - Number(b.price || 0);
        }
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "sort-order") {
          return (a.sort_order || 0) - (b.sort_order || 0);
        }
        return 0;
      });
  }, [
    initialTemplates,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedFeatured,
    sortBy,
  ]);

  const handleDeleteConfirm = async () => {
    if (!deletingTemplate) return;
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("id", deletingTemplate.id);
      await deleteTemplate(formData);
      setDeletingTemplate(null);
    } catch (err) {
      console.error("Failed to delete template:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates by name, slug, category..."
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
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Featured Filter */}
          <select
            value={selectedFeatured}
            onChange={(e) => setSelectedFeatured(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="all">Featured / All</option>
            <option value="featured">Featured Only</option>
            <option value="standard">Standard</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="sort-order">Sort Order Index</option>
          </select>
        </div>
      </div>

      {/* Results Count indicator */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <p>
          Showing <span className="font-bold text-slate-900">{filteredTemplates.length}</span> of{" "}
          <span className="font-bold text-slate-900">{initialTemplates.length}</span> templates
        </p>
        {(searchQuery ||
          selectedCategory !== "all" ||
          selectedStatus !== "all" ||
          selectedFeatured !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedStatus("all");
              setSelectedFeatured("all");
            }}
            className="font-bold text-slate-700 underline hover:text-slate-950"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Templates Table or Empty State */}
      {filteredTemplates.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Template</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Featured</th>
                  <th className="px-5 py-3.5">Last Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTemplates.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-slate-50/60">
                    {/* Template Name & Thumbnail */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {t.preview_image ? (
                            <img
                              src={t.preview_image}
                              alt={t.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">
                            {t.name}
                          </p>
                          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                            <span>/{t.slug}</span>
                            {t.demo_url && (
                              <a
                                href={t.demo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center text-slate-500 hover:text-slate-900"
                                title="Live Demo"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {t.category || "General"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      Rp {Number(t.price || 0).toLocaleString("id-ID")}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <AdminStatusBadge
                        status={t.is_published ? "published" : "draft"}
                      />
                    </td>

                    {/* Featured */}
                    <td className="px-5 py-4">
                      {t.is_featured ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {t.created_at
                        ? new Date(t.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/templates/${t.slug}`}
                          target="_blank"
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                          title="View on Storefront"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/templates/${t.id}/edit`}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                          title="Edit Template"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeletingTemplate(t)}
                          className="rounded-lg border border-rose-200 bg-rose-50/50 p-1.5 text-rose-600 transition-colors hover:bg-rose-100/80"
                          title="Delete Template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AdminEmptyState
          title="No templates found"
          description={
            searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
              ? "No templates match your current search criteria. Try resetting the filters."
              : "No templates exist in the marketplace catalog yet. Add your first template to start building."
          }
          actionHref="/admin/templates/new"
          actionLabel="Add New Template"
        />
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmDialog
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Template"
        description={`Are you sure you want to delete "${deletingTemplate?.name}"? This action cannot be undone and will remove it from the marketplace.`}
        confirmLabel="Yes, Delete Template"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
