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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { usersApi } from "../api";
import UserDialog from "../components/UserDialog";
import DeleteUserDialog from "../components/DeleteUserDialog";
import type { User } from "../types";

const { Title } = Typography;
const { Search } = Input;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [limit] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", page, searchText, limit],
    queryFn: () => usersApi.getUsers({ page, limit, search: searchText }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    toggleStatusMutation.mutate(user.id);
  };

  const columns: ColumnsType<User> = [
    {
      title: "Họ và Tên",
      dataIndex: "firstName",
      key: "name",
      render: (firstName: string, record: User) => (
        <span className="font-medium">
          {firstName} {record.lastName || ""}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: ["role", "name"],
      key: "role",
      render: (name: string) => (
        <Tag color="blue" className="uppercase">
          {name || "User"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "status",
      render: (isActive: boolean, record: User) => (
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
      width: 120,
      render: (_: any, record: User) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
              className="text-blue-600 hover:text-blue-700!"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUser(record)}
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
        description="Không thể tải danh sách users. Vui lòng thử lại sau."
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
            Quản lý Users
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
            size="large"
          >
            Thêm User
          </Button>
        </div>

        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm theo tên hoặc email..."
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
              `${range[0]}-${range[1]} của ${total} users`,
          }}
          className="overflow-x-auto"
        />
      </Card>

      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        user={selectedUser}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
