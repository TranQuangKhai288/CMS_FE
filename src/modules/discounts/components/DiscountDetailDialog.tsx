import { Modal, Descriptions, Tag, Progress } from "antd";
import type { Discount } from "../types";

interface DiscountDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    discount: Discount | null;
}

export default function DiscountDetailDialog({
    isOpen,
    onClose,
    discount,
}: DiscountDetailDialogProps) {
    if (!discount) return null;

    const getTypeDisplay = (type: string) => {
        const typeConfig = {
            PERCENTAGE: { color: "blue", text: "Phần trăm" },
            FIXED_AMOUNT: { color: "green", text: "Số tiền cố định" },
            FREE_SHIPPING: { color: "purple", text: "Miễn phí vận chuyển" },
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getValueDisplay = () => {
        if (discount.type === "PERCENTAGE") {
            return `${discount.value}%`;
        } else if (discount.type === "FIXED_AMOUNT") {
            return `${discount.value.toLocaleString("vi-VN")} ₫`;
        } else {
            return "Miễn phí vận chuyển";
        }
    };

    const getValidityStatus = () => {
        const now = new Date();
        const start = new Date(discount.startDate);
        const end = new Date(discount.endDate);

        if (now < start) {
            return <Tag color="orange">Sắp diễn ra</Tag>;
        } else if (now > end) {
            return <Tag color="red">Hết hạn</Tag>;
        } else {
            return <Tag color="green">Đang diễn ra</Tag>;
        }
    };

    const usagePercent = discount.usageLimit
        ? (discount.usageCount / discount.usageLimit) * 100
        : 0;

    return (
        <Modal
            title="Chi tiết mã giảm giá"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <div className="py-4">
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Mã giảm giá">
                        <span className="font-mono font-semibold text-blue-600">
                            {discount.code}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên">{discount.name}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                        {discount.description || <span className="text-gray-400">Không có</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại">{getTypeDisplay(discount.type)}</Descriptions.Item>
                    <Descriptions.Item label="Giá trị">{getValueDisplay()}</Descriptions.Item>
                    <Descriptions.Item label="Giá trị đơn hàng tối thiểu">
                        {discount.minOrderValue ? (
                            `${discount.minOrderValue.toLocaleString("vi-VN")} ₫`
                        ) : (
                            <span className="text-gray-400">Không giới hạn</span>
                        )}
                    </Descriptions.Item>
                    {discount.type === "PERCENTAGE" && discount.maxDiscount && (
                        <Descriptions.Item label="Giảm tối đa">
                            {discount.maxDiscount.toLocaleString("vi-VN")} ₫
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Số lần sử dụng">
                        {discount.usageLimit ? (
                            <div>
                                <div className="mb-2">
                                    {discount.usageCount} / {discount.usageLimit} lần
                                </div>
                                <Progress
                                    percent={usagePercent}
                                    status={usagePercent >= 100 ? "exception" : "active"}
                                />
                            </div>
                        ) : (
                            <span className="text-gray-400">Không giới hạn</span>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian bắt đầu">
                        {new Date(discount.startDate).toLocaleString("vi-VN")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian kết thúc">
                        {new Date(discount.endDate).toLocaleString("vi-VN")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tình trạng">
                        {getValidityStatus()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={discount.isActive ? "green" : "default"}>
                            {discount.isActive ? "Hoạt động" : "Tắt"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {new Date(discount.createdAt).toLocaleString("vi-VN")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật lần cuối">
                        {new Date(discount.updatedAt).toLocaleString("vi-VN")}
                    </Descriptions.Item>
                </Descriptions>
            </div>
        </Modal>
    );
}
