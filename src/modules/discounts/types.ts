// Discount Types
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";

export interface Discount {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: DiscountType;
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
    type: DiscountType;
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

export interface DiscountListQuery {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: DiscountType;
    isActive?: boolean;
    sortBy?: "code" | "value" | "usageCount" | "createdAt";
    sortOrder?: "asc" | "desc";
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
