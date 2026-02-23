import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  Progress,
  Image,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DollarOutlined,
  InboxOutlined,
  TagsOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  WarningOutlined,
  PictureOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { productsApi } from "@/apis/products";
import type { ProductImage } from "../types";

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProduct(id!),
    enabled: !!id,
  });

  const product = data?.data;

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

  const getStatusText = (status?: string) => {
    switch (status) {
      case "PUBLISHED":
        return "Đã xuất bản";
      case "DRAFT":
        return "Bản nháp";
      case "ARCHIVED":
        return "Đã lưu trữ";
      case "OUT_OF_STOCK":
        return "Hết hàng";
      default:
        return status || "-";
    }
  };

  const getStockStatus = (stock?: number, lowStock?: number) => {
    if (!stock || stock === 0) {
      return { color: "red", text: "Hết hàng", icon: <CloseCircleOutlined /> };
    }
    if (stock <= (lowStock || 10)) {
      return {
        color: "orange",
        text: "Sắp hết",
        icon: <WarningOutlined />,
      };
    }
    return { color: "green", text: "Còn hàng", icon: <CheckCircleOutlined /> };
  };

  const stockStatus = getStockStatus(product?.stock, product?.lowStock);
  const stockPercentage = product?.lowStock
    ? Math.min(((product?.stock || 0) / product.lowStock) * 100, 100)
    : 100;

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
          "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau."
        }
        type="error"
        showIcon
        action={<Button onClick={() => navigate(-1)}>Quay lại</Button>}
      />
    );
  }

  if (!product) {
    return (
      <Alert
        message="Không tìm thấy"
        description="Sản phẩm không tồn tại hoặc đã bị xóa."
        type="warning"
        showIcon
        action={<Button onClick={() => navigate(-1)}>Quay lại</Button>}
      />
    );
  }

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
                {product.name}
              </Title>
              {product.shortDesc && (
                <Text type="secondary" className="text-base">
                  {product.shortDesc}
                </Text>
              )}
            </div>
          </Space>
          <Space>
            <Button type="primary" icon={<EditOutlined />} size="large">
              Chỉnh sửa
            </Button>
          </Space>
        </div>
      </Card>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Giá bán"
              value={product.salePrice || product.basePrice || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(value))
              }
            />
            {product.salePrice && product.basePrice && (
              <Text type="secondary" className="text-sm">
                Giá gốc: <Text delete>{formatCurrency(product.basePrice)}</Text>
              </Text>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tồn kho"
              value={product.stock || 0}
              prefix={<InboxOutlined />}
              valueStyle={{
                color: stockStatus.color === "red" ? "#cf1322" : "#3f8600",
              }}
              suffix={
                <Tag
                  color={stockStatus.color}
                  icon={stockStatus.icon}
                  className="ml-2"
                >
                  {stockStatus.text}
                </Tag>
              }
            />
            <Progress
              percent={stockPercentage}
              strokeColor={
                stockPercentage <= 50
                  ? "#ff4d4f"
                  : stockPercentage <= 75
                    ? "#faad14"
                    : "#52c41a"
              }
              showInfo={false}
              className="mt-2"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Trạng thái"
              value={getStatusText(product.status)}
              prefix={<TagsOutlined />}
              valueStyle={{
                fontSize: "20px",
                color:
                  product.status === "PUBLISHED"
                    ? "#3f8600"
                    : product.status === "OUT_OF_STOCK"
                      ? "#cf1322"
                      : "#faad14",
              }}
            />
            <Space className="mt-2">
              <Tag color={product.isActive ? "green" : "default"}>
                {product.isActive ? "Đang bán" : "Ngừng bán"}
              </Tag>
              {product.isFeatured && (
                <Tag color="gold" icon={<StarOutlined />}>
                  Nổi bật
                </Tag>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Lợi nhuận dự kiến"
              value={
                (product.salePrice || product.basePrice || 0) -
                (product.costPrice || 0)
              }
              prefix={<DollarOutlined />}
              valueStyle={{
                color:
                  (product.salePrice || product.basePrice || 0) -
                    (product.costPrice || 0) >
                  0
                    ? "#3f8600"
                    : "#cf1322",
              }}
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(value))
              }
            />
            {product.costPrice && (
              <Text type="secondary" className="text-sm">
                Giá vốn: {formatCurrency(product.costPrice)}
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          {/* Product Images */}
          {product.images && product.images.length > 0 && (
            <Card
              title={
                <Space>
                  <PictureOutlined />
                  <span>Hình ảnh sản phẩm</span>
                </Space>
              }
              className="shadow-sm"
            >
              <Image.PreviewGroup>
                <Row gutter={[16, 16]}>
                  {product.images.map((image: ProductImage) => (
                    <Col xs={12} sm={8} md={6} lg={4} key={image.id}>
                      <div className="relative">
                        <Image
                          src={image.url}
                          alt={image.alt || product.name}
                          className="rounded-lg object-cover w-full"
                          style={{ height: "150px" }}
                        />
                        {image.isPrimary && (
                          <Tag
                            color="gold"
                            className="absolute top-2 right-2"
                            icon={<StarOutlined />}
                          >
                            Chính
                          </Tag>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </Card>
          )}
          <Card title="Thông tin chi tiết" className="shadow-sm">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên sản phẩm">
                <Text strong className="text-base">
                  {product.name}
                </Text>
              </Descriptions.Item>

              {product.slug && (
                <Descriptions.Item label="Slug">
                  <Text code copyable>
                    {product.slug}
                  </Text>
                </Descriptions.Item>
              )}

              {product.sku && (
                <Descriptions.Item label="SKU">
                  <Text code copyable className="font-mono">
                    {product.sku}
                  </Text>
                </Descriptions.Item>
              )}

              {product.category && (
                <Descriptions.Item label="Danh mục">
                  <Tag color="blue" className="text-sm">
                    {(product.category as any).name}
                  </Tag>
                </Descriptions.Item>
              )}

              {product.shortDesc && (
                <Descriptions.Item label="Mô tả ngắn">
                  <Paragraph className="mb-0">{product.shortDesc}</Paragraph>
                </Descriptions.Item>
              )}

              {product.description && (
                <Descriptions.Item label="Mô tả chi tiết">
                  <div
                    className="product-description prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                    style={{
                      lineHeight: "1.8",
                      color: "#333",
                    }}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Pricing Details */}
          <Card title="Thông tin giá" className="shadow-sm mt-4">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Giá gốc" span={1}>
                <Text strong className="text-lg text-blue-600">
                  {formatCurrency(product.basePrice)}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Giá sale" span={1}>
                {product.salePrice ? (
                  <Text strong className="text-lg text-green-600">
                    {formatCurrency(product.salePrice)}
                  </Text>
                ) : (
                  <Text type="secondary">Không có</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Giá vốn" span={1}>
                {product.costPrice ? (
                  <Text className="text-base">
                    {formatCurrency(product.costPrice)}
                  </Text>
                ) : (
                  <Text type="secondary">Chưa cập nhật</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Lợi nhuận/sản phẩm" span={1}>
                <Text
                  strong
                  className="text-base"
                  style={{
                    color:
                      (product.salePrice || product.basePrice || 0) -
                        (product.costPrice || 0) >
                      0
                        ? "#3f8600"
                        : "#cf1322",
                  }}
                >
                  {formatCurrency(
                    (product.salePrice || product.basePrice || 0) -
                      (product.costPrice || 0),
                  )}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <Card title="Thuộc tính sản phẩm" className="shadow-sm mt-4">
              <Descriptions bordered column={2}>
                {Object.entries(product.attributes).map(([key, value]) => (
                  <Descriptions.Item
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    key={key}
                  >
                    <Tag color="geekblue">{String(value)}</Tag>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* Inventory & Stock */}
          <Card title="Kho hàng" className="shadow-sm">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Tồn kho hiện tại">
                <Text strong className="text-lg">
                  {product.stock || 0} sản phẩm
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Ngưỡng cảnh báo">
                <Text>{product.lowStock || 10} sản phẩm</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái kho">
                <Tag color={stockStatus.color} icon={stockStatus.icon}>
                  {stockStatus.text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="space-y-2">
              <Text type="secondary" className="text-sm">
                Mức độ tồn kho
              </Text>
              <Progress
                percent={stockPercentage}
                strokeColor={
                  stockPercentage <= 50
                    ? "#ff4d4f"
                    : stockPercentage <= 75
                      ? "#faad14"
                      : "#52c41a"
                }
                format={(percent) => `${Math.round(percent || 0)}%`}
              />
            </div>
          </Card>

          {/* SEO Information */}
          <Card title="Thông tin SEO" className="shadow-sm mt-4">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Meta Title">
                {product.metaTitle || (
                  <Text type="secondary" italic>
                    Chưa cập nhật
                  </Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Meta Description">
                {product.metaDesc || (
                  <Text type="secondary" italic>
                    Chưa cập nhật
                  </Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Meta Keywords">
                {product.metaKeywords ? (
                  <Space wrap>
                    {product.metaKeywords
                      .split(",")
                      .map((keyword: string, index: number) => (
                        <Tag key={index} color="purple">
                          {keyword.trim()}
                        </Tag>
                      ))}
                  </Space>
                ) : (
                  <Text type="secondary" italic>
                    Chưa cập nhật
                  </Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

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
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Ngày tạo">
                {formatDate(product.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Cập nhật lần cuối">
                {formatDate(product.updatedAt)}
              </Descriptions.Item>

              {product.publishedAt && (
                <Descriptions.Item label="Ngày xuất bản">
                  {formatDate(product.publishedAt)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* System Info */}
          <Card title="Thông tin hệ thống" className="shadow-sm mt-4">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="ID">
                <Text code copyable className="font-mono text-xs">
                  {product.id}
                </Text>
              </Descriptions.Item>

              {product.categoryId && (
                <Descriptions.Item label="Category ID">
                  <Text code className="font-mono text-xs">
                    {product.categoryId}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Product Variants */}
      {product.variants && product.variants.length > 0 && (
        <Card
          title={
            <Space>
              <AppstoreOutlined />
              <span>Biến thể sản phẩm</span>
              <Tag color="blue">{product.variants.length}</Tag>
            </Space>
          }
          className="shadow-sm"
        >
          <Table
            dataSource={product.variants}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
            columns={[
              {
                title: "Tên biến thể",
                dataIndex: "name",
                key: "name",
                render: (name) => name || <Text type="secondary">-</Text>,
              },
              {
                title: "SKU",
                dataIndex: "sku",
                key: "sku",
                render: (sku) =>
                  sku ? (
                    <Text code copyable>
                      {sku}
                    </Text>
                  ) : (
                    <Text type="secondary">-</Text>
                  ),
              },
              {
                title: "Thuộc tính",
                dataIndex: "attributes",
                key: "attributes",
                render: (attributes) =>
                  attributes && Object.keys(attributes).length > 0 ? (
                    <Space wrap>
                      {Object.entries(attributes).map(([key, value]) => (
                        <Tag key={key} color="geekblue">
                          {key}: {String(value)}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">-</Text>
                  ),
              },
              {
                title: "Giá",
                dataIndex: "price",
                key: "price",
                render: (price) => (
                  <Text strong className="text-green-600">
                    {formatCurrency(price)}
                  </Text>
                ),
              },
              {
                title: "Tồn kho",
                dataIndex: "stock",
                key: "stock",
                render: (stock) => {
                  const status = getStockStatus(stock, product.lowStock);
                  return (
                    <Tag color={status.color} icon={status.icon}>
                      {stock || 0}
                    </Tag>
                  );
                },
              },
              {
                title: "Trạng thái",
                dataIndex: "isActive",
                key: "isActive",
                render: (isActive) => (
                  <Tag color={isActive ? "green" : "default"}>
                    {isActive ? "Hoạt động" : "Ngừng"}
                  </Tag>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
