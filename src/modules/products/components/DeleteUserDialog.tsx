import { Modal, Typography, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../api";
import type { Product } from "../types";

const { Text } = Typography;

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function DeleteUserDialog({
  isOpen,
  onClose,
  product,
}: DeleteUserDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Xóa product thành công!");
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Xóa product thất bại!");
    },
  });

  const handleDelete = () => {
    if (product) {
      deleteMutation.mutate(product.id);
    }
  };

  return (
    <Modal
      title={
        <span className="flex items-center gap-2 text-red-600">
          <ExclamationCircleOutlined />
          Xác nhận xóa User
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
      <div className="py-4">
        <p className="text-gray-700 mb-3">
          Bạn có chắc chắn muốn xóa product <Text strong>{product?.name}</Text>?
        </p>
        <Text type="danger" className="text-sm">
          ⚠️ Hành động này không thể hoàn tác!
        </Text>
      </div>
    </Modal>
  );
}
