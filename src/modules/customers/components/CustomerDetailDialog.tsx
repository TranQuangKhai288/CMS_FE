import { Modal, Descriptions, Divider, Tag, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { Customer } from "../types";

interface CustomerDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

export default function CustomerDetailDialog({
    isOpen,
    onClose,
    customer,
}: CustomerDetailDialogProps) {
    if (!customer) return null;

    return (
        <Modal
            title="Chi tiết khách hàng"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <div className="space-y-6">
                {/* Avatar và thông tin cơ bản */}
                <div className="flex items-center gap-4">
                    <Avatar
                        src={customer.avatar}
                        icon={<UserOutlined />}
                        size={80}
                    />
                    <div>
                        <h3 className="text-xl font-semibold">
                            {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-gray-500">{customer.email}</p>
                        {customer.phone && (
                            <p className="text-gray-500">{customer.phone}</p>
                        )}
                    </div>
                </div>

                <Divider />

                {/* Thông tin chi tiết */}
                <div>
                    <h4 className="text-base font-semibold mb-3">Thông tin chung</h4>
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="ID">
                            <span className="font-mono text-xs">{customer.id}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={customer.isActive ? "green" : "default"}>
                                {customer.isActive ? "Hoạt động" : "Tắt"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {new Date(customer.createdAt).toLocaleString("vi-VN")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật lần cuối">
                            {new Date(customer.updatedAt).toLocaleString("vi-VN")}
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                <Divider />

                {/* Thống kê */}
                <div>
                    <h4 className="text-base font-semibold mb-3">Thống kê</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-sm text-gray-600 mb-1">Tổng đơn hàng</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {customer.totalOrders}
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="text-sm text-gray-600 mb-1">Tổng chi tiêu</div>
                            <div className="text-2xl font-bold text-green-600">
                                {customer.totalSpent.toLocaleString("vi-VN")} ₫
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="text-sm text-gray-600 mb-1">Điểm thưởng</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {customer.loyaltyPoints.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Địa chỉ */}
                {customer.addresses && (
                    <>
                        <Divider />
                        <div>
                            <h4 className="text-base font-semibold mb-3">Địa chỉ</h4>
                            <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-60">
                                    {typeof customer.addresses === "string"
                                        ? customer.addresses
                                        : JSON.stringify(customer.addresses, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
