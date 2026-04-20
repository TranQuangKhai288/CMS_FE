import type { ApiResponse } from "@/lib/types";

export interface Customer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    addresses?: any; // JSON array
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerDto {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    addresses?: any;
    isActive?: boolean;
}

export interface UpdateCustomerDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    addresses?: any;
    isActive?: boolean;
}

export type CustomerListResponse = ApiResponse<Customer[]>;
export type CustomerResponse = ApiResponse<Customer>;
export { type ApiResponse };
