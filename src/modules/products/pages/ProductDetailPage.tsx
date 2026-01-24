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
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { productsApi } from "../api";

const { Title } = Typography;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProduct(id!),
    enabled: !!id,
  });

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
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
        action={
          <Button onClick={() => navigate("/products")}>Quay lại</Button>
        }
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
        action={
          <Button onClick={() => navigate("/products")}>Quay lại</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/products")}
            >
              Quay lại
            </Button>
            <Title level={3} className="mb-0!">
              Chi tiết sản phẩm
            </Title>
          </Space>
        </div>

        <Divider />

        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          className="mb-6"
        >
          <Descriptions.Item label="ID" span={2}>
            <span className="font-mono text-gray-600">{product.id}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Tên sản phẩm" span={2}>
            <span className="font-semibold text-lg">{product.name}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {product.description ? (
              <div
                className="product-description"
                dangerouslySetInnerHTML={{ __html: product.description }}
                style={{
                  lineHeight: "1.8",
                  color: "#333",
                }}
              />
            ) : (
              <span className="text-gray-400 italic">Chưa có mô tả</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Giá">
            <span className="font-semibold text-lg text-blue-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.price)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={product.isActive ? "green" : "default"} className="text-sm px-3 py-1">
              {product.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(product.createdAt).toLocaleString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {new Date(product.updatedAt).toLocaleString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

