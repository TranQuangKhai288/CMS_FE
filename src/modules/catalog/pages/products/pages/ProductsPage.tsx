import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Input, Card, Typography, Alert, Select, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { productsApi } from "@/apis/products";
import ProductDialog from "../components/ProductDialog";
import DeleteProductDialog from "../components/DeleteProductDialog";
import ProductsTable from "../components/ProductsTable";
import { useProductsManagement } from "../hooks/useProductsManagement";
import AdjustStockDialog from "@/modules/inventory/components/AdjustStockDialog";
import InventoryHistoryDialog from "@/modules/inventory/components/InventoryHistoryDialog";
import LowStockAlert from "@/modules/inventory/components/LowStockAlert";
import type { Product } from "../types";

const { Title } = Typography;
const { Search } = Input;

export default function ProductsPage() {
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedProductForInventory, setSelectedProductForInventory] =
    useState<Product | null>(null);

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

  // Inventory handlers
  const handleAdjustStock = (product: Product) => {
    setSelectedProductForInventory(product);
    setIsAdjustStockDialogOpen(true);
  };

  const handleViewHistory = (product: Product) => {
    setSelectedProductForInventory(product);
    setIsHistoryDialogOpen(true);
  };

  const handleCloseAdjustStockDialog = () => {
    setIsAdjustStockDialogOpen(false);
    setSelectedProductForInventory(null);
  };

  const handleCloseHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
    setSelectedProductForInventory(null);
  };

  const handleViewLowStock = () => {
    setStockFilter("low");
  };

  const handleViewOutOfStock = () => {
    setStockFilter("out");
  };

  // Filter products by stock status
  const filteredProducts =
    data?.data?.filter((product: Product) => {
      if (stockFilter === "low") {
        const stock = product.stock || 0;
        const lowStock = product.lowStock || 10;
        return stock > 0 && stock <= lowStock;
      }
      if (stockFilter === "out") {
        return (product.stock || 0) === 0;
      }
      return true;
    }) || [];

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
            Quản lý sản phẩm
            {data?.pagination?.total !== undefined && (
              <span className="ml-2 text-gray-500 text-base font-normal">
                ({data.pagination.total} sản phẩm)
              </span>
            )}
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
            size="large"
          >
            Thêm sản phẩm
          </Button>
        </div>

        {/* Low Stock Alert */}
        <LowStockAlert
          onViewLowStock={handleViewLowStock}
          onViewOutOfStock={handleViewOutOfStock}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <Space size="middle" wrap className="flex-1">
            <Search
              placeholder="Tìm kiếm theo tên hoặc SKU..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              className="max-w-md"
            />
            <Select
              value={stockFilter}
              onChange={setStockFilter}
              size="large"
              style={{ width: 180 }}
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="low">🟠 Sắp hết hàng</Select.Option>
              <Select.Option value="out">🔴 Hết hàng</Select.Option>
            </Select>
          </Space>
        </div>

        <ProductsTable
          data={filteredProducts}
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.pagination?.total || 0,
            onChange: (newPage) => setPage(newPage),
          }}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onAdjustStock={handleAdjustStock}
          onViewHistory={handleViewHistory}
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

      {/* Inventory Dialogs */}
      <AdjustStockDialog
        isOpen={isAdjustStockDialogOpen}
        onClose={handleCloseAdjustStockDialog}
        product={
          selectedProductForInventory
            ? {
                id: selectedProductForInventory.id,
                name: selectedProductForInventory.name,
                sku: selectedProductForInventory.sku || "",
                stock: selectedProductForInventory.stock || 0,
              }
            : null
        }
      />
      <InventoryHistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={handleCloseHistoryDialog}
        productId={selectedProductForInventory?.id || null}
        productName={selectedProductForInventory?.name}
      />
    </div>
  );
}
