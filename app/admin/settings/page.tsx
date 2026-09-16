import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsFormClient } from "@/components/admin/settings/SettingsFormClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const settingsMap: Record<string, any> = {};

  try {
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("key, value");

    if (settingsData) {
      settingsData.forEach((row) => {
        settingsMap[row.key] = row.value;
      });
    }
  } catch (err) {
    console.error("Error fetching site settings:", err);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="CONFIGURATION"
        title="Platform Settings"
        description="Configure organization details, SEO meta definitions, gateway environments, and platform security."
      />

      <SettingsFormClient initialSettings={settingsMap} />
    </div>
  );
}
