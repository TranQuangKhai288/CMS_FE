import { Modal, Descriptions, Table, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Order, OrderItem } from "../types";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";

interface OrderDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export default function OrderDetailDialog({
    isOpen,
    onClose,
    order,
}: OrderDetailDialogProps) {
    if (!order) return null;

    const itemColumns: ColumnsType<OrderItem> = [
        {
            title: "Sản phẩm",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: OrderItem) => (
                <div className="flex flex-col gap-1">
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-gray-500">SKU: {record.sku}</div>
                </div>
            ),
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            align: "center",
        },
        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            width: 150,
            align: "right",
            render: (price: number) => `${price.toLocaleString("vi-VN")} ₫`,
        },
        {
            title: "Thành tiền",
            dataIndex: "total",
            key: "total",
            width: 150,
            align: "right",
            render: (total: number) => (
                <span className="font-semibold">
                    {total.toLocaleString("vi-VN")} ₫
                </span>
            ),
        },
    ];

    return (
        <Modal
            title={`Chi tiết đơn hàng #${order.orderNumber}`}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={900}
            style={{ top: 20 }}
        >
            <div className="space-y-6">
                {/* Thông tin chung */}
                <div>
                    <h3 className="text-base font-semibold mb-3">Thông tin đơn hàng</h3>
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="Mã đơn hàng">
                            <span className="font-mono font-semibold">
                                #{order.orderNumber}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <OrderStatusBadge status={order.status} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Thanh toán">
                            <PaymentStatusBadge status={order.paymentStatus} />
                        </Descriptions.Item>
                        {order.paymentMethod && (
                            <Descriptions.Item label="Phương thức TT" span={2}>
                                {order.paymentMethod}
                            </Descriptions.Item>
                        )}
                        {order.trackingNumber && (
                            <Descriptions.Item label="Mã vận đơn" span={2}>
                                <span className="font-mono">{order.trackingNumber}</span>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </div>

                {/* Thông tin khách hàng */}
                <div>
                    <h3 className="text-base font-semibold mb-3">Thông tin khách hàng</h3>
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="Họ tên">
                            {order.customer?.firstName} {order.customer?.lastName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {order.customer?.email}
                        </Descriptions.Item>
                        {order.customer?.phone && (
                            <Descriptions.Item label="Số điện thoại" span={2}>
                                {order.customer.phone}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </div>

                {/* Địa chỉ giao hàng */}
                {order.shippingAddress && (
                    <div>
                        <h3 className="text-base font-semibold mb-3">Địa chỉ giao hàng</h3>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <pre className="text-sm whitespace-pre-wrap">
                                {typeof order.shippingAddress === "string"
                                    ? order.shippingAddress
                                    : JSON.stringify(order.shippingAddress, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                <Divider className="my-4" />

                {/* Danh sách sản phẩm */}
                <div>
                    <h3 className="text-base font-semibold mb-3">Sản phẩm</h3>
                    <Table
                        columns={itemColumns}
                        dataSource={order.items || []}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />
                </div>

                <Divider className="my-4" />

                {/* Tổng tiền */}
                <div>
                    <h3 className="text-base font-semibold mb-3">Chi tiết thanh toán</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tạm tính:</span>
                            <span>{order.subtotal.toLocaleString("vi-VN")} ₫</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Giảm giá:</span>
                                <span className="text-red-600">
                                    -{order.discount.toLocaleString("vi-VN")} ₫
                                </span>
                            </div>
                        )}
                        {order.tax > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Thuế:</span>
                                <span>{order.tax.toLocaleString("vi-VN")} ₫</span>
                            </div>
                        )}
                        {order.shipping > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Phí vận chuyển:</span>
                                <span>{order.shipping.toLocaleString("vi-VN")} ₫</span>
                            </div>
                        )}
                        <Divider className="my-2" />
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Tổng cộng:</span>
                            <span className="text-green-600">
                                {order.total.toLocaleString("vi-VN")} ₫
                            </span>
                        </div>
                    </div>
                </div>

                {/* Ghi chú */}
                {order.notes && (
                    <div>
                        <h3 className="text-base font-semibold mb-3">Ghi chú</h3>
                        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-sm">{order.notes}</p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
