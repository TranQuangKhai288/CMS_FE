import { Table, Button, Space, Tooltip, Avatar, Tag, Switch, message } from "antd";
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/apis/customers";
import type { Customer } from "../types";
import { useMemo } from "react";

interface CustomersTableProps {
    data: Customer[];
    loading: boolean;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number) => void;
    };
    onView: (customer: Customer) => void;
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
}

export default function CustomersTable({
    data,
    loading,
    pagination,
    onView,
    onEdit,
    onDelete,
}: CustomersTableProps) {
    const queryClient = useQueryClient();

    // Mutation để toggle active status
    const toggleStatusMutation = useMutation({
        mutationFn: (customer: Customer) =>
            customersApi.updateCustomer(customer.id, {
                isActive: !customer.isActive,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            message.success("Cập nhật trạng thái thành công!");
        },
        onError: () => {
            message.error("Cập nhật trạng thái thất bại!");
        },
    });

    const handleToggleStatus = (customer: Customer) => {
        toggleStatusMutation.mutate(customer);
    };

    // ⚡ CRITICAL: Memoize columns để tránh re-create mỗi render
    const columns = useMemo<ColumnsType<Customer>>(() => [
        {
            title: "Khách hàng",
            key: "customer",
            width: 250,
            render: (_, record: Customer) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={record.avatar}
                        icon={<UserOutlined />}
                        size={40}
                        className="flex-shrink-0"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="font-medium truncate">
                            {record.firstName} {record.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {record.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 140,
            render: (phone: string) => phone || "-",
        },
        {
            title: "Tổng đơn",
            dataIndex: "totalOrders",
            key: "totalOrders",
            width: 100,
            align: "center",
            render: (total: number) => (
                <Tag color={total > 0 ? "blue" : "default"}>{total}</Tag>
            ),
        },
        {
            title: "Tổng chi tiêu",
            dataIndex: "totalSpent",
            key: "totalSpent",
            width: 150,
            align: "right",
            render: (spent: number) => (
                <span className="font-semibold text-green-600">
                    {spent.toLocaleString("vi-VN")} ₫
                </span>
            ),
        },
        {
            title: "Điểm thưởng",
            dataIndex: "loyaltyPoints",
            key: "loyaltyPoints",
            width: 120,
            align: "center",
            render: (points: number) => (
                <Tag color="gold">{points.toLocaleString()}</Tag>
            ),
        },
        {
            title: "Trạng thái",
            key: "isActive",
            width: 120,
            align: "center",
            render: (_, record: Customer) => (
                <Tag color={record.isActive ? "green" : "default"}>
                    {record.isActive ? "Hoạt động" : "Tắt"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            width: 140,
            fixed: "right",
            render: (_, record: Customer) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => onView(record)}
                            className="text-blue-600 hover:text-blue-700!"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                            className="text-green-600 hover:text-green-700!"
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
                            checked={record.isActive}
                            onChange={() => handleToggleStatus(record)}
                            size="small"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ], [onView, onEdit, onDelete, handleToggleStatus]);

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
                    `${range[0]}-${range[1]} của ${total} khách hàng`,
            }}
            scroll={{ x: 1200 }}
            className="overflow-x-auto"
        />
    );
}
