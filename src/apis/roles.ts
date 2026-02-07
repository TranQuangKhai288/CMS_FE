import { api } from "@/lib/axios";
import type { RoleListResponse } from "../modules/roles/types";

export const rolesApi = {
  // Lấy danh sách roles
  getRoles: async () => {
    const response = await api.get<RoleListResponse>("/admin/roles");
    return response.data;
  },
};
