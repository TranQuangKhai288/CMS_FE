import type { ApiResponse } from "@/lib/types";

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export type RoleListResponse = ApiResponse<Role[]>;
export type RoleResponse = ApiResponse<Role>;
