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

export class MidtransPaymentProvider implements PaymentProvider {
  readonly name: PaymentProviderName = "midtrans";
  readonly displayName = "Midtrans Payment Gateway (Snap / Core API)";

  private getServerKey(): string | undefined {
    return process.env.MIDTRANS_SERVER_KEY;
  }

  private isSandbox(): boolean {
    return process.env.PAYMENT_SANDBOX_MODE !== "false";
  }

  private getBaseUrl(): string {
    return this.isSandbox()
      ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
      : "https://app.midtrans.com/snap/v1/transactions";
  }

  isConfigured(): boolean {
    return Boolean(this.getServerKey());
  }

  getSupportedMethods(): PaymentMethodOption[] {
    return AVAILABLE_PAYMENT_METHODS.filter(
      (m) => m.region === "indonesia" || m.region === "all"
    );
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const serverKey = this.getServerKey();

    if (!serverKey) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.naslaexport.com";
      return {
        success: true,
        provider: this.name,
        providerPaymentId: `mid_mock_${Date.now()}_${params.orderNumber}`,
        providerReference: `SNAP-${params.orderNumber}`,
        paymentUrl: `${siteUrl}/account/orders/${encodeURIComponent(params.orderNumber)}?payment_provider=midtrans`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: {
          bankName: "Midtrans Snap Gateway",
          accountName: "PT Nasla Ekspor Global",
          instructionsText:
            "Integrasi Midtrans Gateway siap digunakan setelah MIDTRANS_SERVER_KEY diatur di konfigurasi server.",
        },
        rawResponse: {
          status: "READY_FOR_CREDENTIALS",
          message: "Midtrans adapter ready. Configure MIDTRANS_SERVER_KEY in server environment.",
        },
      };
    }

    try {
      const authHeader = Buffer.from(`${serverKey}:`).toString("base64");
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.naslaexport.com";

      const payload = {
        transaction_details: {
          order_id: `NEX-MID-${params.orderNumber}-${Date.now()}`,
          gross_amount: Math.round(Number(params.amount)),
        },
        customer_details: {
          first_name: params.customer.fullName || params.customer.email.split("@")[0],
          email: params.customer.email,
          phone: params.customer.phone || undefined,
        },
        item_details: params.items.map((item) => ({
          id: item.slug || "TPL",
          price: Math.round(Number(item.unitPrice)),
          quantity: item.quantity,
          name: item.name.substring(0, 50),
        })),
        callbacks: {
          finish: `${siteUrl}/account/orders/${encodeURIComponent(params.orderNumber)}`,
        },
        custom_field1: params.orderNumber,
        custom_field2: params.orderId,
      };

      const response = await fetch(this.getBaseUrl(), {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        console.error("Midtrans Snap API error:", data);
        return {
          success: false,
          provider: this.name,
          errorMessage: data.error_messages?.join(", ") || "Gagal membuat transaksi Midtrans.",
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: this.name,
        providerPaymentId: data.token,
        providerReference: payload.transaction_details.order_id,
        paymentUrl: data.redirect_url,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: {
          bankName: "Midtrans Multi-Payment",
          instructionsText: "Selesaikan transaksi melalui form pembayaran Midtrans Snap.",
        },
        rawResponse: data,
      };
    } catch (err: any) {
      console.error("Midtrans exception:", err);
      return {
        success: false,
        provider: this.name,
        errorMessage: err.message || "Gagal menghubungkan ke gateway Midtrans.",
      };
    }
  }

  async getPayment(providerPaymentId: string): Promise<{
    status: PaymentStatus;
    amount: number;
    paidAt?: string;
    raw?: any;
  }> {
    const serverKey = this.getServerKey();
    if (!serverKey) return { status: "pending", amount: 0 };

    try {
      const authHeader = Buffer.from(`${serverKey}:`).toString("base64");
      const statusUrl = this.isSandbox()
        ? `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(providerPaymentId)}/status`
        : `https://api.midtrans.com/v2/${encodeURIComponent(providerPaymentId)}/status`;

      const response = await fetch(statusUrl, {
        headers: { Authorization: `Basic ${authHeader}` },
      });

      const data = await response.json();
      if (!response.ok) return { status: "pending", amount: 0, raw: data };

      let status: PaymentStatus = "pending";
      const txStatus = data.transaction_status;
      const fraudStatus = data.fraud_status;

      if (txStatus === "capture") {
        status = fraudStatus === "accept" ? "paid" : "processing";
      } else if (txStatus === "settlement") {
        status = "paid";
      } else if (txStatus === "pending") {
        status = "pending";
      } else if (txStatus === "deny" || txStatus === "cancel") {
        status = "cancelled";
      } else if (txStatus === "expire") {
        status = "expired";
      } else if (txStatus === "refund") {
        status = "refunded";
      }

      return {
        status,
        amount: Number(data.gross_amount) || 0,
        paidAt: data.settlement_time,
        raw: data,
      };
    } catch (err) {
      console.error("Midtrans getPayment error:", err);
      return { status: "pending", amount: 0 };
    }
  }

  async verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerificationResult> {
    try {
      const payload = JSON.parse(rawBody);
      const serverKey = this.getServerKey();

      if (serverKey && payload.signature_key) {
        // Midtrans signature: SHA512(order_id + status_code + gross_amount + ServerKey)
        const signatureSource = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
        const calculatedSignature = crypto
          .createHash("sha512")
          .update(signatureSource)
          .digest("hex");

        if (calculatedSignature !== payload.signature_key) {
          return {
            isValid: false,
            provider: this.name,
            status: "failed",
            errorMessage: "Invalid Midtrans SHA512 signature.",
          };
        }
      }

      const txStatus = payload.transaction_status;
      const fraudStatus = payload.fraud_status;
      let status: PaymentStatus = "pending";

      if (txStatus === "capture") {
        status = fraudStatus === "accept" ? "paid" : "processing";
      } else if (txStatus === "settlement") {
        status = "paid";
      } else if (txStatus === "pending") {
        status = "pending";
      } else if (txStatus === "deny" || txStatus === "cancel") {
        status = "cancelled";
      } else if (txStatus === "expire") {
        status = "expired";
      } else if (txStatus === "refund") {
        status = "refunded";
      }

      const orderNumber =
        payload.custom_field1 ||
        payload.order_id?.replace(/^NEX-MID-/, "").split("-")[0];

      return {
        isValid: true,
        provider: this.name,
        providerPaymentId: payload.transaction_id || payload.order_id,
        providerReference: payload.order_id,
        orderNumber,
        status,
        amount: Number(payload.gross_amount) || undefined,
        currency: payload.currency || "IDR",
        paidAt: payload.settlement_time || new Date().toISOString(),
        rawEvent: payload,
      };
    } catch (err: any) {
      return {
        isValid: false,
        provider: this.name,
        status: "failed",
        errorMessage: `Failed to parse Midtrans webhook: ${err.message}`,
      };
    }
  }
}
