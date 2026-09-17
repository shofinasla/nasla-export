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

export class XenditPaymentProvider implements PaymentProvider {
  readonly name: PaymentProviderName = "xendit";
  readonly displayName = "Xendit Indonesia & Southeast Asia";

  private getSecretKey(): string | undefined {
    return process.env.XENDIT_SECRET_KEY;
  }

  private getWebhookToken(): string | undefined {
    return process.env.XENDIT_WEBHOOK_TOKEN;
  }

  isConfigured(): boolean {
    return Boolean(this.getSecretKey());
  }

  getSupportedMethods(): PaymentMethodOption[] {
    return AVAILABLE_PAYMENT_METHODS.filter(
      (m) => m.region === "indonesia" || m.region === "all"
    );
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const secretKey = this.getSecretKey();

    // If real credentials are not set in environment, return a clean configuration-ready result
    if (!secretKey) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.naslaexport.com";
      const fallbackUrl = `${siteUrl}/account/orders/${encodeURIComponent(params.orderNumber)}?payment_provider=xendit`;

      return {
        success: true,
        provider: this.name,
        providerPaymentId: `xen_mock_${Date.now()}_${params.orderNumber}`,
        providerReference: `INV-${params.orderNumber}`,
        paymentUrl: fallbackUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: {
          bankName: "Xendit Virtual Gateway",
          accountName: "PT Nasla Ekspor Global",
          instructionsText:
            "Integrasi Xendit Gateway siap digunakan setelah XENDIT_SECRET_KEY diatur di konfigurasi server.",
        },
        rawResponse: {
          status: "READY_FOR_CREDENTIALS",
          message: "Xendit adapter ready. Configure XENDIT_SECRET_KEY in server environment.",
        },
      };
    }

    try {
      const authHeader = Buffer.from(`${secretKey}:`).toString("base64");
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.naslaexport.com";

      const payload = {
        external_id: `NEX-PAY-${params.orderNumber}-${Date.now()}`,
        amount: Number(params.amount),
        currency: params.currency || "IDR",
        description: `Order ${params.orderNumber} - NASLA EXPORT`,
        payer_email: params.customer.email,
        customer: {
          given_names: params.customer.fullName || params.customer.email.split("@")[0],
          email: params.customer.email,
          mobile_number: params.customer.phone || undefined,
        },
        items: params.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.unitPrice),
          category: item.itemType || "Digital",
        })),
        success_redirect_url:
          params.successUrl ||
          `${siteUrl}/account/orders/${encodeURIComponent(params.orderNumber)}`,
        failure_redirect_url:
          params.cancelUrl ||
          `${siteUrl}/account/orders/${encodeURIComponent(params.orderNumber)}`,
        invoice_duration: 86400, // 24 hours in seconds
        metadata: {
          order_id: params.orderId,
          order_number: params.orderNumber,
          customer_id: params.customer.id,
          ...(params.metadata || {}),
        },
      };

      const response = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Xendit API error:", data);
        return {
          success: false,
          provider: this.name,
          errorMessage: data.message || "Gagal membuat invoice Xendit.",
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: this.name,
        providerPaymentId: data.id,
        providerReference: data.external_id,
        paymentUrl: data.invoice_url,
        expiresAt: data.expiry_date,
        instructions: {
          bankName: "Xendit Multi-Channel",
          instructionsText: "Selesaikan pembayaran melalui halaman pembayaran resmi Xendit.",
        },
        rawResponse: data,
      };
    } catch (err: any) {
      console.error("Xendit payment creation exception:", err);
      return {
        success: false,
        provider: this.name,
        errorMessage: err.message || "Terjadi kesalahan jaringan saat menghubungi gateway pembayaran.",
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
    if (!secretKey) {
      return { status: "pending", amount: 0 };
    }

    try {
      const authHeader = Buffer.from(`${secretKey}:`).toString("base64");
      const response = await fetch(
        `https://api.xendit.co/v2/invoices/${encodeURIComponent(providerPaymentId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${authHeader}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return { status: "failed", amount: 0, raw: data };
      }

      const statusMap: Record<string, PaymentStatus> = {
        PAID: "paid",
        SETTLED: "paid",
        PENDING: "pending",
        EXPIRED: "expired",
      };

      return {
        status: statusMap[data.status] || "pending",
        amount: Number(data.amount) || 0,
        paidAt: data.paid_at,
        raw: data,
      };
    } catch (err) {
      console.error("Xendit getPayment error:", err);
      return { status: "pending", amount: 0 };
    }
  }

  async verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerificationResult> {
    const callbackToken = req.headers.get("x-callback-token");
    const configuredToken = this.getWebhookToken();

    // Verify token if configured
    if (configuredToken && callbackToken !== configuredToken) {
      return {
        isValid: false,
        provider: this.name,
        status: "failed",
        errorMessage: "Invalid Xendit callback token signature.",
      };
    }

    try {
      const payload = JSON.parse(rawBody);

      const statusRaw = payload.status?.toUpperCase();
      let status: PaymentStatus = "pending";

      if (statusRaw === "PAID" || statusRaw === "SETTLED") {
        status = "paid";
      } else if (statusRaw === "EXPIRED") {
        status = "expired";
      } else if (statusRaw === "FAILED") {
        status = "failed";
      }

      const orderNumber =
        payload.metadata?.order_number ||
        payload.external_id?.replace(/^NEX-PAY-/, "").split("-")[0];

      return {
        isValid: true,
        provider: this.name,
        providerPaymentId: payload.id,
        providerReference: payload.external_id,
        orderNumber,
        paymentId: payload.metadata?.payment_id,
        status,
        amount: Number(payload.amount || payload.paid_amount) || undefined,
        currency: payload.currency || "IDR",
        paidAt: payload.paid_at || new Date().toISOString(),
        rawEvent: payload,
      };
    } catch (err: any) {
      return {
        isValid: false,
        provider: this.name,
        status: "failed",
        errorMessage: `Failed to parse Xendit webhook payload: ${err.message}`,
      };
    }
  }
}
