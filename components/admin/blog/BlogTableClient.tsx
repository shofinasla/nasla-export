"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Eye,
  Calendar,
  Image as ImageIcon,
  X,
  ExternalLink,
} from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "@/app/admin/blog/actions";

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  category?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at?: string;
}

interface BlogTableClientProps {
  initialPosts: BlogPostItem[];
}

export function BlogTableClient({ initialPosts }: BlogTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPostItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [isManualSlug, setIsManualSlug] = useState(false);

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialPosts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [initialPosts]);

  // Metrics
  const metrics = useMemo(() => {
    const total = initialPosts.length;
    const published = initialPosts.filter((p) => p.is_published).length;
    const drafts = initialPosts.filter((p) => !p.is_published).length;
    return { total, published, drafts, catCount: categories.length };
  }, [initialPosts, categories]);

  const filteredPosts = useMemo(() => {
    return initialPosts
      .filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q));

        const matchesCat =
          selectedCategory === "all" || p.category === selectedCategory;

        const matchesStatus =
          selectedStatus === "all" ||
          (selectedStatus === "published" && p.is_published) ||
          (selectedStatus === "draft" && !p.is_published);

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        if (sortBy === "date-asc") {
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
        if (sortBy === "title-asc") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [initialPosts, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormSlug("");
    setIsManualSlug(false);
    setModalOpen(true);
  };

  const openEditModal = (p: BlogPostItem) => {
    setEditingPost(p);
    setFormTitle(p.title);
    setFormSlug(p.slug);
    setIsManualSlug(true);
    setModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormTitle(val);
    if (!isManualSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setFormSlug(generated);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (editingPost) {
        await updateBlogPost(formData);
      } else {
        await createBlogPost(formData);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Blog post submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("id", deletingPost.id);
      await deleteBlogPost(formData);
      setDeletingPost(null);
    } catch (err) {
      console.error("Failed to delete blog post:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Articles
          </span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {metrics.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">SEO & industry articles</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Published Live
          </span>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {metrics.published}
          </p>
          <p className="mt-1 text-xs text-slate-500">Accessible on /blog</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Drafts
          </span>
          <p className="mt-2 text-2xl font-black text-slate-600">
            {metrics.drafts}
          </p>
          <p className="mt-1 text-xs text-slate-500">Unpublished write-ups</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Categories
          </span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {metrics.catCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Active content topics</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title, slug, excerpt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 py-2.5 pr-4 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden"
          />
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

          {/* New Article CTA */}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span>Write Article</span>
          </button>
        </div>
      </div>

      {/* Blog Table or Empty State */}
      {filteredPosts.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Article</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Published Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosts.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    {/* Title & Thumbnail */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {p.featured_image ? (
                            <img
                              src={p.featured_image}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">
                            {p.title}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">
                            /blog/{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {p.category || "General"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <AdminStatusBadge
                        status={p.is_published ? "published" : "draft"}
                      />
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {p.published_at || p.created_at
                        ? new Date(
                            p.published_at || p.created_at
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPost(p)}
                          className="rounded-lg border border-rose-200 bg-rose-50/50 p-1.5 text-rose-600 hover:bg-rose-100"
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
          title="No blog articles found"
          description={
            searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
              ? "No articles match your current search query."
              : "No articles published yet. Create your first export insight article."
          }
          actionLabel="Write First Article"
          onAction={openCreateModal}
        />
      )}

      {/* Article Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingPost ? "Edit Article" : "Write New Article"}
              </h3>
              <p className="text-xs text-slate-500">
                Create engaging SEO export guides and platform news
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              {editingPost && (
                <input type="hidden" name="id" value={editingPost.id} />
              )}

              <div>
                <label className="block font-bold text-slate-700">
                  Article Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formTitle}
                  onChange={handleTitleChange}
                  required
                  placeholder="e.g. How Indonesian Coffee Exporters Build Global Reach"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formSlug}
                    onChange={(e) => {
                      setIsManualSlug(true);
                      setFormSlug(e.target.value);
                    }}
                    required
                    placeholder="how-indonesian-coffee-exporters-scale"
                    className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingPost?.category || "Export Guide"}
                    placeholder="e.g. Export Guide, Market Trends"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  name="featured_image"
                  defaultValue={editingPost?.featured_image || ""}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">
                  Summary / Excerpt
                </label>
                <textarea
                  name="excerpt"
                  rows={2}
                  defaultValue={editingPost?.excerpt || ""}
                  placeholder="Short description for social meta and listing cards..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">
                  Article Body (Markdown format supported)
                </label>
                <textarea
                  name="content"
                  rows={8}
                  defaultValue={editingPost?.content || ""}
                  placeholder="## Introduction&#10;&#10;Write comprehensive market insights..."
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <label className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  defaultChecked={
                    editingPost ? editingPost.is_published : true
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <p className="font-bold text-slate-900">
                    Publish Immediately
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Will be visible on the public /blog index
                  </p>
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingPost
                    ? "Save Changes"
                    : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Article"
        description={`Are you sure you want to delete "${deletingPost?.title}"?`}
        confirmLabel="Yes, Delete Article"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
