import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Tabs, Button, Input, Alert, Select, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { TabsProps } from "antd";
import { productsApi } from "../../../apis/products";
import { categoriesApi } from "../../../apis/categories";
import ProductsTable from "../pages/products/components/ProductsTable";
import CategoriesTable from "../pages/categories/components/CategoriesTable";
import ProductDialog from "../pages/products/components/ProductDialog";
import DeleteProductDialog from "../pages/products/components/DeleteProductDialog";
import CategoryDialog from "../pages/categories/components/CategoryDialog";
import DeleteCategoryDialog from "../pages/categories/components/DeleteCategoryDialog";
import { useProductsManagement } from "../pages/products/hooks/useProductsManagement";
import { useCategoriesManagement } from "../pages/categories/hooks/useCategoriesManagement";
import AdjustStockDialog from "@/modules/inventory/components/AdjustStockDialog";
import InventoryHistoryDialog from "@/modules/inventory/components/InventoryHistoryDialog";
import LowStockAlert from "@/modules/inventory/components/LowStockAlert";
import type { Product } from "../pages/products/types";

const { Search } = Input;

export default function CategoriesProductsPage() {
  const [activeTab, setActiveTab] = useState<string>("products");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedProductForInventory, setSelectedProductForInventory] =
    useState<Product | null>(null);

  // Products management using custom hook
  const {
    page: productPage,
    searchText: productSearchText,
    limit: productLimit,
    isDialogOpen: isProductDialogOpen,
    isDeleteDialogOpen: isDeleteProductDialogOpen,
    selectedProduct,
    setPage: setProductPage,
    handleSearch: handleProductSearch,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleCloseDialog: handleCloseProductDialog,
    handleCloseDeleteDialog: handleCloseDeleteProductDialog,
  } = useProductsManagement();

  // Categories management using custom hook
  const {
    searchText: categorySearchText,
    isDialogOpen: isCategoryDialogOpen,
    isDeleteDialogOpen: isDeleteCategoryDialogOpen,
    selectedCategory,
    handleSearch: handleCategorySearch,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleCloseDialog: handleCloseCategoryDialog,
    handleCloseDeleteDialog: handleCloseDeleteCategoryDialog,
    filterCategories,
  } = useCategoriesManagement();

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

  // Products queries
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: [
      "products",
      productPage,
      productSearchText,
      productLimit,
      stockFilter,
    ],
    queryFn: () =>
      productsApi.getProducts({
        page: productPage,
        limit: productLimit,
        search: productSearchText,
      }),
    enabled: activeTab === "products",
  });

  // Filter products by stock status
  const filteredProducts =
    productsData?.data?.filter((product: Product) => {
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

  // Categories queries (dạng cây)
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categoriesTree"],
    queryFn: () => categoriesApi.getCategoriesTree(),
    enabled: activeTab === "categories",
  });

  // Filter categories by search
  const filteredCategories = categoriesData?.data
    ? filterCategories(categoriesData.data, categorySearchText)
    : [];

  const items: TabsProps["items"] = [
    {
      key: "products",
      label: (
        <span className="text-base font-medium">
          Sản phẩm
          {productsData?.pagination?.total !== undefined && (
            <span className="ml-2 text-gray-500 text-sm">
              ({productsData.pagination.total})
            </span>
          )}
        </span>
      ),
      children: (
        <div className="space-y-4">
          {/* Low Stock Alert */}
          <LowStockAlert
            onViewLowStock={handleViewLowStock}
            onViewOutOfStock={handleViewOutOfStock}
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Space size="middle" wrap className="flex-1">
              <Search
                placeholder="Tìm kiếm theo tên hoặc SKU..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleProductSearch}
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProduct}
              size="large"
            >
              Thêm sản phẩm
            </Button>
          </div>

          {productsError ? (
            <Alert
              message="Lỗi"
              description="Không thể tải danh sách sản phẩm. Vui lòng thử lại sau."
              type="error"
              showIcon
            />
          ) : (
            <ProductsTable
              data={filteredProducts}
              loading={productsLoading}
              pagination={{
                current: productPage,
                pageSize: productLimit,
                total: productsData?.pagination?.total || 0,
                onChange: (page) => setProductPage(page),
              }}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onAdjustStock={handleAdjustStock}
              onViewHistory={handleViewHistory}
            />
          )}
        </div>
      ),
    },
    {
      key: "categories",
      label: (
        <span className="text-base font-medium">
          Danh mục
          {categoriesData?.data && (
            <span className="ml-2 text-gray-500 text-sm">
              ({categoriesData.data.length})
            </span>
          )}
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Search
              placeholder="Tìm kiếm danh mục..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleCategorySearch}
              className="max-w-md"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCategory}
              size="large"
            >
              Thêm danh mục
            </Button>
          </div>

          {categoriesError ? (
            <Alert
              message="Lỗi"
              description="Không thể tải danh sách danh mục. Vui lòng thử lại sau."
              type="error"
              showIcon
            />
          ) : (
            <CategoriesTable
              data={filteredCategories}
              loading={categoriesLoading}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          items={items}
          onChange={setActiveTab}
          size="large"
        />
      </Card>

      {/* Product Dialogs */}
      <ProductDialog
        isOpen={isProductDialogOpen}
        onClose={handleCloseProductDialog}
        product={selectedProduct}
      />
      <DeleteProductDialog
        isOpen={isDeleteProductDialogOpen}
        onClose={handleCloseDeleteProductDialog}
        product={selectedProduct}
      />

      {/* Category Dialogs */}
      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={handleCloseCategoryDialog}
        category={selectedCategory}
      />
      <DeleteCategoryDialog
        isOpen={isDeleteCategoryDialogOpen}
        onClose={handleCloseDeleteCategoryDialog}
        category={selectedCategory}
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
