import { useQuery } from "@tanstack/react-query";
import { Card, Button, Input, Select, Alert, Typography } from "antd";
import { PlusOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { customersApi } from "@/apis/customers";
import { useCustomersManagement } from "../hooks/useCustomersManagement";
import CustomersTable from "../components/CustomersTable";
import { lazy, Suspense } from "react";

// ⚡ LAZY LOAD dialogs
const CustomerDialog = lazy(() => import("../components/CustomerDialog"));
const DeleteCustomerDialog = lazy(() => import("../components/DeleteCustomerDialog"));
const CustomerDetailDialog = lazy(() => import("../components/CustomerDetailDialog"));

const { Title } = Typography;
const { Search } = Input;

const activeFilterOptions = [
    { label: "Tất cả", value: undefined },
    { label: "Hoạt động", value: true },
    { label: "Tắt", value: false },
];

export default function CustomersPage() {
    const {
        page,
        searchText,
        isActiveFilter,
        isDialogOpen,
        isDeleteDialogOpen,
        isViewDialogOpen,
        selectedCustomer,
        setPage,
        handleSearch,
        handleIsActiveFilter,
        handleAddCustomer,
        handleEditCustomer,
        handleDeleteCustomer,
        handleViewCustomer,
        handleCloseDialog,
        handleCloseDeleteDialog,
        handleCloseViewDialog,
    } = useCustomersManagement();

    const limit = 10;

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["customers", page, searchText, isActiveFilter, limit],
        queryFn: () =>
            customersApi.getCustomers({
                page,
                pageSize: limit,
                search: searchText,
                isActive: isActiveFilter,
            }),
        placeholderData: (previousData) => previousData, // Hiển thị data cũ ngay lập tức
    });

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <Title level={3} className="mb-0!">
                        Quản lý Khách Hàng
                    </Title>
                    <div className="flex gap-2">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => refetch()}
                            loading={isLoading}
                        >
                            Làm mới
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddCustomer}
                        >
                            Thêm khách hàng
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <Search
                        placeholder="Tìm kiếm theo tên, email..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        className="flex-1 max-w-md"
                    />
                    <Select
                        placeholder="Trạng thái"
                        options={activeFilterOptions}
                        value={isActiveFilter}
                        onChange={handleIsActiveFilter}
                        style={{ width: 150 }}
                        size="large"
                    />
                </div>

                <CustomersTable
                    data={data?.data || []}
                    loading={isLoading}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total: data?.pagination?.total || 0,
                        onChange: (newPage) => setPage(newPage),
                    }}
                    onView={handleViewCustomer}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteCustomer}
                />

                {isError && (
                    <Alert
                        message="Lỗi tải dữ liệu"
                        description="Không thể tải danh sách khách hàng. Vui lòng thử lại."
                        type="error"
                        showIcon
                        className="mt-4"
                    />
                )}
            </Card>

            {/* Dialogs - Lazy loaded */}
            <Suspense fallback={null}>
                {isDialogOpen && (
                    <CustomerDialog
                        isOpen={isDialogOpen}
                        onClose={handleCloseDialog}
                        customer={selectedCustomer}
                    />
                )}
                {isDeleteDialogOpen && (
                    <DeleteCustomerDialog
                        isOpen={isDeleteDialogOpen}
                        onClose={handleCloseDeleteDialog}
                        customer={selectedCustomer}
                    />
                )}
                {isViewDialogOpen && (
                    <CustomerDetailDialog
                        isOpen={isViewDialogOpen}
                        onClose={handleCloseViewDialog}
                        customer={selectedCustomer}
                    />
                )}
            </Suspense>
        </div>
    );
}
