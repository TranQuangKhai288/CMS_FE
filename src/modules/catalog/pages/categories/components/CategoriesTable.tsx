import { Table, Button, Space, Tag, Tooltip, Switch, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../../apis/categories";
import type { Category } from "../types";

interface CategoriesTableProps {
  data: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoriesTable({
  data,
  loading,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const queryClient = useQueryClient();

  // Mutation để toggle status (cần thêm API này)
  const toggleStatusMutation = useMutation({
    mutationFn: (category: Category) =>
      categoriesApi.updateCategory(category.id, {
        isActive: !category.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesTree"] });
      message.success("Cập nhật trạng thái thành công");
    },
    onError: () => {
      message.error("Cập nhật trạng thái thất bại");
    },
  });

  const handleToggleStatus = (category: Category) => {
    toggleStatusMutation.mutate(category);
  };

  const columns: ColumnsType<Category> = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text: string, record: Category) => (
        <div className="flex flex-col gap-1">
          <div className="font-medium text-base">{text}</div>
          {record.slug && (
            <div className="text-gray-500 text-xs">/{record.slug}</div>
          )}
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => (
        <div className="text-sm text-gray-600">{text || "-"}</div>
      ),
    },
    {
      title: "Cấp độ",
      dataIndex: "level",
      key: "level",
      width: 100,
      align: "center",
      render: (level: number) => <Tag color="blue">Cấp {level ?? 0}</Tag>,
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      width: 100,
      align: "center",
      render: (order: number) => order ?? 0,
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 120,
      align: "center",
      render: (_: any, record: Category) => (
        <Tag color={record.isActive ? "green" : "default"}>
          {record.isActive ? "Hoạt động" : "Tắt"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 140,
      render: (_: any, record: Category) => (
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
      pagination={false}
      className="overflow-x-auto"
      expandable={{
        childrenColumnName: "children",
        defaultExpandAllRows: true,
      }}
    />
  );
}
