import { Modal, Table, Tag, DatePicker, Select, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi, type InventoryLog, type InventoryLogType } from "@/apis/inventory";
import { useState, useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface InventoryHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string | null;
    productName?: string;
}

// Type configuration for badges
const TYPE_CONFIG: Record<
    InventoryLogType,
    { color: string; icon: string; label: string }
> = {
    PURCHASE: { color: "green", icon: "📦", label: "Nhập hàng" },
    SALE: { color: "blue", icon: "🛒", label: "Bán hàng" },
    RETURN: { color: "orange", icon: "↩️", label: "Trả hàng" },
    ADJUSTMENT: { color: "purple", icon: "⚙️", label: "Điều chỉnh" },
    DAMAGE: { color: "red", icon: "⚠️", label: "Hư hỏng" },
};

export default function InventoryHistoryDialog({
    isOpen,
    onClose,
    productId,
    productName,
}: InventoryHistoryDialogProps) {
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
        null,
        null,
    ]);

    // Fetch inventory logs
    const { data, isLoading } = useQuery({
        queryKey: [
            "inventory-logs",
            productId,
            page,
            typeFilter,
            dateRange[0]?.toISOString(),
            dateRange[1]?.toISOString(),
        ],
        queryFn: () =>
            inventoryApi.getLogs({
                productId: productId || undefined,
                page,
                pageSize: 10,
                type: typeFilter !== "all" ? (typeFilter as InventoryLogType) : undefined,
                startDate: dateRange[0]?.toISOString(),
                endDate: dateRange[1]?.toISOString(),
                sortBy: "createdAt",
                sortOrder: "desc",
            }),
        enabled: isOpen && !!productId,
    });

    const columns = useMemo<ColumnsType<InventoryLog>>(
        () => [
            {
                title: "Thời gian",
                dataIndex: "createdAt",
                key: "createdAt",
                width: 180,
                render: (date: string) => (
                    <div>
                        <div className="font-medium">
                            {dayjs(date).format("DD/MM/YYYY")}
                        </div>
                        <div className="text-xs text-gray-500">
                            {dayjs(date).format("HH:mm:ss")}
                        </div>
                    </div>
                ),
            },
            {
                title: "Loại",
                dataIndex: "type",
                key: "type",
                width: 150,
                align: "center",
                render: (type: InventoryLogType) => {
                    const config = TYPE_CONFIG[type];
                    return (
                        <Tag color={config.color}>
                            {config.icon} {config.label}
                        </Tag>
                    );
                },
            },
            {
                title: "Số lượng",
                dataIndex: "quantity",
                key: "quantity",
                width: 100,
                align: "right",
                render: (quantity: number) => (
                    <span
                        className={`font-semibold ${quantity > 0 ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {quantity > 0 ? "+" : ""}
                        {quantity}
                    </span>
                ),
            },
            {
                title: "Thay đổi",
                key: "change",
                width: 150,
                align: "center",
                render: (_, record: InventoryLog) => (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-600">{record.before}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-blue-600">{record.after}</span>
                    </div>
                ),
            },
            {
                title: "Ghi chú",
                dataIndex: "note",
                key: "note",
                ellipsis: true,
                render: (note: string | null) => (
                    <span className="text-gray-600">
                        {note || <span className="italic text-gray-400">Không có</span>}
                    </span>
                ),
            },
        ],
        []
    );

    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates || [null, null]);
        setPage(1);
    };

    const handleTypeFilterChange = (value: string) => {
        setTypeFilter(value);
        setPage(1);
    };

    return (
        <Modal
            title={
                <div>
                    <div className="text-lg font-semibold">Lịch sử tồn kho</div>
                    {productName && (
                        <div className="text-sm text-gray-500 font-normal mt-1">
                            {productName}
                        </div>
                    )}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={900}
        >
            <div className="py-4">
                {/* Filters */}
                <Space className="mb-4" wrap>
                    <Select
                        value={typeFilter}
                        onChange={handleTypeFilterChange}
                        style={{ width: 180 }}
                    >
                        <Select.Option value="all">Tất cả loại</Select.Option>
                        <Select.Option value="PURCHASE">📦 Nhập hàng</Select.Option>
                        <Select.Option value="SALE">🛒 Bán hàng</Select.Option>
                        <Select.Option value="RETURN">↩️ Trả hàng</Select.Option>
                        <Select.Option value="ADJUSTMENT">⚙️ Điều chỉnh</Select.Option>
                        <Select.Option value="DAMAGE">⚠️ Hư hỏng</Select.Option>
                    </Select>

                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        format="DD/MM/YYYY"
                        placeholder={["Từ ngày", "Đến ngày"]}
                    />
                </Space>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={data?.data || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        current: page,
                        pageSize: 10,
                        total: data?.pagination?.total || 0,
                        onChange: setPage,
                        showSizeChanger: false,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} bản ghi`,
                    }}
                    scroll={{ x: 800 }}
                />
            </div>
        </Modal>
    );
}
