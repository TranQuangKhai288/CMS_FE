import { api } from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

export const ordersApi = {
    // Lấy danh sách orders với filtering
    getOrders: async (params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        customerId?: string;
        status?: string;
        paymentStatus?: string;
    }) => {
        const response = await api.get<ApiResponse<any[]>>("/shop/orders", {
            params,
        });
        return response.data;
    },

    // Lấy thống kê orders
    getOrderStats: async () => {
        const response = await api.get<ApiResponse<any>>("/shop/orders/stats");
        return response.data;
    },

    // Lấy chi tiết order theo ID
    getOrderById: async (id: string) => {
        const response = await api.get<ApiResponse<any>>(`/shop/orders/${id}`);
        return response.data;
    },

    // Lấy order theo order number
    getOrderByNumber: async (orderNumber: string) => {
        const response = await api.get<ApiResponse<any>>(
            `/shop/orders/number/${orderNumber}`
        );
        return response.data;
    },

    // Tạo order mới
    createOrder: async (data: any) => {
        const response = await api.post<ApiResponse<any>>("/shop/orders", data);
        return response.data;
    },

    // Cập nhật order
    updateOrder: async (id: string, data: any) => {
        const response = await api.put<ApiResponse<any>>(
            `/shop/orders/${id}`,
            data
        );
        return response.data;
    },

    // Cập nhật order status
    updateOrderStatus: async (id: string, status: string, note?: string) => {
        const response = await api.put<ApiResponse<any>>(
            `/shop/orders/${id}/status`,
            { status, note }
        );
        return response.data;
    },

    // Hủy order
    cancelOrder: async (id: string, note?: string) => {
        const response = await api.post<ApiResponse<any>>(
            `/shop/orders/${id}/cancel`,
            { note }
        );
        return response.data;
    },
};
