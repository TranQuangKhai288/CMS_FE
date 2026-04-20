import { api } from "@/lib/axios";

// ==================== TYPES ====================

export interface DiscountListQuery {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    isActive?: boolean;
    sortBy?: "code" | "value" | "usageCount" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export interface Discount {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    value: number;
    minOrderValue: number | null;
    maxDiscount: number | null;
    usageLimit: number | null;
    usageCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDiscountDto {
    code: string;
    name: string;
    description?: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}

export interface UpdateDiscountDto {
    name?: string;
    description?: string;
    value?: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

export interface DiscountListResponse {
    data: Discount[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

export interface ValidateDiscountDto {
    code: string;
    orderTotal: number;
}

export interface ValidateDiscountResponse {
    valid: boolean;
    discount?: Discount;
    discountAmount?: number;
    finalTotal?: number;
    message?: string;
}

export interface DiscountStatsResponse {
    total: number;
    active: number;
    inactive: number;
    expired: number;
    totalUsage: number;
    mostUsed: Array<{
        id: string;
        code: string;
        name: string;
        usageCount: number;
    }>;
}

// ==================== API FUNCTIONS ====================

export const discountsApi = {
    /**
     * Get all discounts with pagination and filters
     */
    async getDiscounts(params: DiscountListQuery = {}): Promise<DiscountListResponse> {
        const response = await api.get("/shop/discounts", { params });
        return response.data;
    },

    /**
     * Get discount by ID
     */
    async getDiscountById(id: string): Promise<Discount> {
        const response = await api.get(`/shop/discounts/${id}`);
        return response.data;
    },

    /**
     * Get discount by code
     */
    async getDiscountByCode(code: string): Promise<Discount> {
        const response = await api.get(`/shop/discounts/code/${code}`);
        return response.data;
    },

    /**
     * Create new discount
     */
    async createDiscount(data: CreateDiscountDto): Promise<Discount> {
        const response = await api.post("/shop/discounts", data);
        return response.data;
    },

    /**
     * Update discount
     */
    async updateDiscount(id: string, data: UpdateDiscountDto): Promise<Discount> {
        const response = await api.put(`/shop/discounts/${id}`, data);
        return response.data;
    },

    /**
     * Delete discount
     */
    async deleteDiscount(id: string): Promise<void> {
        await api.delete(`/shop/discounts/${id}`);
    },

    /**
     * Get discount statistics
     */
    async getStats(): Promise<DiscountStatsResponse> {
        const response = await api.get("/shop/discounts/stats");
        return response.data;
    },

    /**
     * Validate discount code
     */
    async validateDiscount(data: ValidateDiscountDto): Promise<ValidateDiscountResponse> {
        const response = await api.post("/public/discounts/validate", data);
        return response.data;
    },
};
