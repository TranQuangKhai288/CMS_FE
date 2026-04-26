import { Modal, Typography, message, Alert } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "@/apis/roles";
import type { Role } from "../types";
import { WarningOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface DeleteRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export default function DeleteRoleDialog({ isOpen, onClose, role }: DeleteRoleDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      message.success("Xóa vai trò thành công!");
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Xóa vai trò thất bại!");
    },
  });

  const handleOk = () => {
    if (role) {
      deleteMutation.mutate(role.id);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-red-600">
          <WarningOutlined />
          <span>Xác nhận xóa vai trò</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={deleteMutation.isPending}
      okText="Xóa vai trò"
      okButtonProps={{ danger: true }}
      cancelText="Hủy"
    >
      <div className="space-y-4 py-2">
        <p>
          Bạn có chắc chắn muốn xóa vai trò <Text strong className="text-red-600">"{role?.name}"</Text>?
        </p>
        <p className="text-gray-500 text-sm">
          Hành động này không thể hoàn tác. Tất cả người dùng đang gán vai trò này sẽ bị ảnh hưởng (hệ thống sẽ chặn xóa nếu có người dùng đang sử dụng).
        </p>
        
        {role?.slug === 'admin' && (
          <Alert
            message="Cảnh báo tối quan trọng"
            description="Không thể xóa vai trò quản trị viên hệ thống (admin)."
            type="error"
            showIcon
          />
        )}
      </div>
    </Modal>
  );
}
