import { api } from "@/lib/axios";
import type {
  UserListResponse,
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  ApiResponse,
} from "./types";

export const usersApi = {
  // Lấy danh sách users với phân trang và tìm kiếm
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) => {
    const { limit, ...rest } = params || {};
    const queryParams = {
      ...rest,
      pageSize: limit,
    };
    const response = await api.get<UserListResponse>("/admin/users", {
      params: queryParams,
    });
    return response.data;
  },

  // Lấy chi tiết 1 user
  getUser: async (id: string) => {
    const response = await api.get<UserResponse>(`/admin/users/${id}`);
    return response.data;
  },

  // Tạo user mới
  createUser: async (data: CreateUserDto) => {
    const response = await api.post<UserResponse>("/admin/users", data);
    return response.data;
  },

  // Cập nhật user
  updateUser: async (id: string, data: UpdateUserDto) => {
    const response = await api.put<UserResponse>(`/admin/users/${id}`, data);
    return response.data;
  },

  // Xóa user
  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/admin/users/${id}`);
    return response.data;
  },

  // Toggle trạng thái active
  toggleUserStatus: async (id: string) => {
    const response = await api.patch<UserResponse>(
      `/admin/users/${id}/toggle-status`
    );
    return response.data;
  },
};
