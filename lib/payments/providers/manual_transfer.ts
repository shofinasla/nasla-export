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

export class ManualTransferPaymentProvider implements PaymentProvider {
  readonly name: PaymentProviderName = "manual_transfer";
  readonly displayName = "Transfer Bank Manual & Invoice Nasla";

  isConfigured(): boolean {
    return true; // Always available as fallback
  }

  getSupportedMethods(): PaymentMethodOption[] {
    return AVAILABLE_PAYMENT_METHODS.filter(
      (m) => m.category === "bank_transfer"
    );
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.naslaexport.com";

    return {
      success: true,
      provider: this.name,
      providerPaymentId: `man_${Date.now()}_${params.orderNumber}`,
      providerReference: `TF-${params.orderNumber}`,
      paymentUrl: `${siteUrl}/account/orders/${encodeURIComponent(params.orderNumber)}`,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      instructions: {
        bankName: "Bank Central Asia (BCA)",
        accountName: "PT Nasla Ekspor Global",
        accountNumber: "873-501-9922",
        instructionsText:
          "Transfer tepat sesuai nominal tagihan ke rekening resmi PT Nasla Ekspor Global dan simpan bukti transfer Anda.",
      },
    };
  }

  async getPayment(providerPaymentId: string): Promise<{
    status: PaymentStatus;
    amount: number;
  }> {
    return {
      status: "pending",
      amount: 0,
    };
  }

  async verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerificationResult> {
    return {
      isValid: false,
      provider: this.name,
      status: "failed",
      errorMessage: "Manual transfer does not use automatic inbound webhooks.",
    };
  }
}
