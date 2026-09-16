"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  MessageSquare,
  Mail,
  Building,
  Globe,
  Phone,
  Calendar,
  Eye,
  Trash2,
  X,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import {
  updateInquiryStatus,
  deleteInquiry,
} from "@/app/admin/inquiries/actions";

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  company_name?: string;
  country?: string;
  phone?: string;
  subject?: string;
  message?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
}

interface InquiryTableClientProps {
  initialInquiries: InquiryItem[];
}

export function InquiryTableClient({ initialInquiries }: InquiryTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Detail Modal
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal
  const [deletingInquiry, setDeletingInquiry] = useState<InquiryItem | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Metrics
  const metrics = useMemo(() => {
    const total = initialInquiries.length;
    const newLeads = initialInquiries.filter(
      (i) => i.status === "new" || !i.status
    ).length;
    const inReview = initialInquiries.filter(
      (i) => i.status === "in_review"
    ).length;
    const replied = initialInquiries.filter(
      (i) => i.status === "replied" || i.status === "closed"
    ).length;

    return { total, newLeads, inReview, replied };
  }, [initialInquiries]);

  const filteredInquiries = useMemo(() => {
    return initialInquiries
      .filter((i) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          (i.company_name && i.company_name.toLowerCase().includes(q)) ||
          (i.country && i.country.toLowerCase().includes(q)) ||
          (i.subject && i.subject.toLowerCase().includes(q)) ||
          (i.message && i.message.toLowerCase().includes(q));

        const matchesStatus =
          selectedStatus === "all" ||
          i.status === selectedStatus ||
          (!i.status && selectedStatus === "new");

        return matchesSearch && matchesStatus;
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
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [initialInquiries, searchQuery, selectedStatus, sortBy]);

  const handleStatusSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setIsUpdating(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateInquiryStatus(formData);
      setSelectedInquiry(null);
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInquiry) return;
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("id", deletingInquiry.id);
      await deleteInquiry(formData);
      setDeletingInquiry(null);
      if (selectedInquiry?.id === deletingInquiry.id) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
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
            Total Inquiries
          </span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {metrics.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">Buyer consultation requests</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            New Leads
          </span>
          <p className="mt-2 text-2xl font-black text-blue-600">
            {metrics.newLeads}
          </p>
          <p className="mt-1 text-xs text-slate-500">Awaiting initial follow up</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            In Review
          </span>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {metrics.inReview}
          </p>
          <p className="mt-1 text-xs text-slate-500">Under team evaluation</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Replied / Closed
          </span>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {metrics.replied}
          </p>
          <p className="mt-1 text-xs text-slate-500">Completed consultations</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by prospect name, email, company, subject..."
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
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table or Empty State */}
      {filteredInquiries.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Prospect</th>
                  <th className="px-5 py-3.5">Company & Country</th>
                  <th className="px-5 py-3.5">Subject / Message</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Received Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    {/* Name & Contact */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{inq.name}</p>
                        <p className="text-[11px] text-slate-400">{inq.email}</p>
                      </div>
                    </td>

                    {/* Company & Country */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {inq.company_name || "Individual"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {inq.country || "-"}
                      </p>
                    </td>

                    {/* Subject / Message Snippet */}
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-bold text-slate-900 line-clamp-1">
                        {inq.subject || "Consultation Request"}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {inq.message || "-"}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <AdminStatusBadge status={inq.status || "new"} />
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {inq.created_at
                        ? new Date(inq.created_at).toLocaleDateString("id-ID", {
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
                          onClick={() => setSelectedInquiry(inq)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3 w-3 text-slate-400" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingInquiry(inq)}
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
          title="No inquiries found"
          description={
            searchQuery || selectedStatus !== "all"
              ? "No inquiries match your current search criteria."
              : "No prospective buyer inquiries received yet."
          }
        />
      )}

      {/* Inquiry Detail & Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Buyer Inquiry
              </span>
              <div className="mt-1 flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {selectedInquiry.name}
                </h3>
                <AdminStatusBadge status={selectedInquiry.status || "new"} />
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Sender Details */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold">Email:</span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-blue-600 underline"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>

                {selectedInquiry.company_name && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold">Company:</span>
                    <span>{selectedInquiry.company_name}</span>
                  </div>
                )}

                {selectedInquiry.country && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold">Country:</span>
                    <span>{selectedInquiry.country}</span>
                  </div>
                )}

                {selectedInquiry.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold">Phone:</span>
                    <span>{selectedInquiry.phone}</span>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
                <p className="font-bold text-slate-900">
                  {selectedInquiry.subject || "No Subject"}
                </p>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message || "No message content provided."}
                </p>
              </div>

              {/* Quick Communication Actions */}
              <div className="flex gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(
                    selectedInquiry.subject || "Inquiry to Nasla Export"
                  )}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Reply via Email</span>
                </a>

                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Status Update Form */}
              <form
                onSubmit={handleStatusSubmit}
                className="border-t border-slate-100 pt-4 space-y-3"
              >
                <input type="hidden" name="id" value={selectedInquiry.id} />

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedInquiry.status || "new"}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
                  >
                    <option value="new">New</option>
                    <option value="in_review">In Review</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Internal Admin Notes
                  </label>
                  <textarea
                    name="admin_notes"
                    rows={2}
                    defaultValue={selectedInquiry.admin_notes || ""}
                    placeholder="Notes regarding follow-up or quotation..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save Status"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!deletingInquiry}
        onClose={() => setDeletingInquiry(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Inquiry"
        description={`Are you sure you want to remove inquiry from "${deletingInquiry?.name}"?`}
        confirmLabel="Yes, Delete Inquiry"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
