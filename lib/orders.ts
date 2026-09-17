import { OrderStatus } from "@/lib/types";

export function formatIDR(amount: number | string | null | undefined): string {
  const num = typeof amount === "number" ? amount : Number(amount || 0);
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export const ORDER_STATUSES: {
  value: OrderStatus;
  label: string;
  variant: "warning" | "info" | "success" | "danger" | "default";
  description: string;
}[] = [
  {
    value: "pending",
    label: "Pending",
    variant: "warning",
    description: "Menunggu pembayaran atau konfirmasi",
  },
  {
    value: "awaiting_payment",
    label: "Awaiting Payment",
    variant: "warning",
    description: "Menunggu pembayaran dari pelanggan",
  },
  {
    value: "paid",
    label: "Paid",
    variant: "info",
    description: "Pembayaran telah terverifikasi",
  },
  {
    value: "processing",
    label: "Processing",
    variant: "info",
    description: "Pesanan sedang diproses / disiapkan",
  },
  {
    value: "completed",
    label: "Completed",
    variant: "success",
    description: "Pesanan telah selesai / terpenuhi",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    variant: "danger",
    description: "Pesanan dibatalkan",
  },
  {
    value: "refunded",
    label: "Refunded",
    variant: "default",
    description: "Dana pesanan dikembalikan",
  },
];

export function getOrderStatusConfig(status: string) {
  const normalized = status?.toLowerCase() as OrderStatus;
  const match = ORDER_STATUSES.find((s) => s.value === normalized);
  if (match) return match;
  return {
    value: normalized,
    label: status || "Unknown",
    variant: "default" as const,
    description: "",
  };
}

export async function generateOrderNumber(supabase: any): Promise<string> {
  try {
    const { data, error } = await supabase.rpc("generate_order_number");
    if (!error && data) {
      return String(data);
    }
  } catch (err) {
    console.warn("generate_order_number RPC not available or failed:", err);
  }

  // Safe server-side fallback generator: NEX-YYYYMMDD-XXXX
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Use a random 4-digit hex/decimal code + millisecond component
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `NEX-${dateStr}-${randomSuffix}`;
}
