import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PaymentRecord,
  PaymentMethodCategory,
  CreatePaymentResult,
  WebhookVerificationResult,
} from "./types";
import { getPaymentProvider, getProviderForMethod } from "./registry";

export interface InitiatePaymentOptions {
  orderNumber: string;
  paymentMethod: PaymentMethodCategory;
  paymentChannel?: string | null;
  providerName?: string | null;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Server-Authoritative Payment Initiation
 * 1. Authenticates current user
 * 2. Fetches order and verifies ownership
 * 3. Extracts authoritative order total from database (never trusting client input)
 * 4. Inserts a new payment attempt record in `public.payments`
 * 5. Calls the provider adapter to generate checkout session or instructions
 * 6. Updates payment record with provider IDs and returns safe payment URL / instructions
 */
export async function initiatePaymentForOrder(
  options: InitiatePaymentOptions
): Promise<CreatePaymentResult & { paymentId?: string }> {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Sesi login Anda telah berakhir. Silakan login kembali.");
  }

  // 2. Fetch order and verify ownership
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, customer_id, status, subtotal, discount, total, currency, notes")
    .eq("order_number", options.orderNumber)
    .single();

  if (orderError || !order) {
    throw new Error(`Pesanan dengan nomor ${options.orderNumber} tidak ditemukan.`);
  }

  if (order.customer_id !== user.id) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Anda tidak memiliki izin untuk mengakses pesanan ini.");
    }
  }

  // Check if order is already paid or completed
  if (order.status === "paid" || order.status === "completed" || order.status === "processing") {
    throw new Error("Pesanan ini sudah berhasil dibayar atau sedang diproses.");
  }

  // 3. Fetch order items for invoice details
  const { data: items } = await supabase
    .from("order_items")
    .select("name, quantity, unit_price, total_price, slug, item_type")
    .eq("order_id", order.id);

  // 4. Fetch customer profile info
  const { data: customerProfile } = await supabase
    .from("profiles")
    .select("full_name, company, phone, country")
    .eq("id", order.customer_id)
    .single();

  const customerInfo = {
    id: user.id,
    email: user.email || "",
    fullName: customerProfile?.full_name || user.user_metadata?.full_name,
    phone: customerProfile?.phone,
    company: customerProfile?.company,
    country: customerProfile?.country,
  };

  // 5. Select payment provider adapter
  const provider = getProviderForMethod(options.paymentMethod, options.providerName || undefined);

  // 6. Use Admin client to insert payment attempt row (Server-authoritative)
  let adminDb = null;
  try {
    adminDb = createAdminClient();
  } catch {
    adminDb = supabase;
  }

  const { data: paymentRow, error: paymentInsertError } = await adminDb
    .from("payments")
    .insert({
      order_id: order.id,
      provider: provider.name,
      payment_method: options.paymentMethod,
      payment_channel: options.paymentChannel || null,
      amount: order.total,
      currency: order.currency || "IDR",
      status: "pending",
      metadata: {
        initiated_by: user.id,
        order_number: order.order_number,
        method: options.paymentMethod,
        channel: options.paymentChannel,
      },
    })
    .select("id")
    .single();

  if (paymentInsertError) {
    console.error("Failed to insert payment record:", paymentInsertError);
    // Proceed if table not migrated yet in local preview, but log warning
  }

  const paymentId = paymentRow?.id;

  // 7. Call provider adapter
  const providerResult = await provider.createPayment({
    orderId: order.id,
    orderNumber: order.order_number,
    amount: Number(order.total),
    currency: order.currency || "IDR",
    customer: customerInfo,
    method: options.paymentMethod,
    channel: options.paymentChannel,
    items: (items || []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      totalPrice: Number(i.total_price),
      slug: i.slug,
      itemType: i.item_type,
    })),
    notes: order.notes,
    successUrl: options.successUrl,
    cancelUrl: options.cancelUrl,
    metadata: {
      payment_id: paymentId,
      order_number: order.order_number,
    },
  });

  // 8. Update payment record with provider result details
  if (paymentId && providerResult.success) {
    await adminDb
      .from("payments")
      .update({
        provider_payment_id: providerResult.providerPaymentId || null,
        provider_reference: providerResult.providerReference || null,
        payment_url: providerResult.paymentUrl || null,
        expires_at: providerResult.expiresAt || null,
        metadata: {
          initiated_by: user.id,
          order_number: order.order_number,
          instructions: providerResult.instructions,
          raw_response: providerResult.rawResponse,
        },
      })
      .eq("id", paymentId);
  }

  // 9. Update order status to awaiting_payment
  await adminDb
    .from("orders")
    .update({
      payment_provider: provider.name,
      payment_method: options.paymentMethod,
      status: order.status === "pending" ? "awaiting_payment" : order.status,
    })
    .eq("id", order.id);

  return {
    ...providerResult,
    paymentId,
  };
}

/**
 * Server-Side Webhook Handler
 * Idempotent, secure verification and state transitions.
 */
export async function processWebhook(
  providerName: string | null,
  req: Request,
  rawBody: string
): Promise<{ success: boolean; message: string; statusCode: number }> {
  const provider = getPaymentProvider(providerName);

  // 1. Verify signature and authenticity
  const verification: WebhookVerificationResult = await provider.verifyWebhook(
    req,
    rawBody
  );

  if (!verification.isValid) {
    console.warn(`Webhook verification failed for provider: ${provider.name}`, verification.errorMessage);
    return {
      success: false,
      message: verification.errorMessage || "Unauthorized webhook signature.",
      statusCode: 401,
    };
  }

  const adminDb = createAdminClient();

  // 2. Locate target payment and/or order
  let paymentRecord: PaymentRecord | null = null;
  let orderRecord: any = null;

  if (verification.paymentId) {
    const { data } = await adminDb
      .from("payments")
      .select("*")
      .eq("id", verification.paymentId)
      .single();
    paymentRecord = data;
  }

  if (!paymentRecord && verification.providerPaymentId) {
    const { data } = await adminDb
      .from("payments")
      .select("*")
      .eq("provider_payment_id", verification.providerPaymentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    paymentRecord = data;
  }

  if (!paymentRecord && verification.providerReference) {
    const { data } = await adminDb
      .from("payments")
      .select("*")
      .eq("provider_reference", verification.providerReference)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    paymentRecord = data;
  }

  // Find order
  if (paymentRecord?.order_id) {
    const { data } = await adminDb
      .from("orders")
      .select("*")
      .eq("id", paymentRecord.order_id)
      .single();
    orderRecord = data;
  } else if (verification.orderNumber) {
    const { data } = await adminDb
      .from("orders")
      .select("*")
      .eq("order_number", verification.orderNumber)
      .single();
    orderRecord = data;
  }

  if (!orderRecord && !paymentRecord) {
    console.warn("Webhook received for unknown order/payment reference:", verification);
    return {
      success: false,
      message: "Order or payment record not found.",
      statusCode: 404,
    };
  }

  // 3. Idempotency Check:
  // If payment is already marked as paid and the event is 'paid', return 200 OK harmlessly
  if (paymentRecord?.status === "paid" && verification.status === "paid") {
    return {
      success: true,
      message: "Event already processed (Idempotent OK).",
      statusCode: 200,
    };
  }

  const now = new Date().toISOString();

  // 4. Update Payment Record
  if (paymentRecord) {
    const updates: Record<string, any> = {
      status: verification.status,
      updated_at: now,
    };

    if (verification.status === "paid") {
      updates.paid_at = verification.paidAt || now;
    } else if (verification.status === "failed") {
      updates.failed_at = now;
    } else if (verification.status === "refunded") {
      updates.refunded_at = now;
    }

    if (verification.providerPaymentId) {
      updates.provider_payment_id = verification.providerPaymentId;
    }
    if (verification.providerReference) {
      updates.provider_reference = verification.providerReference;
    }

    await adminDb.from("payments").update(updates).eq("id", paymentRecord.id);
  }

  // 5. Controlled State Transition for Order:
  // Payment Status != Order Status.
  // When payment is PAID -> Order transitions to 'processing' (Fulfillment determines 'completed').
  if (orderRecord) {
    if (verification.status === "paid") {
      await adminDb
        .from("orders")
        .update({
          status: "processing", // Controlled transition
          payment_reference: verification.providerReference || verification.providerPaymentId || orderRecord.payment_reference,
          updated_at: now,
        })
        .eq("id", orderRecord.id);
    } else if (verification.status === "refunded") {
      await adminDb
        .from("orders")
        .update({
          status: "refunded",
          updated_at: now,
        })
        .eq("id", orderRecord.id);
    } else if (verification.status === "failed" && orderRecord.status === "awaiting_payment") {
      // Keep order awaiting payment so customer can retry
    }
  }

  return {
    success: true,
    message: `Payment status updated to ${verification.status}`,
    statusCode: 200,
  };
}

/**
 * Fetch all payment attempts for an order
 */
export async function getPaymentsForOrder(orderId: string): Promise<PaymentRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Could not fetch payments (may be pending migration):", error.message);
    return [];
  }

  return data || [];
}
