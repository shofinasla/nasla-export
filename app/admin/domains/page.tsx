import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DomainTableClient } from "@/components/admin/domains/DomainTableClient";

export const dynamic = "force-dynamic";

export default async function AdminDomainsPage() {
  const supabase = await createClient();

  let tlds: any[] = [];
  let searches: any[] = [];

  try {
    const { data: tldData, error: tldError } = await supabase
      .from("domain_tlds")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("tld", { ascending: true });

    if (tldError) {
      console.warn("Supabase domain_tlds query warning:", tldError.message);
    } else if (tldData) {
      tlds = tldData;
    }

    const { data: searchData } = await supabase
      .from("domain_searches")
      .select("*")
      .order("searched_at", { ascending: false })
      .limit(10);

    if (searchData) {
      searches = searchData;
    }
  } catch (err) {
    console.error("Error fetching domain configuration:", err);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="INFRASTRUCTURE & TLDs"
        title="Domain Extensions"
        description="Configure top-level domain pricing, extension catalog, and registrar routing boundaries."
      />

      <DomainTableClient initialTlds={tlds} recentSearches={searches} />
    </div>
  );
}
