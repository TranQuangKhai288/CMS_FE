import { Tag } from "antd";
import type { OrderStatus, PaymentStatus } from "../types";

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
}

const orderStatusConfig: Record<
    OrderStatus,
    { color: string; label: string }
> = {
    PENDING: { color: "default", label: "Chờ xử lý" },
    CONFIRMED: { color: "blue", label: "Đã xác nhận" },
    PROCESSING: { color: "cyan", label: "Đang xử lý" },
    SHIPPED: { color: "purple", label: "Đang giao" },
    DELIVERED: { color: "green", label: "Đã giao" },
    CANCELLED: { color: "red", label: "Đã hủy" },
    REFUNDED: { color: "orange", label: "Đã hoàn tiền" },
};

const paymentStatusConfig: Record<
    PaymentStatus,
    { color: string; label: string }
> = {
    PENDING: { color: "default", label: "Chờ thanh toán" },
    PAID: { color: "green", label: "Đã thanh toán" },
    FAILED: { color: "red", label: "Thất bại" },
    REFUNDED: { color: "orange", label: "Đã hoàn tiền" },
    PARTIALLY_REFUNDED: { color: "gold", label: "Hoàn 1 phần" },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const config = orderStatusConfig[status];
    return <Tag color={config.color}>{config.label}</Tag>;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    const config = paymentStatusConfig[status];
    return <Tag color={config.color}>{config.label}</Tag>;
}
