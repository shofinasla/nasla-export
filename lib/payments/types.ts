export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded";

export type PaymentMethodCategory =
  | "qris"
  | "virtual_account"
  | "bank_transfer"
  | "ewallet"
  | "card"
  | "paylater"
  | "direct_debit"
  | "other";

export type PaymentProviderName =
  | "xendit"
  | "midtrans"
  | "stripe"
  | "manual_transfer";

export interface PaymentRecord {
  id: string;
  order_id: string;
  provider: PaymentProviderName | string;
  provider_payment_id?: string | null;
  provider_reference?: string | null;
  payment_method: PaymentMethodCategory | string;
  payment_channel?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_url?: string | null;
  expires_at?: string | null;
  paid_at?: string | null;
  failed_at?: string | null;
  refunded_at?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CustomerPaymentInfo {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  company?: string | null;
  country?: string | null;
}

export interface PaymentItemDetail {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  slug?: string | null;
  itemType?: string;
}

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customer: CustomerPaymentInfo;
  method: PaymentMethodCategory;
  channel?: string | null;
  items: PaymentItemDetail[];
  notes?: string | null;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInstructions {
  qrString?: string;
  qrImageUrl?: string;
  vaNumber?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  deepLink?: string;
  instructionsText?: string;
}

export interface CreatePaymentResult {
  success: boolean;
  provider: string;
  providerPaymentId?: string;
  providerReference?: string;
  paymentUrl?: string;
  instructions?: PaymentInstructions;
  expiresAt?: string;
  rawResponse?: any;
  errorMessage?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  provider: string;
  providerPaymentId?: string;
  providerReference?: string;
  orderNumber?: string;
  paymentId?: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  paidAt?: string;
  rawEvent?: any;
  errorMessage?: string;
}

export interface PaymentMethodOption {
  id: string;
  category: PaymentMethodCategory;
  name: string;
  description: string;
  region: "indonesia" | "international" | "all";
  channels: {
    code: string;
    name: string;
    icon?: string;
  }[];
  isAvailable: boolean;
  badge?: string;
  settlementCurrency: string; // e.g. "IDR" or "USD"
  displayCurrencies: string[]; // ["IDR", "USD", "EUR", "SGD"]
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  readonly displayName: string;

  isConfigured(): boolean;
  getSupportedMethods(): PaymentMethodOption[];
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  getPayment(providerPaymentId: string): Promise<{
    status: PaymentStatus;
    amount: number;
    paidAt?: string;
    raw?: any;
  }>;
  verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerificationResult>;
  cancelPayment?(providerPaymentId: string): Promise<boolean>;
  refundPayment?(
    providerPaymentId: string,
    amount: number,
    reason?: string
  ): Promise<{ success: boolean; refundId?: string; errorMessage?: string }>;
}

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    variant: "warning" | "info" | "success" | "danger" | "default";
    description: string;
  }
> = {
  pending: {
    label: "Menunggu Pembayaran",
    variant: "warning",
    description: "Instruksi pembayaran telah dibuat dan menunggu pembayaran.",
  },
  processing: {
    label: "Sedang Diverifikasi",
    variant: "info",
    description: "Pembayaran dalam proses verifikasi sistem/gateway.",
  },
  paid: {
    label: "Lunas / Terverifikasi",
    variant: "success",
    description: "Pembayaran telah berhasil diterima dan divalidasi.",
  },
  failed: {
    label: "Pembayaran Gagal",
    variant: "danger",
    description: "Transaksi pembayaran gagal atau ditolak gateway.",
  },
  expired: {
    label: "Kedaluwarsa",
    variant: "danger",
    description: "Batas waktu pembayaran telah habis.",
  },
  cancelled: {
    label: "Dibatalkan",
    variant: "default",
    description: "Pembayaran dibatalkan oleh pengguna atau admin.",
  },
  refunded: {
    label: "Dikembalikan (Refund)",
    variant: "default",
    description: "Dana pembayaran telah dikembalikan ke pelanggan.",
  },
};

export const AVAILABLE_PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "id_qris",
    category: "qris",
    name: "QRIS (Semua Pembayaran)",
    description: "Scan instan dengan GoPay, OVO, DANA, BCA, ShopeePay, LinkAja, & Mobile Banking.",
    region: "indonesia",
    isAvailable: true,
    badge: "Instan & Populer",
    settlementCurrency: "IDR",
    displayCurrencies: ["IDR"],
    channels: [
      { code: "qris_gopay", name: "GoPay" },
      { code: "qris_ovo", name: "OVO" },
      { code: "qris_dana", name: "DANA" },
      { code: "qris_bca", name: "BCA QRIS" },
      { code: "qris_shopeepay", name: "ShopeePay" },
    ],
  },
  {
    id: "id_va",
    category: "virtual_account",
    name: "Virtual Account (Bank Transfer Otomatis)",
    description: "Nomor rekening virtual unik dengan konfirmasi pembayaran otomatis real-time.",
    region: "indonesia",
    isAvailable: true,
    badge: "Otomatis 24 Jam",
    settlementCurrency: "IDR",
    displayCurrencies: ["IDR"],
    channels: [
      { code: "bca_va", name: "BCA Virtual Account" },
      { code: "mandiri_va", name: "Mandiri Virtual Account" },
      { code: "bni_va", name: "BNI Virtual Account" },
      { code: "bri_va", name: "BRI Virtual Account" },
      { code: "permata_va", name: "Permata Virtual Account" },
    ],
  },
  {
    id: "id_ewallet",
    category: "ewallet",
    name: "E-Wallet Indonesia",
    description: "Pembayaran langsung via aplikasi dompet digital terpopuler di Indonesia.",
    region: "indonesia",
    isAvailable: true,
    settlementCurrency: "IDR",
    displayCurrencies: ["IDR"],
    channels: [
      { code: "gopay", name: "GoPay" },
      { code: "ovo", name: "OVO" },
      { code: "dana", name: "DANA" },
      { code: "shopeepay", name: "ShopeePay" },
    ],
  },
  {
    id: "id_bank_transfer",
    category: "bank_transfer",
    name: "Transfer Bank Manual",
    description: "Transfer manual ke rekening resmi PT Nasla Ekspor Global.",
    region: "indonesia",
    isAvailable: true,
    settlementCurrency: "IDR",
    displayCurrencies: ["IDR"],
    channels: [
      { code: "manual_bca", name: "Bank Central Asia (BCA)" },
      { code: "manual_mandiri", name: "Bank Mandiri" },
    ],
  },
  {
    id: "int_card",
    category: "card",
    name: "Kartu Kredit & Debit Internasional",
    description: "Mendukung Visa, Mastercard, JCB, dan American Express dari seluruh dunia.",
    region: "all",
    isAvailable: true,
    badge: "Global / International",
    settlementCurrency: "IDR", // Note: Indonesian merchant settlement is in IDR
    displayCurrencies: ["IDR", "USD", "EUR", "SGD"],
    channels: [
      { code: "visa", name: "Visa" },
      { code: "mastercard", name: "Mastercard" },
      { code: "jcb", name: "JCB" },
      { code: "amex", name: "American Express" },
    ],
  },
];
