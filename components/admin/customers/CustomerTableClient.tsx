"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Users,
  Building,
  Globe,
  Shield,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  Check,
} from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { updateCustomerRole, updateCustomerProfile } from "@/app/admin/customers/actions";

interface ProfileItem {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  company?: string;
  phone?: string;
  country?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

interface CustomerTableClientProps {
  initialCustomers: ProfileItem[];
}

export function CustomerTableClient({ initialCustomers }: CustomerTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Selected profile for viewing/editing in a slide-over modal
  const [selectedCustomer, setSelectedCustomer] = useState<ProfileItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = useMemo(() => {
    return initialCustomers
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (c.full_name && c.full_name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.country && c.country.toLowerCase().includes(q));

        const matchesRole =
          selectedRole === "all" || (c.role || "customer") === selectedRole;

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "name-asc") {
          return (a.full_name || a.email || "").localeCompare(
            b.full_name || b.email || ""
          );
        }
        return 0;
      });
  }, [initialCustomers, searchQuery, selectedRole, sortBy]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateCustomerProfile(formData);
      setIsEditing(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, company, country..."
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
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="exporter">Exporter</option>
            <option value="buyer">Buyer</option>
            <option value="admin">Administrator</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            <option value="date-desc">Newest Registered</option>
            <option value="date-asc">Oldest Registered</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Customer Count Indicator */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <p>
          Showing <span className="font-bold text-slate-900">{filteredCustomers.length}</span> of{" "}
          <span className="font-bold text-slate-900">{initialCustomers.length}</span> customers
        </p>
      </div>

      {/* Customer Table or Empty State */}
      {filteredCustomers.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Company</th>
                  <th className="px-5 py-3.5">Country & Location</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => {
                  const initial = (
                    c.full_name?.charAt(0) ||
                    c.email?.charAt(0) ||
                    "U"
                  ).toUpperCase();

                  return (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-700">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {c.full_name || "Unnamed"}
                            </p>
                            <p className="text-[11px] text-slate-400">{c.email || "-"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">
                            {c.company || "Personal Account"}
                          </span>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{c.country || "Not specified"}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-4">
                        <AdminStatusBadge status={c.role || "customer"} />
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 text-slate-500 text-[11px]">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsEditing(false);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Edit2 className="h-3 w-3 text-slate-400" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AdminEmptyState
          title="No customer accounts found"
          description={
            searchQuery || selectedRole !== "all"
              ? "No customer matches your search criteria. Try adjusting the filters."
              : "No registered customer profiles found in database yet."
          }
        />
      )}

      {/* Customer Detail / Edit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(null);
                setIsEditing(false);
              }}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-black text-lg">
                {(
                  selectedCustomer.full_name?.charAt(0) ||
                  selectedCustomer.email?.charAt(0) ||
                  "U"
                ).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCustomer.full_name || "Customer Account"}
                </h3>
                <p className="text-xs text-slate-400">{selectedCustomer.email}</p>
              </div>
            </div>

            {!isEditing ? (
              /* View Mode */
              <div className="mt-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Role Permission
                    </span>
                    <div className="mt-1">
                      <AdminStatusBadge
                        status={selectedCustomer.role || "customer"}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      User ID
                    </span>
                    <p className="mt-1 font-mono text-[11px] text-slate-600 truncate">
                      {selectedCustomer.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold">Company:</span>
                    <span>{selectedCustomer.company || "Not specified"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold">Phone:</span>
                    <span>{selectedCustomer.phone || "Not specified"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold">Country:</span>
                    <span>{selectedCustomer.country || "Not specified"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold">Address:</span>
                    <span>{selectedCustomer.address || "Not specified"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold">Registered:</span>
                    <span>
                      {selectedCustomer.created_at
                        ? new Date(selectedCustomer.created_at).toLocaleString(
                            "id-ID"
                          )
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Profile & Role</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleUpdateProfile} className="mt-5 space-y-3.5">
                <input type="hidden" name="id" value={selectedCustomer.id} />

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    defaultValue={selectedCustomer.full_name || ""}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      defaultValue={selectedCustomer.company || ""}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Role
                    </label>
                    <select
                      name="role"
                      defaultValue={selectedCustomer.role || "customer"}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                    >
                      <option value="customer">Customer</option>
                      <option value="exporter">Exporter</option>
                      <option value="buyer">Buyer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      defaultValue={selectedCustomer.phone || ""}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      defaultValue={selectedCustomer.country || ""}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Business Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={selectedCustomer.address || ""}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
