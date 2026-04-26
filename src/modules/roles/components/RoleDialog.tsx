import { useEffect } from "react";
import { Modal, Form, Input, Select, message, Space, Tag } from "antd";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { rolesApi, type CreateRoleDto, type UpdateRoleDto } from "@/apis/roles";
import type { Role } from "../types";

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
}

export default function RoleDialog({ isOpen, onClose, role }: RoleDialogProps) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isEdit = !!role;

  // Fetch available permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["available-permissions"],
    queryFn: () => rolesApi.getAvailablePermissions(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen && role) {
      form.setFieldsValue({
        name: role.name,
        slug: role.slug,
        description: role.description || "",
        permissions: role.permissions || [],
      });
    } else if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, role, form]);

  const createMutation = useMutation({
    mutationFn: rolesApi.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      message.success("Tạo vai trò thành công!");
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Tạo vai trò thất bại!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRoleDto) => rolesApi.updateRole(role!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      message.success("Cập nhật vai trò thành công!");
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Cập nhật vai trò thất bại!");
    },
  });

  const handleSubmit = (values: any) => {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Modal
      title={isEdit ? `Chỉnh sửa Vai trò: ${role?.name}` : "Thêm Vai trò mới"}
      open={isOpen}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      okText={isEdit ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
      width={700}
      className="rounded-lg!"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
        initialValues={{ permissions: [] }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[{ required: true, message: "Vui lòng nhập tên vai trò!" }]}
          >
            <Input placeholder="Ví dụ: Quản lý kho" size="large" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (Tùy chọn)"
            tooltip="Mã định danh duy nhất. Nếu để trống sẽ tự tạo từ tên."
          >
            <Input placeholder="ví-dụ-quan-ly-kho" size="large" disabled={role?.slug === 'admin'} />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea placeholder="Mô tả ngắn gọn về quyền hạn của vai trò này" rows={3} />
        </Form.Item>

        <Form.Item
          name="permissions"
          label="Phân quyền"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất một quyền!" }]}
        >
          <Select
            mode="multiple"
            placeholder={permissionsLoading ? "Đang tải permissions..." : "-- Chọn các quyền hạn --"}
            loading={permissionsLoading}
            size="large"
            style={{ width: '100%' }}
            maxTagCount="responsive"
            options={permissionsData?.data?.map((p) => ({
              label: p,
              value: p,
            }))}
            tagRender={({ label, closable, onClose }) => (
              <Tag
                color="indigo"
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3, marginTop: 3 }}
                className="bg-indigo-50! text-indigo-700! border-indigo-200!"
              >
                {label}
              </Tag>
            )}
          />
        </Form.Item>
        
        {role?.slug === 'admin' && (
          <Alert
            message="Lưu ý"
            description="Vai trò 'admin' có quyền tối cao và không thể thay đổi slug."
            type="info"
            showIcon
            className="mb-4"
          />
        )}
      </Form>
    </Modal>
  );
}
