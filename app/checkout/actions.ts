"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/orders";
import { initiatePaymentForOrder } from "@/lib/payments/service";
import { PaymentMethodCategory } from "@/lib/payments/types";

export async function createTemplateOrder(formData: FormData) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const templateSlug = formData.get("template_slug")?.toString().trim();
  const paymentMethod = (formData.get("payment_method")?.toString().trim() || "qris") as PaymentMethodCategory;
  const paymentChannel = formData.get("payment_channel")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;

  if (authError || !user) {
    const slug = templateSlug || "";
    redirect(`/login?redirect=${encodeURIComponent(`/checkout?template=${slug}`)}`);
  }

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
      payment_method: paymentMethod,
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

  // 7. Initiate Payment attempt through Payment Core Service
  let paymentResult = null;
  try {
    paymentResult = await initiatePaymentForOrder({
      orderNumber: order.order_number,
      paymentMethod,
      paymentChannel,
    });
  } catch (paymentErr: any) {
    console.warn("Payment initiation note:", paymentErr?.message);
  }

  revalidatePath("/account/orders");
  revalidatePath("/account");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  // If gateway returned an active payment URL (and not just internal fallback), redirect or send to order details
  redirect(`/account/orders/${order.order_number}?success=1`);
}

/**
 * Server action to initiate or retry payment for an existing unpaid order
 */
export async function retryOrderPaymentAction(formData: FormData) {
  const orderNumber = formData.get("order_number")?.toString().trim();
  const paymentMethod = (formData.get("payment_method")?.toString().trim() || "qris") as PaymentMethodCategory;
  const paymentChannel = formData.get("payment_channel")?.toString().trim() || null;

  if (!orderNumber) {
    throw new Error("Nomor pesanan tidak valid.");
  }

  await initiatePaymentForOrder({
    orderNumber,
    paymentMethod,
    paymentChannel,
  });

  revalidatePath(`/account/orders/${orderNumber}`);
  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");

  redirect(`/account/orders/${orderNumber}?pay_initiated=1`);
}
