import { Modal, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/apis/categories";
import type { Category } from "../types";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export default function DeleteCategoryDialog({
  isOpen,
  onClose,
  category,
}: DeleteCategoryDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      message.success("Xóa danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesTree"] });
      onClose();
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message || "Xóa danh mục thất bại";
      message.error(errorMsg);
    },
  });

  const handleDelete = () => {
    if (category) {
      deleteMutation.mutate(category.id);
    }
  };

  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-red-500" />
          Xác nhận xóa danh mục
        </span>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={handleDelete}
      confirmLoading={deleteMutation.isPending}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
    >
      <p>
        Bạn có chắc chắn muốn xóa danh mục <strong>"{category?.name}"</strong>?
      </p>
      {category?.children && category.children.length > 0 && (
        <p className="text-orange-600 mt-2">
          ⚠️ Danh mục này có {category.children.length} danh mục con. Việc xóa
          có thể ảnh hưởng đến dữ liệu liên quan.
        </p>
      )}
      <p className="text-gray-500 text-sm mt-2">
        Hành động này không thể hoàn tác.
      </p>
    </Modal>
  );
}
