// src/services/categories.ts
import { api } from "@/lib/axios";
// import type {
//   Category,
//   CreateCategoryDto,
//   UpdateCategoryDto,
// } from "@/modules/categories/types";
import type { ApiResponse } from "@/lib/types";

export const categoriesApi = {
  // Lấy danh sách phẳng
  getCategories: async () => {
    const response = await api.get<ApiResponse<any[]>>("/shop/categories");
    return response.data; // Trả về toàn bộ object ApiResponse hoặc response.data.data tùy backend
  },

  // Lấy danh sách dạng cây (phân cấp)
  getCategoriesTree: async () => {
    const response = await api.get<ApiResponse<any[]>>("/shop/categories/tree");
    return response.data;
  },

  getCategoriesById: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/shop/categories/${id}`);
    return response.data;
  },

  getCategoriesBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/shop/categories/slug/${slug}`,
    );
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await api.post<ApiResponse<any>>("/shop/categories", data);
    return response.data;
  },

  updateCategory: async (id: string, data: any) => {
    const response = await api.put<ApiResponse<any>>(
      `/shop/categories/${id}`,
      data,
    );
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(
      `/shop/categories/${id}`,
    );
    return response.data;
  },
};
