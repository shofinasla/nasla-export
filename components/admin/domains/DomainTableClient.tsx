"use client";

import React, { useState } from "react";
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Search,
  DollarSign,
  Shield,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import {
  createDomainTld,
  updateDomainTld,
  deleteDomainTld,
} from "@/app/admin/domains/actions";

interface DomainTldItem {
  id: string;
  tld: string;
  price_registration: number;
  price_renewal: number;
  price_transfer: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
}

interface DomainSearchLog {
  id: string;
  domain_name: string;
  tld?: string;
  is_available: boolean;
  searched_at: string;
}

interface DomainTableClientProps {
  initialTlds: DomainTldItem[];
  recentSearches?: DomainSearchLog[];
}

export function DomainTableClient({
  initialTlds,
  recentSearches = [],
}: DomainTableClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTld, setEditingTld] = useState<DomainTldItem | null>(null);
  const [deletingTld, setDeletingTld] = useState<DomainTldItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (editingTld) {
        await updateDomainTld(formData);
      } else {
        await createDomainTld(formData);
      }
      setModalOpen(false);
      setEditingTld(null);
    } catch (err) {
      console.error("Domain TLD submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTld) return;
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("id", deletingTld.id);
      await deleteDomainTld(formData);
      setDeletingTld(null);
    } catch (err) {
      console.error("Failed to delete domain TLD:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TLD Catalog Header & Add Button */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Top-Level Domain (TLD) Pricing Catalog
          </h3>
          <p className="text-xs text-slate-500">
            Configure registration, renewal, and transfer fees for customer domain search
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingTld(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Extension (TLD)</span>
        </button>
      </div>

      {/* TLDs Table or Empty State */}
      {initialTlds.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">TLD Extension</th>
                  <th className="px-5 py-3.5">Registration Fee</th>
                  <th className="px-5 py-3.5">Renewal Fee</th>
                  <th className="px-5 py-3.5">Transfer Fee</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialTlds.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    {/* TLD */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-black text-slate-900">
                        {item.tld}
                      </span>
                    </td>

                    {/* Reg Price */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      Rp {Number(item.price_registration || 0).toLocaleString("id-ID")}/yr
                    </td>

                    {/* Renew Price */}
                    <td className="px-5 py-4 text-slate-600">
                      Rp {Number(item.price_renewal || 0).toLocaleString("id-ID")}/yr
                    </td>

                    {/* Transfer Price */}
                    <td className="px-5 py-4 text-slate-600">
                      Rp {Number(item.price_transfer || 0).toLocaleString("id-ID")}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <AdminStatusBadge
                        status={item.is_active ? "active" : "inactive"}
                      />
                    </td>

                    {/* Order */}
                    <td className="px-5 py-4 font-mono text-slate-400">
                      {item.sort_order ?? 0}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTld(item);
                            setModalOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTld(item)}
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
          title="No domain extensions configured"
          description="Add supported domain extensions (.com, .id, .co.id) to enable domain search & pricing on the storefront."
          actionLabel="Add First Domain TLD"
          onAction={() => {
            setEditingTld(null);
            setModalOpen(true);
          }}
        />
      )}

      {/* Registrar Integration Notes Box */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Registrar API Gateway Boundary
            </h3>
            <p className="text-xs text-slate-500">
              EPP / Registrar Protocol Information
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            When customers perform domain availability lookups in{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-800">
              /domains
            </code>
            , the platform routes requests through the API endpoint{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-800">
              /api/domains/check
            </code>
            .
          </p>
          <p>
            Configure your domain registrar API credentials (e.g. ResellerClub,
            Namecheap, or PANDI) in your secure server environment to stream live
            WHOIS availability responses without fabricating mock results.
          </p>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingTld(null);
              }}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingTld ? `Edit ${editingTld.tld}` : "Add New TLD Extension"}
              </h3>
              <p className="text-xs text-slate-500">
                Set extension name and pricing in IDR
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              {editingTld && <input type="hidden" name="id" value={editingTld.id} />}

              <div>
                <label className="block font-bold text-slate-700">
                  TLD Extension (e.g. .com, .id, .co.id)
                </label>
                <input
                  type="text"
                  name="tld"
                  defaultValue={editingTld?.tld || "."}
                  required
                  placeholder=".com"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono font-bold text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">
                    Registration Fee (IDR)
                  </label>
                  <input
                    type="number"
                    name="price_registration"
                    defaultValue={editingTld?.price_registration || 175000}
                    required
                    min="0"
                    step="1000"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">
                    Renewal Fee (IDR)
                  </label>
                  <input
                    type="number"
                    name="price_renewal"
                    defaultValue={editingTld?.price_renewal || 195000}
                    required
                    min="0"
                    step="1000"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">
                    Transfer Fee (IDR)
                  </label>
                  <input
                    type="number"
                    name="price_transfer"
                    defaultValue={editingTld?.price_transfer || 175000}
                    required
                    min="0"
                    step="1000"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    defaultValue={editingTld?.sort_order ?? 0}
                    min="0"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={editingTld ? editingTld.is_active : true}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="font-bold text-slate-900">
                  Active (Available for customer registration)
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingTld(null);
                  }}
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
                    : editingTld
                    ? "Save Changes"
                    : "Create Extension"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!deletingTld}
        onClose={() => setDeletingTld(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Domain Extension"
        description={`Are you sure you want to delete ${deletingTld?.tld}? Customers will no longer be able to select this TLD.`}
        confirmLabel="Yes, Delete TLD"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
