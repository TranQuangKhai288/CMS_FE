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
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { rolesApi } from "@/apis/roles";
import type { Role } from "../types";
import RoleDialog from "../components/RoleDialog";
import DeleteRoleDialog from "../components/DeleteRoleDialog";

const { Title } = Typography;
const { Search } = Input;

export default function RolesPage() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [limit] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["roles", page, searchText, limit],
    queryFn: () => rolesApi.getRoles({ page, pageSize: limit, search: searchText }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      rolesApi.updateRole(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
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

  const handleAddRole = () => {
    setSelectedRole(null);
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = (role: Role) => {
    toggleStatusMutation.mutate({ id: role.id, isActive: role.isActive });
  };

  const columns: ColumnsType<Role> = [
    {
      title: "Tên vai trò",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Role) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium text-indigo-600">{name}</span>
          <span className="text-xs text-gray-400 font-mono">{record.slug}</span>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => <span className="text-gray-500">{desc || "—"}</span>,
    },
    {
      title: "Quyền hạn",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: string[]) => (
        <Space wrap size={[0, 4]}>
          {permissions.includes("*") ? (
            <Tag color="gold" icon={<SafetyCertificateOutlined />}>Full Access</Tag>
          ) : (
            permissions.slice(0, 3).map(p => (
              <Tag key={p} className="text-[10px]">{p}</Tag>
            ))
          )}
          {permissions.length > 3 && !permissions.includes("*") && (
            <Tag className="text-[10px]">+{permissions.length - 3} more</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "status",
      render: (isActive: boolean, record: Role) => (
        <Tag
          color={isActive ? "green" : "default"}
          className="cursor-pointer select-none"
          onClick={() => handleToggleStatus(record)}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 140,
      render: (_: any, record: Role) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
              className="text-indigo-600 hover:text-indigo-700!"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteRole(record)}
              disabled={record.slug === 'admin'}
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
        description="Không thể tải danh sách vai trò. Vui lòng thử lại sau."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Title level={3} className="mb-0!">
            Quản lý Vai trò & Phân quyền
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRole}
            size="large"
            className="bg-indigo-600!"
          >
            Thêm Vai trò
          </Button>
        </div>

        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm vai trò hoặc slug..."
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
          }}
          className="overflow-x-auto"
        />
      </Card>

      <RoleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        role={selectedRole}
      />

      <DeleteRoleDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        role={selectedRole}
      />
    </div>
  );
}
