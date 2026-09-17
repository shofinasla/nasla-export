import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  CustomerTableClient,
  CustomerItem,
} from "@/components/admin/customers/CustomerTableClient";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  // 1. Authenticate user & verify admin authorization
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile, error: profileCheckError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileCheckError || !currentProfile || currentProfile.role !== "admin") {
    redirect("/account");
  }

  let customers: CustomerItem[] = [];

  try {
    // 2. Query valid profile fields only from public.profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, role, company, phone, country, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.warn("Supabase profiles query error:", profilesError.message);
    }

    // 3. Query auth.users via admin client securely on the server
    const authUsersMap = new Map<
      string,
      { email: string; created_at?: string; full_name?: string }
    >();

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminClient = createAdminClient();
        const { data: authData, error: authError } =
          await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

        if (authError) {
          console.warn(
            "Failed to retrieve auth users via admin API:",
            authError.message
          );
        } else if (authData?.users) {
          for (const u of authData.users) {
            authUsersMap.set(u.id, {
              email: u.email || "",
              created_at: u.created_at,
              full_name:
                u.user_metadata?.full_name ||
                u.user_metadata?.name ||
                undefined,
            });
          }
        }
      } catch (authErr) {
        console.warn("Admin client auth lookup error:", authErr);
      }
    }

    // 4. Merge public.profiles with auth.users data
    const matchedUserIds = new Set<string>();

    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        matchedUserIds.add(p.id);
        const authUser = authUsersMap.get(p.id);

        customers.push({
          id: p.id,
          email: authUser?.email ?? "",
          full_name: p.full_name || authUser?.full_name || null,
          role: p.role || "customer",
          company: p.company || null,
          phone: p.phone || null,
          country: p.country || null,
          created_at:
            p.created_at || authUser?.created_at || new Date().toISOString(),
          updated_at: p.updated_at || null,
        });
      }
    }

    // 5. If any auth.users do not have a public.profiles entry yet, include them gracefully
    authUsersMap.forEach((authUser, authId) => {
      if (!matchedUserIds.has(authId)) {
        customers.push({
          id: authId,
          email: authUser.email,
          full_name: authUser.full_name || null,
          role: "customer",
          company: null,
          phone: null,
          country: null,
          created_at: authUser.created_at || new Date().toISOString(),
          updated_at: null,
        });
      }
    });
  } catch (err) {
    console.error("Error building admin customer list:", err);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="ACCOUNTS & PROFILES"
        title="Customers"
        description="View and manage buyer profiles, exporter credentials, customer contacts, and system permissions."
      />

      <CustomerTableClient initialCustomers={customers} />
    </div>
  );
}