import crypto from "crypto";
import {
  PaymentProvider,
  PaymentProviderName,
  CreatePaymentParams,
  CreatePaymentResult,
  WebhookVerificationResult,
  PaymentMethodOption,
  PaymentStatus,
  AVAILABLE_PAYMENT_METHODS,
} from "../types";

export class StripePaymentProvider implements PaymentProvider {
  readonly name: PaymentProviderName = "stripe";
  readonly displayName = "Stripe Global & International Cards";

  private getSecretKey(): string | undefined {
    return process.env.STRIPE_SECRET_KEY;
  }

  private getWebhookSecret(): string | undefined {
    return process.env.STRIPE_WEBHOOK_SECRET;
  }

  isConfigured(): boolean {
    return Boolean(this.getSecretKey());
  }

  getSupportedMethods(): PaymentMethodOption[] {
    return AVAILABLE_PAYMENT_METHODS.filter((m) => m.category === "card");
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const secretKey = this.getSecretKey();

    if (!secretKey) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.naslaexport.com";
      return {
        success: true,
        provider: this.name,
        providerPaymentId: `cs_mock_${Date.now()}_${params.orderNumber}`,
        providerReference: `STRIPE-${params.orderNumber}`,
        paymentUrl: `${siteUrl}/account/orders/${encodeURIComponent(params.orderNumber)}?payment_provider=stripe`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: {
          bankName: "Stripe International Checkout",
          accountName: "PT Nasla Ekspor Global",
          instructionsText:
            "Integrasi Stripe International siap digunakan setelah STRIPE_SECRET_KEY diatur di konfigurasi server.",
        },
        rawResponse: {
          status: "READY_FOR_CREDENTIALS",
          message: "Stripe adapter ready. Configure STRIPE_SECRET_KEY in server environment.",
        },
      };
    }

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.naslaexport.com";
      const currency = (params.currency || "idr").toLowerCase();

      // For Stripe, zero-decimal currencies (like IDR) take the exact integer, currencies like USD take cents.
      const isZeroDecimal = currency === "idr" || currency === "jpy";
      const unitAmount = isZeroDecimal
        ? Math.round(params.amount)
        : Math.round(params.amount * 100);

      const bodyParams = new URLSearchParams();
      bodyParams.append("mode", "payment");
      bodyParams.append(
        "success_url",
        params.successUrl ||
          `${siteUrl}/account/orders/${encodeURIComponent(params.orderNumber)}?stripe_status=success`
      );
      bodyParams.append(
        "cancel_url",
        params.cancelUrl ||
          `${siteUrl}/account/orders/${encodeURIComponent(params.orderNumber)}?stripe_status=cancel`
      );
      bodyParams.append("client_reference_id", params.orderNumber);
      bodyParams.append("customer_email", params.customer.email);
      bodyParams.append("metadata[order_id]", params.orderId);
      bodyParams.append("metadata[order_number]", params.orderNumber);
      bodyParams.append("metadata[customer_id]", params.customer.id);

      // Line items
      bodyParams.append("line_items[0][price_data][currency]", currency);
      bodyParams.append(
        "line_items[0][price_data][product_data][name]",
        params.items[0]?.name || `Order ${params.orderNumber}`
      );
      bodyParams.append(
        "line_items[0][price_data][unit_amount]",
        String(unitAmount)
      );
      bodyParams.append("line_items[0][quantity]", "1");

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Stripe Checkout error:", data);
        return {
          success: false,
          provider: this.name,
          errorMessage: data.error?.message || "Gagal membuat sesi pembayaran Stripe.",
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: this.name,
        providerPaymentId: data.id,
        providerReference: data.payment_intent || data.id,
        paymentUrl: data.url,
        expiresAt: data.expires_at
          ? new Date(data.expires_at * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: {
          bankName: "Stripe International Checkout",
          instructionsText: "Selesaikan pembayaran kartu melalui formulir aman Stripe.",
        },
        rawResponse: data,
      };
    } catch (err: any) {
      console.error("Stripe exception:", err);
      return {
        success: false,
        provider: this.name,
        errorMessage: err.message || "Gagal menghubungkan ke gateway Stripe.",
      };
    }
  }

  async getPayment(providerPaymentId: string): Promise<{
    status: PaymentStatus;
    amount: number;
    paidAt?: string;
    raw?: any;
  }> {
    const secretKey = this.getSecretKey();
    if (!secretKey) return { status: "pending", amount: 0 };

    try {
      const response = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(providerPaymentId)}`,
        {
          headers: { Authorization: `Bearer ${secretKey}` },
        }
      );

      const data = await response.json();
      if (!response.ok) return { status: "pending", amount: 0, raw: data };

      let status: PaymentStatus = "pending";
      if (data.payment_status === "paid") {
        status = "paid";
      } else if (data.status === "expired") {
        status = "expired";
      }

      return {
        status,
        amount: Number(data.amount_total) || 0,
        raw: data,
      };
    } catch (err) {
      console.error("Stripe getPayment error:", err);
      return { status: "pending", amount: 0 };
    }
  }

  async verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerificationResult> {
    const webhookSecret = this.getWebhookSecret();
    const sigHeader = req.headers.get("stripe-signature");

    if (webhookSecret && sigHeader) {
      try {
        const items = sigHeader.split(",").reduce((acc: any, part: string) => {
          const [k, v] = part.split("=");
          if (k && v) acc[k.trim()] = v.trim();
          return acc;
        }, {});

        const timestamp = items.t;
        const signature = items.v1;

        if (!timestamp || !signature) {
          return {
            isValid: false,
            provider: this.name,
            status: "failed",
            errorMessage: "Invalid Stripe signature header components.",
          };
        }

        const signedPayload = `${timestamp}.${rawBody}`;
        const hmac = crypto
          .createHmac("sha256", webhookSecret)
          .update(signedPayload)
          .digest("hex");

        if (hmac !== signature) {
          return {
            isValid: false,
            provider: this.name,
            status: "failed",
            errorMessage: "Stripe webhook signature mismatch.",
          };
        }
      } catch (e: any) {
        return {
          isValid: false,
          provider: this.name,
          status: "failed",
          errorMessage: `Stripe signature verification failed: ${e.message}`,
        };
      }
    }

    try {
      const event = JSON.parse(rawBody);
      const eventType = event.type;
      const dataObj = event.data?.object || {};

      let status: PaymentStatus = "pending";
      if (
        eventType === "checkout.session.completed" ||
        eventType === "payment_intent.succeeded"
      ) {
        status = "paid";
      } else if (eventType === "payment_intent.payment_failed") {
        status = "failed";
      } else if (eventType === "charge.refunded") {
        status = "refunded";
      }

      const orderNumber =
        dataObj.metadata?.order_number || dataObj.client_reference_id;

      return {
        isValid: true,
        provider: this.name,
        providerPaymentId: dataObj.id,
        providerReference: dataObj.payment_intent || dataObj.id,
        orderNumber,
        paymentId: dataObj.metadata?.payment_id,
        status,
        amount: dataObj.amount_total || dataObj.amount,
        currency: (dataObj.currency || "IDR").toUpperCase(),
        paidAt: new Date().toISOString(),
        rawEvent: event,
      };
    } catch (err: any) {
      return {
        isValid: false,
        provider: this.name,
        status: "failed",
        errorMessage: `Failed to parse Stripe webhook: ${err.message}`,
      };
    }
  }
}
