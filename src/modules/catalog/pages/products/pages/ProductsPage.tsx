import { useQuery } from "@tanstack/react-query";
import { Button, Input, Card, Typography, Alert } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { productsApi } from "../../../apis/products";
import ProductDialog from "../components/ProductDialog";
import DeleteProductDialog from "../components/DeleteProductDialog";
import ProductsTable from "../components/ProductsTable";
import { useProductsManagement } from "../hooks/useProductsManagement";

const { Title } = Typography;
const { Search } = Input;

export default function ProductsPage() {
  const {
    page,
    searchText,
    limit,
    isDialogOpen,
    isDeleteDialogOpen,
    selectedProduct,
    setPage,
    handleSearch,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleCloseDialog,
    handleCloseDeleteDialog,
  } = useProductsManagement();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page, searchText, limit],
    queryFn: () => productsApi.getProducts({ page, limit, search: searchText }),
  });

  if (isError) {
    return (
      <Alert
        message="Lỗi"
        description="Không thể tải danh sách products. Vui lòng thử lại sau."
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
            Quản lý Products
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
            size="large"
          >
            Thêm Product
          </Button>
        </div>

        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm theo tên hoặc SKU..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            className="max-w-md"
          />
        </div>

        <ProductsTable
          data={data?.data || []}
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.pagination?.total || 0,
            onChange: (newPage) => setPage(newPage),
          }}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </Card>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        product={selectedProduct}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        product={selectedProduct}
      />
    </div>
  );
}
