import { useQuery } from "@tanstack/react-query";
import { Card, Button, Input, Select, Alert, Space, Typography } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { ordersApi } from "@/apis/orders";
import { useOrdersManagement } from "../hooks/useOrdersManagement";
import OrdersTable from "../components/OrdersTable";
import type { OrderStatus, PaymentStatus } from "../types";
import { lazy, Suspense } from "react";

// ⚡ LAZY LOAD dialogs - Chỉ load khi cần
const OrderDetailDialog = lazy(() => import("../components/OrderDetailDialog"));
const UpdateStatusDialog = lazy(() => import("../components/UpdateStatusDialog"));
const CancelOrderDialog = lazy(() => import("../components/CancelOrderDialog"));

const { Title } = Typography;
const { Search } = Input;

const statusOptions = [
    { label: "Tất cả", value: "" },
    { label: "Chờ xử lý", value: "PENDING" },
    { label: "Đã xác nhận", value: "CONFIRMED" },
    { label: "Đang xử lý", value: "PROCESSING" },
    { label: "Đang giao", value: "SHIPPED" },
    { label: "Đã giao", value: "DELIVERED" },
    { label: "Đã hủy", value: "CANCELLED" },
    { label: "Đã hoàn tiền", value: "REFUNDED" },
];

const paymentStatusOptions = [
    { label: "Tất cả", value: "" },
    { label: "Chờ thanh toán", value: "PENDING" },
    { label: "Đã thanh toán", value: "PAID" },
    { label: "Thất bại", value: "FAILED" },
    { label: "Đã hoàn tiền", value: "REFUNDED" },
    { label: "Hoàn 1 phần", value: "PARTIALLY_REFUNDED" },
];

export default function OrdersPage() {
    const {
        page,
        searchText,
        statusFilter,
        paymentStatusFilter,
        isViewDialogOpen,
        isUpdateStatusDialogOpen,
        isCancelDialogOpen,
        selectedOrder,
        setPage,
        handleSearch,
        handleStatusFilter,
        handlePaymentStatusFilter,
        handleViewOrder,
        handleUpdateStatus,
        handleCancelOrder,
        handleCloseViewDialog,
        handleCloseUpdateStatusDialog,
        handleCloseCancelDialog,
    } = useOrdersManagement();

    const limit = 10;

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["orders", page, searchText, statusFilter, paymentStatusFilter, limit],
        queryFn: async () => {
            const result = await ordersApi.getOrders({
                page,
                pageSize: limit,
                search: searchText,
                status: statusFilter || undefined,
                paymentStatus: paymentStatusFilter || undefined,
            });
            return result;
        },
        // ❌ REMOVED: refetchInterval causing 150ms unmount delay
        // refetchInterval: 30 * 1000,
        placeholderData: (previousData) => previousData,
    });

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <Title level={3} className="mb-0!">
                        Quản lý Đơn Hàng
                    </Title>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        loading={isLoading}
                    >
                        Làm mới
                    </Button>
                </div>

                <div className="space-y-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Search
                            placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            className="flex-1 max-w-md"
                        />
                        <Space>
                            <Select
                                placeholder="Trạng thái đơn"
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(value) => handleStatusFilter(value as OrderStatus | "")}
                                style={{ width: 180 }}
                                size="large"
                            />
                            <Select
                                placeholder="Trạng thái TT"
                                options={paymentStatusOptions}
                                value={paymentStatusFilter}
                                onChange={(value) =>
                                    handlePaymentStatusFilter(value as PaymentStatus | "")
                                }
                                style={{ width: 180 }}
                                size="large"
                            />
                        </Space>
                    </div>
                </div>

                <OrdersTable
                    data={data?.data || []}
                    loading={isLoading}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total: data?.pagination?.total || 0,
                        onChange: (newPage) => setPage(newPage),
                    }}
                    onView={handleViewOrder}
                    onUpdateStatus={handleUpdateStatus}
                    onCancel={handleCancelOrder}
                />

                {isError && (
                    <Alert
                        message="Lỗi tải dữ liệu"
                        description="Không thể tải danh sách đơn hàng. Vui lòng thử lại."
                        type="error"
                        showIcon
                        className="mt-4"
                    />
                )}
            </Card>

            {/* Dialogs - Lazy loaded với Suspense */}
            <Suspense fallback={null}>
                {isViewDialogOpen && (
                    <OrderDetailDialog
                        isOpen={isViewDialogOpen}
                        onClose={handleCloseViewDialog}
                        order={selectedOrder}
                    />
                )}
                {isUpdateStatusDialogOpen && (
                    <UpdateStatusDialog
                        isOpen={isUpdateStatusDialogOpen}
                        onClose={handleCloseUpdateStatusDialog}
                        order={selectedOrder}
                    />
                )}
                {isCancelDialogOpen && (
                    <CancelOrderDialog
                        isOpen={isCancelDialogOpen}
                        onClose={handleCloseCancelDialog}
                        order={selectedOrder}
                    />
                )}
            </Suspense>
        </div>
    );
}
