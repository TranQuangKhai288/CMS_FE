import { useQuery } from "@tanstack/react-query";
import { Button, Input, Card, Typography, Alert } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { categoriesApi } from "@/apis/categories";
import CategoriesTable from "../components/CategoriesTable";
import CategoryDialog from "../components/CategoryDialog";
import DeleteCategoryDialog from "../components/DeleteCategoryDialog";
import { useCategoriesManagement } from "../hooks/useCategoriesManagement";

const { Title } = Typography;
const { Search } = Input;

export default function CategoriesPage() {
  const {
    searchText,
    isDialogOpen,
    isDeleteDialogOpen,
    selectedCategory,
    handleSearch,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleCloseDialog,
    handleCloseDeleteDialog,
    filterCategories,
  } = useCategoriesManagement();

  // Fetch categories tree
  const { data, isLoading, isError } = useQuery({
    queryKey: ["categoriesTree"],
    queryFn: () => categoriesApi.getCategoriesTree(),
  });

  // Filter categories by search text
  const filteredCategories = data?.data
    ? filterCategories(data.data, searchText)
    : [];

  if (isError) {
    return (
      <Alert
        message="Lỗi"
        description="Không thể tải danh sách danh mục. Vui lòng thử lại sau."
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
            Quản lý danh mục
            {data?.data && (
              <span className="ml-2 text-gray-500 text-base font-normal">
                ({data.data.length} danh mục)
              </span>
            )}
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddCategory}
            size="large"
          >
            Thêm danh mục
          </Button>
        </div>

        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm danh mục..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            className="max-w-md"
          />
        </div>

        <CategoriesTable
          data={filteredCategories}
          loading={isLoading}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      </Card>

      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        category={selectedCategory}
      />

      <DeleteCategoryDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        category={selectedCategory}
      />
    </div>
  );
}
