import { Card, Input, Button, Select, Alert } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { discountsApi } from "@/apis/discounts";
import { useDiscountsManagement } from "../hooks/useDiscountsManagement";
import DiscountsTable from "../components/DiscountsTable";
import { lazy, Suspense } from "react";

// ⚡ Lazy load dialogs để tối ưu performance
const DiscountDialog = lazy(() => import("../components/DiscountDialog"));
const DeleteDiscountDialog = lazy(() => import("../components/DeleteDiscountDialog"));
const DiscountDetailDialog = lazy(() => import("../components/DiscountDetailDialog"));

const { Search } = Input;

export default function DiscountsPage() {
    const {
        page,
        searchText,
        typeFilter,
        isActiveFilter,
        selectedDiscount,
        isDialogOpen,
        isDeleteDialogOpen,
        isViewDialogOpen,
        handleSearch,
        handleTypeFilterChange,
        handleActiveFilterChange,
        handlePageChange,
        handleAdd,
        handleEdit,
        handleView,
        handleDelete,
        handleCloseDialog,
        handleCloseDeleteDialog,
        handleCloseViewDialog,
    } = useDiscountsManagement();

    // Fetch discounts với React Query
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["discounts", page, searchText, typeFilter, isActiveFilter],
        queryFn: () =>
            discountsApi.getDiscounts({
                page,
                pageSize: 10,
                search: searchText || undefined,
                type: typeFilter !== "all" ? (typeFilter as any) : undefined,
                isActive: isActiveFilter !== "all" ? isActiveFilter === "active" : undefined,
            }),
        placeholderData: (previousData) => previousData, // ⚡ Smooth transition
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                >
                    Thêm mã giảm giá
                </Button>
            </div>

            <Card>
                {/* Filters */}
                <div className="mb-4 flex gap-4 flex-wrap">
                    <Search
                        placeholder="Tìm theo mã hoặc tên..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Select
                        value={typeFilter}
                        onChange={handleTypeFilterChange}
                        style={{ width: 200 }}
                    >
                        <Select.Option value="all">Tất cả loại</Select.Option>
                        <Select.Option value="PERCENTAGE">Phần trăm</Select.Option>
                        <Select.Option value="FIXED_AMOUNT">Số tiền cố định</Select.Option>
                        <Select.Option value="FREE_SHIPPING">Miễn phí ship</Select.Option>
                    </Select>
                    <Select
                        value={isActiveFilter}
                        onChange={handleActiveFilterChange}
                        style={{ width: 150 }}
                    >
                        <Select.Option value="all">Tất cả</Select.Option>
                        <Select.Option value="active">Hoạt động</Select.Option>
                        <Select.Option value="inactive">Tắt</Select.Option>
                    </Select>
                </div>

                {/* Error Alert */}
                {isError && (
                    <Alert
                        message="Lỗi"
                        description={
                            (error as any)?.response?.data?.message ||
                            "Không thể tải danh sách mã giảm giá!"
                        }
                        type="error"
                        showIcon
                        className="mb-4"
                    />
                )}

                {/* Table */}
                <DiscountsTable
                    data={data?.data || []}
                    loading={isLoading}
                    pagination={{
                        current: page,
                        pageSize: 10,
                        total: data?.pagination?.total || 0,
                        onChange: handlePageChange,
                    }}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Card>

            {/* Dialogs - Lazy loaded */}
            <Suspense fallback={null}>
                {isDialogOpen && (
                    <DiscountDialog
                        isOpen={isDialogOpen}
                        onClose={handleCloseDialog}
                        discount={selectedDiscount}
                    />
                )}
                {isDeleteDialogOpen && (
                    <DeleteDiscountDialog
                        isOpen={isDeleteDialogOpen}
                        onClose={handleCloseDeleteDialog}
                        discount={selectedDiscount}
                    />
                )}
                {isViewDialogOpen && (
                    <DiscountDetailDialog
                        isOpen={isViewDialogOpen}
                        onClose={handleCloseViewDialog}
                        discount={selectedDiscount}
                    />
                )}
            </Suspense>
        </div>
    );
}
