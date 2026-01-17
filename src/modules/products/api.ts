import { api } from "@/lib/axios";
import type {
  ApiResponse,
  Product,
  ProductListResponse,
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
} from "./types";

export const productsApi = {
  // Lấy danh sách users với phân trang và tìm kiếm
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search: string | "";
    role?: string;
    isActive?: boolean;
  }) => {
    const { limit, ...rest } = params || {};
    const queryParams = {
      ...rest,
      pageSize: limit,
    };
    const response = await api.get<ProductListResponse>("/shop/products", {
      params: queryParams,
    });
    return response.data;
  },

  // Lấy chi tiết 1 product
  getProduct: async (id: string) => {
    const response = await api.get<ProductResponse>(`/shop/products/${id}`);
    return response.data;
  },

  // Tạo product mới
  createProduct: async (data: CreateProductDto) => {
    const response = await api.post<ProductResponse>("/shop/products", data);
    return response.data;
  },

  // Cập nhật product
  updateProduct: async (id: string, data: UpdateProductDto) => {
    const response = await api.put<ProductResponse>(
      `/shop/products/${id}`,
      data,
    );
    return response.data;
  },

  // Xóa product
  deleteProduct: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(
      `/shop/products/${id}`,
    );
    return response.data;
  },

  // Toggle trạng thái active
  toggleProductStatus: async (id: string) => {
    const response = await api.patch<ProductResponse>(
      `/shop/products/${id}/toggle-status`,
    );
    return response.data;
  },
};

export const categoriesApi = {
  // Lấy danh sách categories
  getCategories: async () => {
    const response = await api.get<ApiResponse<any[]>>("/shop/categories");
    return response.data;
  },
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
