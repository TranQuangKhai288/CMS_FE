import { api } from "@/lib/axios";

// ==================== TYPES ====================

export type InventoryLogType =
    | "PURCHASE"    // Nhập hàng
    | "SALE"        // Bán hàng
    | "RETURN"      // Trả hàng
    | "ADJUSTMENT"  // Điều chỉnh
    | "DAMAGE";     // Hư hỏng

export interface InventoryLog {
    id: string;
    productId: string;
    product?: {
        id: string;
        name: string;
        sku: string;
    };
    type: InventoryLogType;
    quantity: number;
    before: number;
    after: number;
    note: string | null;
    createdBy: string | null;
    createdAt: string;
}

export interface CreateInventoryLogDto {
    productId: string;
    type: InventoryLogType;
    quantity: number;
    note?: string;
}

export interface AdjustStockDto {
    productId: string;
    type: "ADJUSTMENT" | "DAMAGE";
    quantity: number; // Positive = increase, Negative = decrease
    note?: string;
}

export interface InventoryListQuery {
    page?: number;
    pageSize?: number;
    productId?: string;
    type?: InventoryLogType;
    startDate?: string;
    endDate?: string;
    sortBy?: "createdAt" | "quantity";
    sortOrder?: "asc" | "desc";
}

export interface InventoryListResponse {
    data: InventoryLog[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

export interface InventoryStatsResponse {
    totalLogs: number;
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    recentActivity: Array<{
        id: string;
        productId: string;
        type: string;
        quantity: number;
        before: number;
        after: number;
        createdAt: string;
    }>;
    topMovements: Array<{
        productId: string;
        type: string;
        _sum: {
            quantity: number | null;
        };
    }>;
}

export interface LowStockProduct {
    id: string;
    name: string;
    sku: string;
    stock: number;
    lowStock: number;
}

// ==================== API FUNCTIONS ====================

export const inventoryApi = {
    /**
     * Get inventory logs with pagination and filters
     */
    async getLogs(params: InventoryListQuery = {}): Promise<InventoryListResponse> {
        const response = await api.get("/shop/inventory", { params });
        return response.data;
    },

    /**
     * Get inventory log by ID
     */
    async getLogById(id: string): Promise<InventoryLog> {
        const response = await api.get(`/shop/inventory/${id}`);
        return response.data;
    },

    /**
     * Get inventory statistics
     */
    async getStats(): Promise<InventoryStatsResponse> {
        const response = await api.get("/shop/inventory/stats");
        return response.data;
    },

    /**
     * Get low stock products
     */
    async getLowStockProducts(): Promise<LowStockProduct[]> {
        const response = await api.get("/shop/inventory/low-stock");
        return response.data;
    },

    /**
     * Get out of stock products
     */
    async getOutOfStockProducts(): Promise<LowStockProduct[]> {
        const response = await api.get("/shop/inventory/out-of-stock");
        return response.data;
    },

    /**
     * Adjust stock (increase or decrease)
     */
    async adjustStock(data: AdjustStockDto): Promise<InventoryLog> {
        const response = await api.post("/shop/inventory/adjust", data);
        return response.data;
    },

    /**
     * Create inventory log manually
     */
    async createLog(data: CreateInventoryLogDto): Promise<InventoryLog> {
        const response = await api.post("/shop/inventory", data);
        return response.data;
    },
};
