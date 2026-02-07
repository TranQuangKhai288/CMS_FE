import { api } from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

export const customersApi = {
    // Lấy danh sách customers với filtering
    getCustomers: async (params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        isActive?: boolean;
        minSpent?: number;
        maxSpent?: number;
        minOrders?: number;
        hasOrders?: boolean;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) => {
        const response = await api.get<ApiResponse<any[]>>("/shop/customers", {
            params,
        });
        return response.data;
    },

    // Lấy thống kê customers
    getCustomerStats: async () => {
        const response = await api.get<ApiResponse<any>>("/shop/customers/stats");
        return response.data;
    },

    // Lấy chi tiết customer theo ID
    getCustomerById: async (id: string) => {
        const response = await api.get<ApiResponse<any>>(`/shop/customers/${id}`);
        return response.data;
    },

    // Lấy customer theo email
    getCustomerByEmail: async (email: string) => {
        const response = await api.get<ApiResponse<any>>(
            `/shop/customers/email/${email}`
        );
        return response.data;
    },

    // Tạo customer mới
    createCustomer: async (data: any) => {
        const response = await api.post<ApiResponse<any>>(
            "/shop/customers",
            data
        );
        return response.data;
    },

    // Cập nhật customer
    updateCustomer: async (id: string, data: any) => {
        const response = await api.put<ApiResponse<any>>(
            `/shop/customers/${id}`,
            data
        );
        return response.data;
    },

    // Xóa customer
    deleteCustomer: async (id: string) => {
        const response = await api.delete<ApiResponse<void>>(
            `/shop/customers/${id}`
        );
        return response.data;
    },

    // Thêm loyalty points
    addLoyaltyPoints: async (id: string, points: number) => {
        const response = await api.post<ApiResponse<any>>(
            `/shop/customers/${id}/loyalty/add`,
            { points }
        );
        return response.data;
    },

    // Trừ loyalty points
    deductLoyaltyPoints: async (id: string, points: number) => {
        const response = await api.post<ApiResponse<any>>(
            `/shop/customers/${id}/loyalty/deduct`,
            { points }
        );
        return response.data;
    },
};
