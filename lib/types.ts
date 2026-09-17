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
}
