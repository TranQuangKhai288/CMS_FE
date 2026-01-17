import type { ApiResponse } from "@/lib/types";

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  name?: string;
  attributes?: any;
  price?: number;
  stock?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt?: string;
  order?: number;
  is_primary?: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  short_desc?: string;
  category_id?: string;
  attributes?: any; // jsonb
  base_price?: number;
  sale_price?: number;
  cost_price?: number;
  stock?: number;
  low_stock?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "OUT_OF_STOCK";
  is_active?: boolean;
  is_featured?: boolean;
  meta_title?: string;
  meta_desc?: string;
  meta_keywords?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface CreateProductDto {
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  short_desc?: string;
  category_id?: string;
  attributes?: any;
  base_price?: number;
  sale_price?: number;
  cost_price?: number;
  stock?: number;
  low_stock?: number;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  short_desc?: string;
  category_id?: string;
  attributes?: any;
  base_price?: number;
  sale_price?: number;
  cost_price?: number;
  stock?: number;
  low_stock?: number;
  is_active?: boolean;
  is_featured?: boolean;
}

export type ProductListResponse = ApiResponse<Product[]>;
export type ProductResponse = ApiResponse<Product>;
export { type ApiResponse };
