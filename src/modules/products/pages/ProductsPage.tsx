import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  Card,
  Typography,
  message,
  Alert,
  Switch,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { productsApi } from "../api";
import ProductDialog from "../components/ProductDialog";
import DeleteProductDialog from "../components/DeleteProductDialog";
import type { Product } from "../types";

const { Title } = Typography;
const { Search } = Input;

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [limit] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page, searchText, limit],
    queryFn: () => productsApi.getProducts({ page, limit, search: searchText }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => productsApi.toggleProductStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Cập nhật trạng thái thành công");
    },
    onError: () => {
      message.error("Cập nhật trạng thái thất bại");
    },
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = (product: Product) => {
    toggleStatusMutation.mutate(product.id);
  };

  const columns: ColumnsType<Product> = [
    {
      title: "",
      key: "image",
      width: 80,
      render: (_: any, record: Product) => {
        const img =
          record.images?.find((i) => i.is_primary) || record.images?.[0];
        return <Avatar src={img?.url} shape="square" size={64} />;
      },
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: Product) => (
        <div className="=">
          <div className="font-medium">SKU: {record.sku}</div>

          <div className="font-medium">Tên sản phẩm: {record.name}</div>
          {record.short_desc ? (
            <Tooltip title={record.short_desc}>
              <div className="text-sm text-gray-600 truncate max-w-[320px]">
                {record.short_desc}
              </div>
            </Tooltip>
          ) : record.description ? (
            <Tooltip title={record.description}>
              <div className="text-sm text-gray-600 truncate max-w-[320px]">
                {record.description}
              </div>
            </Tooltip>
          ) : null}
        </div>
      ),
    },
    {
      title: "Thuộc tính",
      key: "attributes",
      width: 200,
      render: (_: any, record: Product) => {
        const attrs = record.attributes;
        if (!attrs) return null;
        try {
          const displayAttrs = attrs.slice(0, 4);

          return (
            <Space size={[4, 4]} wrap>
              {displayAttrs.map((item: any) => (
                <Tag key={item.key} color="blue">
                  {`${item.label}: ${item.value}`}
                </Tag>
              ))}
              {attrs.length > 4 && (
                <Tag color="default">+{attrs.length - 4}</Tag>
              )}
            </Space>
          );
        } catch (e) {
          return (
            <div className="text-sm truncate max-w-[220px]">
              {String(attrs)}
            </div>
          );
        }
      },
    },
    {
      title: "Giá cơ bản",
      dataIndex: "base_price",
      key: "base_price",
      align: "right",
      render: (v: number) => (v ?? 0).toLocaleString(),
      width: 120,
    },
    {
      title: "Giá bán",
      dataIndex: "sale_price",
      key: "sale_price",
      align: "right",
      render: (v: number) => (v ?? 0).toLocaleString(),
      width: 120,
    },
    {
      title: "Giá vốn",
      dataIndex: "cost_price",
      key: "cost_price",
      align: "right",
      render: (v: number) => (v ?? 0).toLocaleString(),
      width: 120,
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      width: 100,
      align: "right",
    },
    {
      title: "Biến thể",
      key: "variants",
      width: 100,
      align: "center",
      render: (_: any, record: Product) => record.variants?.length || 0,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 140,
      align: "center",
      render: (_: any, record: Product) => {
        const status = record.status || "DRAFT";
        const color =
          status === "PUBLISHED"
            ? "green"
            : status === "ARCHIVED"
            ? "default"
            : status === "OUT_OF_STOCK"
            ? "orange"
            : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 140,
      render: (_: any, record: Product) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record)}
              className="text-blue-600 hover:text-blue-700!"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProduct(record)}
            />
          </Tooltip>
          <Tooltip title="Kích hoạt">
            <Switch
              checked={!!record.is_active}
              onChange={() => toggleStatusMutation.mutate(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert
        message="Lỗi"
        description="Không thể tải danh sách products. Vui lòng thử lại sau."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Title level={3} className="mb-0!">
            Quản lý Products
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
            size="large"
          >
            Thêm Product
          </Button>
        </div>

        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm theo tên hoặc SKU..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.pagination?.total || 0,
            onChange: (newPage) => setPage(newPage),
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} products`,
          }}
          className="overflow-x-auto"
        />
      </Card>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        product={selectedProduct}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
