import { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { usersApi } from "../api";
import { rolesApi } from "@/modules/roles/api";
import type { User } from "../types";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

interface UserFormData {
  email: string;
  password?: string;
  firstName: string;
  lastName?: string;
  roleId: string;
}

export default function UserDialog({ isOpen, onClose, user }: UserDialogProps) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isEdit = !!user;

  // Fetch roles từ API
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: rolesApi.getRoles,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen && user) {
      form.setFieldsValue({
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        roleId: user.role.id,
      });
    } else if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, user, form]);

  const createMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("Tạo user thành công!");
      onClose();
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Tạo user thất bại!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserFormData) => usersApi.updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("Cập nhật user thành công!");
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Cập nhật user thất bại!");
    },
  });

  const handleSubmit = (values: UserFormData) => {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values as any);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa User" : "Thêm User mới"}
      open={isOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      okText={isEdit ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="mt-4"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="user@example.com" size="large" />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
            ]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>
        )}

        <Form.Item
          name="firstName"
          label="Họ"
          rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
        >
          <Input placeholder="Nguyễn Văn" size="large" />
        </Form.Item>

        <Form.Item name="lastName" label="Tên">
          <Input placeholder="A" size="large" />
        </Form.Item>

        <Form.Item
          name="roleId"
          label="Role"
          rules={[{ required: true, message: "Vui lòng chọn role!" }]}
        >
          <Select
            placeholder={rolesLoading ? "Đang tải roles..." : "-- Chọn role --"}
            loading={rolesLoading}
            size="large"
            options={rolesData?.data?.map((role) => ({
              label: role.name,
              value: role.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
