import { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Button, Input, Tag, Typography, Alert, Space, Tooltip } from "antd";
import {
    SearchOutlined,
    ReloadOutlined,
    HistoryOutlined,
    EditOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { inventoryApi } from "@/apis/inventory";
import type { LowStockProduct } from "@/apis/inventory";

// ⚡ Lazy load dialogs (already exist in inventory module)
const AdjustStockDialog = lazy(
    () => import("@/modules/inventory/components/AdjustStockDialog")
);
const InventoryHistoryDialog = lazy(
    () => import("@/modules/inventory/components/InventoryHistoryDialog")
);

const { Title } = Typography;
const { Search } = Input;

interface ProductWithStock {
    id: string;
    name: string;
    sku: string;
    stock: number;
    lowStock: number;
    status: string;
    category: { id: string; name: string };
    basePrice: number;
    salePrice?: number;
}

export default function InventoryPage() {
    const [page, setPage] = useState(1);
    const [searchText, _setSearchText] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
    const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

    const limit = 15;

    // Fetch inventory list (products with stock info)
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["inventory", page, searchText, limit],
        queryFn: () =>
            inventoryApi.getLogs({
                page,
                pageSize: limit,
            }),
        placeholderData: (prev) => prev,
    });

    // Fetch low stock products
    const { data: lowStockData } = useQuery({
        queryKey: ["inventory-low-stock"],
        queryFn: () => inventoryApi.getLowStockProducts(),
        staleTime: 5 * 60 * 1000,
    });

    // Fetch inventory stats
    const { data: statsData } = useQuery({
        queryKey: ["inventory-stats"],
        queryFn: () => inventoryApi.getStats(),
        staleTime: 5 * 60 * 1000,
    });

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPage(1);
    };

    const handleAdjustStock = (product: any) => {
        setSelectedProduct(product);
        setIsAdjustDialogOpen(true);
    };

    const handleViewHistory = (product: any) => {
        setSelectedProduct(product);
        setIsHistoryDialogOpen(true);
    };

    const columns: ColumnsType<any> = [
        {
            title: "Sản phẩm",
            key: "product",
            render: (_: any, record: any) => {
                const product = record.product || record;
                return (
                    <div>
                        <span className="font-medium block">{product?.name || record.note || "N/A"}</span>
                        <span className="text-xs text-gray-400">
                            SKU: {product?.sku || "—"}
                        </span>
                    </div>
                );
            },
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            width: 120,
            render: (type: string) => {
                const typeMap: Record<string, { label: string; color: string }> = {
                    PURCHASE: { label: "Nhập hàng", color: "green" },
                    SALE: { label: "Bán hàng", color: "blue" },
                    RETURN: { label: "Trả hàng", color: "orange" },
                    ADJUSTMENT: { label: "Điều chỉnh", color: "purple" },
                    DAMAGE: { label: "Hư hỏng", color: "red" },
                };
                const info = typeMap[type] || { label: type, color: "default" };
                return <Tag color={info.color}>{info.label}</Tag>;
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            align: "center",
            render: (qty: number) => (
                <span className={`font-bold ${qty > 0 ? "text-green-600" : "text-red-600"}`}>
                    {qty > 0 ? `+${qty}` : qty}
                </span>
            ),
        },
        {
            title: "Trước",
            dataIndex: "before",
            key: "before",
            width: 80,
            align: "center",
        },
        {
            title: "Sau",
            dataIndex: "after",
            key: "after",
            width: 80,
            align: "center",
            render: (val: number) => <span className="font-medium">{val}</span>,
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            key: "note",
            ellipsis: true,
            width: 180,
            render: (note: string) => note || "—",
        },
        {
            title: "Thời gian",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: (date: string) =>
                new Date(date).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
        },
    ];

    const lowStockCount = (lowStockData?.data as LowStockProduct[] | undefined)?.length || 0;

    return (
        <div className="space-y-6">
            {/* Low Stock Alert Banner */}
            {lowStockCount > 0 && (
                <Alert
                    message={
                        <Space>
                            <WarningOutlined />
                            <span>
                                <strong>{lowStockCount}</strong> sản phẩm đang ở mức tồn kho thấp
                            </span>
                        </Space>
                    }
                    type="warning"
                    showIcon={false}
                    banner
                />
            )}

            {/* Stats Cards */}
            {statsData?.data && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="shadow-sm" style={{ borderLeft: "4px solid #6366f1" }}>
                        <div className="text-gray-500 text-sm">Tổng giao dịch kho</div>
                        <div className="text-2xl font-bold text-indigo-600 mt-1">
                            {(statsData.data as any).totalTransactions || 0}
                        </div>
                    </Card>
                    <Card className="shadow-sm" style={{ borderLeft: "4px solid #22c55e" }}>
                        <div className="text-gray-500 text-sm">Tổng nhập hàng</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                            {(statsData.data as any).totalPurchases || 0}
                        </div>
                    </Card>
                    <Card className="shadow-sm" style={{ borderLeft: "4px solid #ef4444" }}>
                        <div className="text-gray-500 text-sm">Sản phẩm hết hàng</div>
                        <div className="text-2xl font-bold text-red-600 mt-1">
                            {(statsData.data as any).outOfStock || lowStockCount}
                        </div>
                    </Card>
                </div>
            )}

            {/* Inventory Log Table */}
            <Card className="shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <Title level={3} className="mb-0!">
                        Lịch sử Kho hàng
                    </Title>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        loading={isLoading}
                    >
                        Làm mới
                    </Button>
                </div>

                <div className="mb-4">
                    <Search
                        placeholder="Tìm kiếm theo tên sản phẩm, SKU..."
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
                            `${range[0]}-${range[1]} của ${total} bản ghi`,
                    }}
                    className="overflow-x-auto"
                    size="small"
                />

                {isError && (
                    <Alert
                        message="Lỗi tải dữ liệu"
                        description="Không thể tải lịch sử kho hàng. Vui lòng thử lại."
                        type="error"
                        showIcon
                        className="mt-4"
                    />
                )}
            </Card>

            {/* Lazy-loaded Dialogs */}
            <Suspense fallback={null}>
                {isAdjustDialogOpen && selectedProduct && (
                    <AdjustStockDialog
                        isOpen={isAdjustDialogOpen}
                        onClose={() => setIsAdjustDialogOpen(false)}
                        product={selectedProduct as any}
                    />
                )}
                {isHistoryDialogOpen && selectedProduct && (
                    <InventoryHistoryDialog
                        isOpen={isHistoryDialogOpen}
                        onClose={() => setIsHistoryDialogOpen(false)}
                        product={selectedProduct as any}
                    />
                )}
            </Suspense>
        </div>
    );
}
