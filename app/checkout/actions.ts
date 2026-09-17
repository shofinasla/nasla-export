"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/orders";

export async function createTemplateOrder(formData: FormData) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    const slug = formData.get("template_slug")?.toString() || "";
    redirect(`/login?redirect=${encodeURIComponent(`/checkout?template=${slug}`)}`);
  }

  const templateSlug = formData.get("template_slug")?.toString().trim();
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!templateSlug) {
    throw new Error("Template is required to create an order.");
  }

  // 2. Fetch authoritative template details from database
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id, name, slug, price, category, demo_url, is_published")
    .eq("slug", templateSlug)
    .eq("is_published", true)
    .single();

  if (templateError || !template) {
    throw new Error("The requested template was not found or is currently unavailable.");
  }

  const unitPrice = Number(template.price) || 0;
  const subtotal = unitPrice;
  const discount = 0;
  const total = subtotal - discount;

  // 3. Ensure profile exists for the user
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
      role: "customer",
    });
  }

  // 4. Generate human-readable order number
  const orderNumber = await generateOrderNumber(supabase);

  // 5. Create Order atomically
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      order_number: orderNumber,
      status: "pending",
      subtotal,
      discount,
      total,
      currency: "IDR",
      notes,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Order creation error:", orderError);
    throw new Error(orderError?.message || "Failed to create order.");
  }

  // 6. Create Order Item
  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    item_type: "template",
    item_id: template.id,
    product_id: template.id,
    name: template.name,
    slug: template.slug,
    quantity: 1,
    unit_price: unitPrice,
    total_price: unitPrice,
    metadata: {
      category: template.category,
      demo_url: template.demo_url,
    },
  });

  if (itemError) {
    console.error("Order item creation error:", itemError);
    // Cleanup orphaned order if item insert failed
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(itemError?.message || "Failed to record order items.");
  }

  revalidatePath("/account/orders");
  revalidatePath("/account");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  redirect(`/account/orders/${order.order_number}?success=1`);
}
