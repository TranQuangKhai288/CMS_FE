import { api } from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

// Types
export interface DashboardStats {
    sales: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        ordersByStatus: Array<{
            status: string;
            count: number;
            total: number;
        }>;
    };
    customers: {
        totalCustomers: number;
        newCustomers: number;
        totalRevenue: number;
        totalOrders: number;
        averageSpent: number;
        averageOrders: number;
        topCustomers: Array<{
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            totalOrders: number;
            totalSpent: number;
        }>;
    };
    totalProducts: number;
    orders: Array<{
        status: string;
        count: number;
    }>;
}

export interface SalesOverTimeItem {
    date: string;
    revenue: number;
    orders: number;
}

export interface TopProduct {
    product: {
        id: string;
        name: string;
        slug: string;
        sku: string;
        basePrice: number;
    };
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
}

export interface LowStockProduct {
    id: string;
    name: string;
    sku: string;
    stock: number;
    lowStock: number;
    category: { name: string };
}

export const analyticsApi = {
    // Dashboard overview stats
    getDashboardStats: async (params?: {
        startDate?: string;
        endDate?: string;
    }) => {
        const response = await api.get<ApiResponse<DashboardStats>>(
            "/admin/analytics/dashboard",
            { params }
        );
        return response.data;
    },

    // Sales over time (for charts)
    getSalesOverTime: async (params?: {
        startDate?: string;
        endDate?: string;
        groupBy?: "day" | "week" | "month" | "year";
    }) => {
        const response = await api.get<ApiResponse<SalesOverTimeItem[]>>(
            "/admin/analytics/sales/over-time",
            { params }
        );
        return response.data;
    },

    // Top products
    getProductAnalytics: async (params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }) => {
        const response = await api.get<ApiResponse<TopProduct[]>>(
            "/admin/analytics/products/overview",
            { params }
        );
        return response.data;
    },

    // Low stock products
    getLowStockProducts: async (threshold?: number) => {
        const response = await api.get<ApiResponse<LowStockProduct[]>>(
            "/admin/analytics/products/low-stock",
            { params: { threshold } }
        );
        return response.data;
    },
};
