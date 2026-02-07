import type { ApiResponse } from "@/lib/types";

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  roleId: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

export type UserListResponse = ApiResponse<User[]>;
export type UserResponse = ApiResponse<User>;
export { type ApiResponse };
