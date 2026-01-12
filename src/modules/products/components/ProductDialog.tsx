import { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { productsApi } from "../api";
import { rolesApi } from "@/modules/roles/api";
import type { Product } from "../types";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  roleId?: string;
}

export default function UserDialog({
  isOpen,
  onClose,
  product,
}: UserDialogProps) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isEdit = !!product;

  // Fetch roles từ API
  // const { data: rolesData, isLoading: rolesLoading } = useQuery({
  //   queryKey: ["roles"],
  //   queryFn: rolesApi.getRoles,
  //   enabled: isOpen,
  // });

  useEffect(() => {
    if (isOpen && product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description || "",
        price: product.price || 0,
      });
    } else if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, product, form]);
  const createMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Tạo product thành công!");
      onClose();
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Tạo product thất bại!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      productsApi.updateProduct(product!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Cập nhật product thành công!");
      onClose();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Cập nhật product thất bại!"
      );
    },
  });

  const handleSubmit = (values: ProductFormData) => {
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
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
        >
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>
        <Form.Item label="Mô tả" name="description">
          <Input.TextArea
            placeholder="Nhập mô tả sản phẩm"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
        <Form.Item
          label="Giá"
          name="price"
          rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm" }]}
        >
          <Input type="number" placeholder="Nhập giá sản phẩm" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
