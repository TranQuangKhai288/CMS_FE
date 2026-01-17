import { useEffect } from "react";
import { Modal, Form, Input, Select, message, Switch, InputNumber } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../api";
import type { Product } from "../types";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

interface ProductFormData {
  name: string;
  slug?: string;
  sku?: string;
  short_desc?: string;
  description?: string;
  category_id?: string;
  attributes?: string; // JSON string in form
  base_price?: number;
  sale_price?: number;
  cost_price?: number;
  stock?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "OUT_OF_STOCK";
  is_active?: boolean;
}

export default function ProductDialog({
  isOpen,
  onClose,
  product,
}: ProductDialogProps) {
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
        slug: product.slug || "",
        sku: product.sku || "",
        short_desc: product.short_desc || "",
        description: product.description || "",
        category_id: product.category_id || undefined,
        attributes: product.attributes
          ? JSON.stringify(product.attributes)
          : "",
        base_price: product.base_price ?? 0,
        sale_price: product.sale_price ?? 0,
        cost_price: product.cost_price ?? 0,
        stock: product.stock ?? 0,
        status: product.status || "DRAFT",
        is_active: !!product.is_active,
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
      title={isEdit ? "Chỉnh sửa Product" : "Thêm Product mới"}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item label="Slug" name="slug">
            <Input placeholder="slug (tùy chọn)" />
          </Form.Item>
          <Form.Item label="SKU" name="sku">
            <Input placeholder="SKU (tùy chọn)" />
          </Form.Item>
        </div>

        <Form.Item label="Mô tả ngắn" name="short_desc">
          <Input.TextArea
            placeholder="Mô tả ngắn"
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea
            placeholder="Nhập mô tả sản phẩm"
            autoSize={{ minRows: 3, maxRows: 8 }}
          />
        </Form.Item>

        <Form.Item label="Thuộc tính (JSON)" name="attributes">
          <Input.TextArea
            placeholder='Ví dụ: {"color":"red","size":"M"}'
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item label="Danh mục (id)" name="category_id">
          <Input placeholder="category id" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Form.Item label="Giá cơ bản" name="base_price">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item label="Giá bán" name="sale_price">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item label="Giá vốn" name="cost_price">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item label="Tồn kho" name="stock">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Select.Option value="DRAFT">DRAFT</Select.Option>
              <Select.Option value="PUBLISHED">PUBLISHED</Select.Option>
              <Select.Option value="ARCHIVED">ARCHIVED</Select.Option>
              <Select.Option value="OUT_OF_STOCK">OUT_OF_STOCK</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Kích hoạt" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
