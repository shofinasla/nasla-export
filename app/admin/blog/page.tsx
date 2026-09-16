import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogTableClient } from "@/components/admin/blog/BlogTableClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const supabase = await createClient();

  let posts: any[] = [];
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase blog_posts query error:", error.message);
    } else if (data) {
      posts = data;
    }
  } catch (err) {
    console.error("Error fetching blog posts:", err);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        tag="CONTENT MANAGEMENT"
        title="Blog Articles"
        description="Publish and organize export guides, market analysis, and platform announcements."
      />

      <BlogTableClient initialPosts={posts} />
    </div>
  );
}
