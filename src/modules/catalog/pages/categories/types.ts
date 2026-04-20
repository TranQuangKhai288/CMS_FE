import type { ApiResponse } from "@/lib/types";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  level?: number;
  order?: number;
  image?: string;
  isActive?: boolean;
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
  children?: Category[];
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  order?: number;
  image?: string;
  isActive?: boolean;
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  order?: number;
  image?: string;
  isActive?: boolean;
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
}

export type CategoryListResponse = ApiResponse<Category[]>;
export type CategoryResponse = ApiResponse<Category>;
export { type ApiResponse };
