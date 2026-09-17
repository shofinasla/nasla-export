export type Role = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

export type OrderItemType =
  | "template"
  | "domain"
  | "service"
  | "website"
  | "export";

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: OrderItemType;
  item_id?: string | null;
  product_id?: string | null;
  name: string;
  slug?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id?: string | null;
  provider_reference?: string | null;
  payment_method: string;
  payment_channel?: string | null;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "paid" | "failed" | "expired" | "cancelled" | "refunded";
  payment_url?: string | null;
  expires_at?: string | null;
  paid_at?: string | null;
  failed_at?: string | null;
  refunded_at?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  payment_provider?: string | null;
  payment_reference?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    full_name?: string | null;
    email?: string | null;
    company?: string | null;
    phone?: string | null;
    country?: string | null;
  } | null;
  items?: OrderItem[];
  payments?: PaymentRecord[];
}
