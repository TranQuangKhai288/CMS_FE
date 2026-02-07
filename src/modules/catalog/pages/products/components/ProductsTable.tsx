import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  message,
  Switch,
  Avatar,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { productsApi } from "@/apis/products";
import type { Product } from "../types";
import ExpandableDescription from "./ExpandableDescription";

interface ProductsTableProps {
  data: Product[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductsTable({
  data,
  loading,
  pagination,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const queryClient = useQueryClient();

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
          record.images?.find((i) => i.isPrimary) || record.images?.[0];
        return <Avatar src={img?.url} shape="square" size={64} />;
      },
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 350,
      render: (_: any, record: Product) => {
        const content = record.shortDesc || record.description;

        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium text-gray-900">
              <span className="text-gray-500 font-normal text-xs mr-1">
                SKU:
              </span>
              {record.sku}
            </div>

            <div className="font-medium text-base">{record.name}</div>

            <ExpandableDescription content={content} />
          </div>
        );
      },
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
            <div className="text-sm truncate max-w-55">{String(attrs)}</div>
          );
        }
      },
    },
    {
      title: "Giá cơ bản",
      dataIndex: "basePrice",
      key: "basePrice",
      align: "right",
      render: (v: number) => (v ?? 0).toLocaleString(),
      width: 120,
    },
    {
      title: "Giá bán",
      dataIndex: "salePrice",
      key: "salePrice",
      align: "right",
      render: (v: number) => (v ?? 0).toLocaleString(),
      width: 120,
    },
    {
      title: "Giá vốn",
      dataIndex: "costPrice",
      key: "costPrice",
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
              onClick={() => onEdit(record)}
              className="text-blue-600 hover:text-blue-700!"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
            />
          </Tooltip>
          <Tooltip title="Kích hoạt">
            <Switch
              checked={!!record.isActive}
              onChange={() => handleToggleStatus(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        showSizeChanger: false,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} của ${total} sản phẩm`,
      }}
      className="overflow-x-auto"
    />
  );
}
