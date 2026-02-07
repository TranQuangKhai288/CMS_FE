import { api } from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";
import type {
  Product,
  ProductListResponse,
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
} from "../modules/products/types";

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
