import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    Button,
    Table,
    Divider,
    Alert,
    Spin,
    Tag,
    Timeline,
    Row,
    Col,
} from "antd";
import {
    ArrowLeftOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    MailOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ordersApi } from "@/apis/orders";
import type { OrderItem } from "../types";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/OrderStatusBadge";

interface ShippingAddress {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    country: string;
    type?: string;
    isDefault?: boolean;
}

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ["order", id],
        queryFn: () => ordersApi.getOrderById(id!),
        enabled: !!id,
    });

    const order = response?.data;

    const handleBack = () => {
        navigate("/orders");
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="p-6">
                <Alert
                    message="Lỗi"
                    description="Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
                    type="error"
                    showIcon
                />
            </div>
        );
    }

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

    // Parse shipping address
    let shippingAddress: ShippingAddress | null = null;
    if (order.shippingAddress) {
        try {
            shippingAddress = typeof order.shippingAddress === "string"
                ? JSON.parse(order.shippingAddress)
                : order.shippingAddress;
        } catch (e) {
            console.error("Failed to parse shipping address:", e);
        }
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBack}
                        size="large"
                    >
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            Đơn hàng #{order.orderNumber}
                        </h1>
                        <p className="text-gray-500">
                            Tạo ngày {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                </div>
            </div>

            <Row gutter={[24, 24]}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
                    {/* Order Items */}
                    <Card title="Sản phẩm" className="mb-6">
                        <Table
                            columns={itemColumns}
                            dataSource={order.items || []}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    </Card>

                    {/* Order Timeline */}
                    <Card title="Lịch sử đơn hàng">
                        <Timeline
                            items={[
                                {
                                    color: "green",
                                    children: (
                                        <div>
                                            <div className="font-medium">Đơn hàng đã tạo</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                                            </div>
                                        </div>
                                    ),
                                },
                                ...(order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED"
                                    ? [{
                                        color: "blue",
                                        children: (
                                            <div>
                                                <div className="font-medium">Đang xử lý</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(order.updatedAt).toLocaleString("vi-VN")}
                                                </div>
                                            </div>
                                        ),
                                    }]
                                    : []),
                                ...(order.status === "SHIPPED" || order.status === "DELIVERED"
                                    ? [{
                                        color: "orange",
                                        children: (
                                            <div>
                                                <div className="font-medium">Đã giao cho vận chuyển</div>
                                                {order.trackingNumber && (
                                                    <div className="text-xs text-gray-500">
                                                        Mã vận đơn: {order.trackingNumber}
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    }]
                                    : []),
                                ...(order.status === "DELIVERED"
                                    ? [{
                                        color: "green",
                                        children: (
                                            <div>
                                                <div className="font-medium">Đã giao hàng</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(order.updatedAt).toLocaleString("vi-VN")}
                                                </div>
                                            </div>
                                        ),
                                    }]
                                    : []),
                                ...(order.status === "CANCELLED"
                                    ? [{
                                        color: "red",
                                        children: (
                                            <div>
                                                <div className="font-medium">Đơn hàng đã hủy</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(order.updatedAt).toLocaleString("vi-VN")}
                                                </div>
                                            </div>
                                        ),
                                    }]
                                    : []),
                            ]}
                        />
                    </Card>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                    {/* Customer Info */}
                    <Card title="Thông tin khách hàng" className="mb-6">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <UserOutlined className="text-gray-400 mt-1" />
                                <div>
                                    <div className="text-xs text-gray-500">Họ tên</div>
                                    <div className="font-medium">
                                        {order.customer?.firstName} {order.customer?.lastName}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MailOutlined className="text-gray-400 mt-1" />
                                <div>
                                    <div className="text-xs text-gray-500">Email</div>
                                    <div className="font-medium">{order.customer?.email}</div>
                                </div>
                            </div>
                            {order.customer?.phone && (
                                <div className="flex items-start gap-3">
                                    <PhoneOutlined className="text-gray-400 mt-1" />
                                    <div>
                                        <div className="text-xs text-gray-500">Số điện thoại</div>
                                        <div className="font-medium">{order.customer.phone}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Shipping Address */}
                    {shippingAddress && (
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <EnvironmentOutlined />
                                    <span>Địa chỉ giao hàng</span>
                                    {shippingAddress.isDefault && (
                                        <Tag color="blue" className="ml-2">Mặc định</Tag>
                                    )}
                                </div>
                            }
                            className="mb-6"
                        >
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Người nhận</div>
                                    <div className="font-semibold text-base">
                                        {shippingAddress.firstName} {shippingAddress.lastName}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Số điện thoại</div>
                                    <div className="flex items-center gap-2">
                                        <PhoneOutlined className="text-blue-500" />
                                        <span className="font-medium">{shippingAddress.phone}</span>
                                    </div>
                                </div>

                                <Divider className="my-3" />

                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Địa chỉ</div>
                                    <div className="flex items-start gap-2">
                                        <HomeOutlined className="text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <div className="font-medium">{shippingAddress.address1}</div>
                                            {shippingAddress.address2 && (
                                                <div className="text-gray-600">{shippingAddress.address2}</div>
                                            )}
                                            <div className="text-gray-600 mt-1">
                                                {shippingAddress.city}, {shippingAddress.postalCode}
                                            </div>
                                            <div className="text-gray-600">{shippingAddress.country}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Payment Summary */}
                    <Card title="Chi tiết thanh toán">
                        <div className="space-y-3">
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

                            {order.paymentMethod && (
                                <>
                                    <Divider className="my-2" />
                                    <div className="text-sm">
                                        <div className="text-gray-600 mb-1">Phương thức thanh toán</div>
                                        <Tag color="blue">{order.paymentMethod}</Tag>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Notes */}
                    {order.notes && (
                        <Card title="Ghi chú" className="mt-6">
                            <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-sm">{order.notes}</p>
                            </div>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
}
