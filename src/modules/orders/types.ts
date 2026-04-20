import type { ApiResponse } from "@/lib/types";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  metadata?: any;
  createdAt?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  };
  variant?: {
    id: string;
    name?: string;
    sku?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  userId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;

  // Pricing
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;

  // Shipping info
  shippingAddress?: any;
  billingAddress?: any;
  trackingNumber?: string;

  notes?: string;
  metadata?: any;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  items?: OrderItem[];
}

export interface CreateOrderDto {
  customerId: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  shippingAddress: any;
  billingAddress?: any;
  paymentMethod?: string;
  discount?: number;
  tax?: number;
  shipping?: number;
  notes?: string;
}

export interface UpdateOrderDto {
  paymentMethod?: string;
  trackingNumber?: string;
  notes?: string;
}

export type OrderListResponse = ApiResponse<Order[]>;
export type OrderResponse = ApiResponse<Order>;
export { type ApiResponse };
