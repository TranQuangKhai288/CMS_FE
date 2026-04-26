import type { ApiResponse } from "@/lib/types";

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoleListResponse = ApiResponse<Role[]>;
export type RoleResponse = ApiResponse<Role>;
