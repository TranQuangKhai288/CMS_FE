import { Modal, Typography, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api";
import type { User } from "../types";

const { Text } = Typography;

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function DeleteUserDialog({
  isOpen,
  onClose,
  user,
}: DeleteUserDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("Xóa user thành công!");
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Xóa user thất bại!");
    },
  });

  const handleDelete = () => {
    if (user) {
      deleteMutation.mutate(user.id);
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
          Bạn có chắc chắn muốn xóa user{" "}
          <Text strong>
            {user?.firstName} {user?.lastName} ({user?.email})
          </Text>
          ?
        </p>
        <Text type="danger" className="text-sm">
          ⚠️ Hành động này không thể hoàn tác!
        </Text>
      </div>
    </Modal>
  );
}
