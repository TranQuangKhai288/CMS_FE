import type { ApiResponse } from "@/lib/types";

export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string;
  name?: string;
  attributes?: any;
  price?: number;
  stock?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  order?: number;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  shortDesc?: string;
  categoryId?: string;
  attributes?: any; // jsonb
  basePrice?: number;
  salePrice?: number;
  costPrice?: number;
  stock?: number;
  lowStock?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "OUT_OF_STOCK";
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface CreateProductDto {
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  shortDesc?: string;
  categoryId?: string;
  attributes?: any;
  basePrice?: number;
  salePrice?: number;
  costPrice?: number;
  stock?: number;
  lowStock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  shortDesc?: string;
  categoryId?: string;
  attributes?: any;
  basePrice?: number;
  salePrice?: number;
  costPrice?: number;
  stock?: number;
  lowStock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export type ProductListResponse = ApiResponse<Product[]>;
export type ProductResponse = ApiResponse<Product>;
export { type ApiResponse };
