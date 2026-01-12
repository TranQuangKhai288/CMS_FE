import type { ApiResponse } from "@/lib/types";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  description?: string;
}

export interface UpdateProductDto {
  name?: string;
  firstName?: string;
  lastName?: string;
  price?: number;
  isActive?: boolean;
}

export type ProductListResponse = ApiResponse<Product[]>;
export type ProductResponse = ApiResponse<Product>;
export { type ApiResponse };
