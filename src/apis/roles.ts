import { api } from "@/lib/axios";
import type { RoleListResponse, RoleResponse } from "../modules/roles/types";

export interface CreateRoleDto {
  name: string;
  slug?: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  name?: string;
  slug?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export const rolesApi = {
  // Lấy danh sách roles
  getRoles: async (params?: { page?: number; pageSize?: number; search?: string; isActive?: boolean }) => {
    const response = await api.get<RoleListResponse>("/admin/roles", { params });
    return response.data;
  },

  // Lấy chi tiết role
  getRoleById: async (id: string) => {
    const response = await api.get<RoleResponse>(`/admin/roles/${id}`);
    return response.data;
  },

  // Tạo role mới
  createRole: async (data: CreateRoleDto) => {
    const response = await api.post<RoleResponse>("/admin/roles", data);
    return response.data;
  },

  // Cập nhật role
  updateRole: async (id: string, data: UpdateRoleDto) => {
    const response = await api.put<RoleResponse>(`/admin/roles/${id}`, data);
    return response.data;
  },

  // Xóa role
  deleteRole: async (id: string) => {
    const response = await api.delete<any>(`/admin/roles/${id}`);
    return response.data;
  },

  // Lấy danh sách permissions khả dụng
  getAvailablePermissions: async () => {
    const response = await api.get<{ success: boolean; data: string[] }>("/admin/roles/permissions/available");
    return response.data;
  }
};
