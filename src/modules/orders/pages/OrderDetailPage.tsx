import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Descriptions,
  Alert,
  Spin,
  Divider,
  Row,
  Col,
  Statistic,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ShopOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { ordersApi } from "@/apis/orders";
import type { Order, OrderStatus as OrderStatusType } from "../types";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: !!id,
  });

  const order = data?.data as Order | undefined;

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      ordersApi.updateOrderStatus(id!, status, note),
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setStatusModalVisible(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Cập nhật trạng thái thất bại",
      );
    },
  });

  // Mutation for cancelling order
  const cancelOrderMutation = useMutation({
    mutationFn: (note?: string) => ordersApi.cancelOrder(id!, note),
    onSuccess: () => {
      message.success("Hủy đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Hủy đơn hàng thất bại");
    },
  });

  // Helper functions
  const formatCurrency = (amount?: number) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderStatusText = (status?: OrderStatusType) => {
    const statusMap = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      PROCESSING: "Đang xử lý",
      SHIPPED: "Đã giao vận chuyển",
      DELIVERED: "Đã giao hàng",
      CANCELLED: "Đã hủy",
      REFUNDED: "Đã hoàn tiền",
    };
    return status ? statusMap[status] || status : "-";
  };

  const getPaymentStatusText = (status?: string) => {
    const statusMap = {
      PENDING: "Chờ thanh toán",
      PAID: "Đã thanh toán",
      FAILED: "Thanh toán thất bại",
      REFUNDED: "Đã hoàn tiền",
      PARTIALLY_REFUNDED: "Hoàn một phần",
    };
    return status ? statusMap[status as keyof typeof statusMap] || status : "-";
  };

  const getOrderStatusColor = (status?: OrderStatusType) => {
    const colorMap = {
      PENDING: "orange",
      CONFIRMED: "blue",
      PROCESSING: "cyan",
      SHIPPED: "purple",
      DELIVERED: "green",
      CANCELLED: "red",
      REFUNDED: "volcano",
    };
    return status ? colorMap[status] : "default";
  };

  const getPaymentStatusColor = (status?: string) => {
    const colorMap = {
      PENDING: "orange",
      PAID: "green",
      FAILED: "red",
      REFUNDED: "volcano",
      PARTIALLY_REFUNDED: "gold",
    };
    return status ? colorMap[status as keyof typeof colorMap] : "default";
  };

  const getOrderStatusIcon = (status?: OrderStatusType) => {
    const iconMap = {
      PENDING: <ClockCircleOutlined />,
      CONFIRMED: <CheckCircleOutlined />,
      PROCESSING: <ShopOutlined />,
      SHIPPED: <TruckOutlined />,
      DELIVERED: <CheckCircleOutlined />,
      CANCELLED: <CloseCircleOutlined />,
      REFUNDED: <DollarOutlined />,
    };
    return status ? iconMap[status] : <ClockCircleOutlined />;
  };

  const handleStatusUpdate = (values: { status: string; note?: string }) => {
    updateStatusMutation.mutate(values);
  };

  const handleCancelOrder = () => {
    Modal.confirm({
      title: "Xác nhận hủy đơn hàng",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
          <TextArea
            placeholder="Lý do hủy (tùy chọn)"
            rows={3}
            id="cancel-note"
          />
        </div>
      ),
      okText: "Hủy đơn hàng",
      okType: "danger",
      cancelText: "Đóng",
      onOk: () => {
        const note = (
          document.getElementById("cancel-note") as HTMLTextAreaElement
        )?.value;
        cancelOrderMutation.mutate(note);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Lỗi"
        description={
          (error as any)?.response?.data?.message ||
          "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
        }
        type="error"
        showIcon
        action={<Button onClick={() => navigate(-1)}>Quay lại</Button>}
      />
    );
  }

  if (!order) {
    return (
      <Alert
        message="Không tìm thấy"
        description="Đơn hàng không tồn tại hoặc đã bị xóa."
        type="warning"
        showIcon
        action={<Button onClick={() => navigate(-1)}>Quay lại</Button>}
      />
    );
  }

  // Table columns for order items
  const orderItemColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div>
          <Text strong className="block">
            {name}
          </Text>
          {record.product?.slug && (
            <Text
              type="secondary"
              className="text-xs cursor-pointer hover:text-blue-500"
              onClick={() => navigate(`/catalog/products/${record.product.id}`)}
            >
              Xem sản phẩm →
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku: string) => (
        <Text code copyable className="text-xs">
          {sku}
        </Text>
      ),
    },
    {
      title: "Biến thể",
      dataIndex: "variant",
      key: "variant",
      render: (variant: any) =>
        variant?.name ? (
          <Tag color="blue">{variant.name}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right" as const,
      render: (price: number) => (
        <Text className="text-blue-600 font-medium">
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (quantity: number) => <Text strong>×{quantity}</Text>,
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      align: "right" as const,
      render: (total: number) => (
        <Text strong className="text-green-600 text-base">
          {formatCurrency(total)}
        </Text>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Space size="large">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              size="large"
            >
              Quay lại
            </Button>
            <div>
              <Title level={2} className="mb-0!">
                Đơn hàng #{order.orderNumber}
              </Title>
              <Text type="secondary" className="text-base">
                Tạo lúc {formatDate(order.createdAt)}
              </Text>
            </div>
          </Space>
          <Space>
            {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
              <>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setStatusModalVisible(true)}
                  size="large"
                >
                  Cập nhật trạng thái
                </Button>
                {order.status === "PENDING" && (
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={handleCancelOrder}
                    size="large"
                  >
                    Hủy đơn
                  </Button>
                )}
              </>
            )}
          </Space>
        </div>
      </Card>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng tiền"
              value={order.total}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(value))
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Trạng thái đơn hàng"
              value={getOrderStatusText(order.status)}
              prefix={getOrderStatusIcon(order.status)}
              valueStyle={{
                fontSize: "18px",
                color:
                  order.status === "DELIVERED"
                    ? "#3f8600"
                    : order.status === "CANCELLED"
                      ? "#cf1322"
                      : "#faad14",
              }}
            />
            <Tag
              color={getOrderStatusColor(order.status)}
              icon={getOrderStatusIcon(order.status)}
              className="mt-2"
            >
              {getOrderStatusText(order.status)}
            </Tag>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Thanh toán"
              value={getPaymentStatusText(order.paymentStatus)}
              prefix={<CreditCardOutlined />}
              valueStyle={{
                fontSize: "18px",
                color:
                  order.paymentStatus === "PAID"
                    ? "#3f8600"
                    : order.paymentStatus === "FAILED"
                      ? "#cf1322"
                      : "#faad14",
              }}
            />{" "}
            <Tag
              color={getPaymentStatusColor(order.paymentStatus)}
              className="mt-2"
            >
              {getPaymentStatusText(order.paymentStatus)}
            </Tag>{" "}
            {order.paymentMethod && (
              <Text type="secondary" className="text-sm block mt-2">
                Phương thức: {order.paymentMethod}
              </Text>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Số sản phẩm"
              value={order.items?.length || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Text type="secondary" className="text-sm block mt-2">
              {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}{" "}
              món hàng
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          {/* Order Items */}
          <Card
            title={
              <Space>
                <ShoppingOutlined />
                <span>Sản phẩm đã đặt</span>
              </Space>
            }
            className="shadow-sm"
          >
            <Table
              dataSource={order.items}
              columns={orderItemColumns}
              rowKey="id"
              pagination={false}
              scroll={{ x: 800 }}
            />

            <Divider />

            {/* Price Summary */}
            <div className="space-y-3">
              <Row justify="space-between">
                <Col>
                  <Text>Tạm tính:</Text>
                </Col>
                <Col>
                  <Text className="text-base">
                    {formatCurrency(order.subtotal)}
                  </Text>
                </Col>
              </Row>

              {order.discount > 0 && (
                <Row justify="space-between">
                  <Col>
                    <Text>Giảm giá:</Text>
                  </Col>
                  <Col>
                    <Text className="text-red-500">
                      -{formatCurrency(order.discount)}
                    </Text>
                  </Col>
                </Row>
              )}

              {order.tax > 0 && (
                <Row justify="space-between">
                  <Col>
                    <Text>Thuế:</Text>
                  </Col>
                  <Col>
                    <Text>{formatCurrency(order.tax)}</Text>
                  </Col>
                </Row>
              )}

              {order.shipping > 0 && (
                <Row justify="space-between">
                  <Col>
                    <Text>Phí vận chuyển:</Text>
                  </Col>
                  <Col>
                    <Text>{formatCurrency(order.shipping)}</Text>
                  </Col>
                </Row>
              )}

              <Divider className="my-3" />

              <Row justify="space-between">
                <Col>
                  <Text strong className="text-lg">
                    Tổng cộng:
                  </Text>
                </Col>
                <Col>
                  <Text strong className="text-xl text-green-600">
                    {formatCurrency(order.total)}
                  </Text>
                </Col>
              </Row>
            </div>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Ghi chú</span>
                </Space>
              }
              className="shadow-sm mt-4"
            >
              <Paragraph className="mb-0">{order.notes}</Paragraph>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* Customer Info */}
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Thông tin khách hàng</span>
              </Space>
            }
            className="shadow-sm"
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Họ tên">
                <Text strong>
                  {order.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : "-"}
                </Text>
              </Descriptions.Item>

              {order.customer?.email && (
                <Descriptions.Item
                  label={
                    <Space size={4}>
                      <MailOutlined />
                      Email
                    </Space>
                  }
                >
                  <Text copyable>{order.customer.email}</Text>
                </Descriptions.Item>
              )}

              {order.customer?.phone && (
                <Descriptions.Item
                  label={
                    <Space size={4}>
                      <PhoneOutlined />
                      Điện thoại
                    </Space>
                  }
                >
                  <Text copyable>{order.customer.phone}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card
              title={
                <Space>
                  <EnvironmentOutlined />
                  <span>Địa chỉ giao hàng</span>
                </Space>
              }
              className="shadow-sm mt-4"
            >
              <div className="space-y-2">
                {order.shippingAddress.fullName && (
                  <Text strong className="block">
                    {order.shippingAddress.fullName}
                  </Text>
                )}
                {order.shippingAddress.phone && (
                  <Text className="block">
                    <PhoneOutlined className="mr-2" />
                    {order.shippingAddress.phone}
                  </Text>
                )}
                {order.shippingAddress.address && (
                  <Text className="block">{order.shippingAddress.address}</Text>
                )}
                {order.shippingAddress.ward && (
                  <Text type="secondary" className="block">
                    {order.shippingAddress.ward}
                  </Text>
                )}
                {order.shippingAddress.district && (
                  <Text type="secondary" className="block">
                    {order.shippingAddress.district}
                  </Text>
                )}
                {order.shippingAddress.province && (
                  <Text type="secondary" className="block">
                    {order.shippingAddress.province}
                  </Text>
                )}
              </div>
            </Card>
          )}

          {/* Tracking Number */}
          {order.trackingNumber && (
            <Card
              title={
                <Space>
                  <TruckOutlined />
                  <span>Mã vận đơn</span>
                </Space>
              }
              className="shadow-sm mt-4"
            >
              <Text code copyable className="text-base">
                {order.trackingNumber}
              </Text>
            </Card>
          )}

          {/* Timestamps */}
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Thời gian</span>
              </Space>
            }
            className="shadow-sm mt-4"
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Ngày tạo">
                {formatDate(order.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Cập nhật lần cuối">
                {formatDate(order.updatedAt)}
              </Descriptions.Item>

              {order.completedAt && (
                <Descriptions.Item label="Hoàn thành">
                  {formatDate(order.completedAt)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* System Info */}
          <Card title="Thông tin hệ thống" className="shadow-sm mt-4">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Order ID">
                <Text code copyable className="font-mono text-xs">
                  {order.id}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Customer ID">
                <Text code className="font-mono text-xs">
                  {order.customerId}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
          initialValues={{ status: order.status }}
        >
          <Form.Item
            label="Trạng thái mới"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select size="large">
              <Select.Option value="PENDING">Chờ xác nhận</Select.Option>
              <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
              <Select.Option value="PROCESSING">Đang xử lý</Select.Option>
              <Select.Option value="SHIPPED">Đã giao vận chuyển</Select.Option>
              <Select.Option value="DELIVERED">Đã giao hàng</Select.Option>
              <Select.Option value="CANCELLED">Đã hủy</Select.Option>
              <Select.Option value="REFUNDED">Đã hoàn tiền</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={4} placeholder="Ghi chú về việc cập nhật..." />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setStatusModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateStatusMutation.isPending}
              >
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
