import { Table, Button, Space, Tag, Tooltip, Progress } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Discount } from "../types";
import { useMemo } from "react";

interface DiscountsTableProps {
    data: Discount[];
    loading: boolean;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number) => void;
    };
    onView: (discount: Discount) => void;
    onEdit: (discount: Discount) => void;
    onDelete: (discount: Discount) => void;
}

export default function DiscountsTable({
    data,
    loading,
    pagination,
    onView,
    onEdit,
    onDelete,
}: DiscountsTableProps) {
    // ⚡ CRITICAL: Memoize columns để tránh re-create mỗi render
    const columns = useMemo<ColumnsType<Discount>>(() => [
        {
            title: "Mã giảm giá",
            dataIndex: "code",
            key: "code",
            width: 150,
            render: (text: string) => (
                <span className="font-mono font-semibold text-blue-600">{text}</span>
            ),
        },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            width: 200,
        },
        {
            title: "Loại",
            key: "type",
            width: 150,
            align: "center",
            render: (_, record: Discount) => {
                const typeConfig = {
                    PERCENTAGE: { color: "blue", text: "Phần trăm" },
                    FIXED_AMOUNT: { color: "green", text: "Số tiền cố định" },
                    FREE_SHIPPING: { color: "purple", text: "Miễn phí ship" },
                };
                const config = typeConfig[record.type as keyof typeof typeConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: "Giá trị",
            key: "value",
            width: 120,
            align: "right",
            render: (_, record: Discount) => {
                if (record.type === "PERCENTAGE") {
                    return <span className="font-semibold text-blue-600">{record.value}%</span>;
                } else if (record.type === "FIXED_AMOUNT") {
                    return (
                        <span className="font-semibold text-green-600">
                            {record.value.toLocaleString("vi-VN")} ₫
                        </span>
                    );
                } else {
                    return <Tag color="purple">Miễn phí</Tag>;
                }
            },
        },
        {
            title: "Sử dụng",
            key: "usage",
            width: 150,
            render: (_, record: Discount) => {
                if (!record.usageLimit) {
                    return <span className="text-gray-500">Không giới hạn</span>;
                }
                const percent = (record.usageCount / record.usageLimit) * 100;
                return (
                    <div>
                        <div className="text-xs text-gray-600 mb-1">
                            {record.usageCount} / {record.usageLimit}
                        </div>
                        <Progress
                            percent={percent}
                            size="small"
                            status={percent >= 100 ? "exception" : "active"}
                            showInfo={false}
                        />
                    </div>
                );
            },
        },
        {
            title: "Thời gian",
            key: "validity",
            width: 180,
            render: (_, record: Discount) => {
                const start = new Date(record.startDate);
                const end = new Date(record.endDate);
                const now = new Date();

                const isExpired = now > end;
                const isUpcoming = now < start;

                return (
                    <div className="flex flex-col gap-1">
                        <div className="text-xs">
                            {start.toLocaleDateString("vi-VN")} → {end.toLocaleDateString("vi-VN")}
                        </div>
                        {isExpired && <Tag color="red">Hết hạn</Tag>}
                        {isUpcoming && <Tag color="orange">Sắp diễn ra</Tag>}
                    </div>
                );
            },
        },
        {
            title: "Trạng thái",
            key: "isActive",
            width: 120,
            align: "center",
            render: (_, record: Discount) => (
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
            fixed: "right",
            render: (_, record: Discount) => (
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
                </Space>
            ),
        },
    ], [onView, onEdit, onDelete]);

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
                    `${range[0]}-${range[1]} của ${total} mã giảm giá`,
            }}
            scroll={{ x: 1200 }}
            className="overflow-x-auto"
        />
    );
}
