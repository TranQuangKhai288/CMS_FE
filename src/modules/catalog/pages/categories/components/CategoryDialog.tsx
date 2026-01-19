import { useEffect } from "react";
import { Modal, Form, Input, Switch, message, TreeSelect } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../../apis/categories";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "../types";

const { TextArea } = Input;

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export default function CategoryDialog({
  isOpen,
  onClose,
  category,
}: CategoryDialogProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!category;

  // Lấy danh sách categories dạng cây để chọn parent
  const { data: categoriesTree } = useQuery({
    queryKey: ["categoriesTree"],
    queryFn: () => categoriesApi.getCategoriesTree(),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.createCategory(data),
    onSuccess: () => {
      message.success("Tạo danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesTree"] });
      handleClose();
    },
    onError: () => {
      message.error("Tạo danh mục thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoriesApi.updateCategory(id, data),
    onSuccess: () => {
      message.success("Cập nhật danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesTree"] });
      handleClose();
    },
    onError: () => {
      message.error("Cập nhật danh mục thất bại");
    },
  });

  useEffect(() => {
    if (isOpen && category) {
      form.setFieldsValue({
        ...category,
        isActive: category.isActive ?? true,
      });
    } else if (isOpen) {
      form.setFieldsValue({ isActive: true });
    }
  }, [isOpen, category, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEdit && category) {
        updateMutation.mutate({ id: category.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Convert categories tree to TreeSelect format
  const convertToTreeData = (categories: Category[] | undefined): any[] => {
    if (!categories) return [];

    return categories.map((cat) => ({
      title: cat.name,
      value: cat.id,
      children: cat.children ? convertToTreeData(cat.children) : undefined,
      disabled: isEdit && cat.id === category?.id, // Không cho chọn chính nó làm parent
    }));
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
      open={isOpen}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      width={600}
      okText={isEdit ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          tooltip="Để trống để tự động tạo từ tên"
        >
          <Input placeholder="category-slug" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <TextArea rows={3} placeholder="Nhập mô tả danh mục" />
        </Form.Item>

        <Form.Item label="Danh mục cha" name="parentId">
          <TreeSelect
            treeData={convertToTreeData(categoriesTree?.data)}
            placeholder="Chọn danh mục cha (nếu có)"
            allowClear
            showSearch
            treeDefaultExpandAll
            treeNodeFilterProp="title"
          />
        </Form.Item>

        <Form.Item label="Thứ tự hiển thị" name="order">
          <Input type="number" placeholder="0" />
        </Form.Item>

        <Form.Item label="Hình ảnh" name="image">
          <Input placeholder="URL hình ảnh" />
        </Form.Item>

        <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>

        <div className="text-gray-500 text-sm mt-4 mb-2">SEO (Tùy chọn)</div>

        <Form.Item label="Meta Title" name="metaTitle">
          <Input placeholder="Tiêu đề SEO" />
        </Form.Item>

        <Form.Item label="Meta Description" name="metaDesc">
          <TextArea rows={2} placeholder="Mô tả SEO" />
        </Form.Item>

        <Form.Item label="Meta Keywords" name="metaKeywords">
          <Input placeholder="Từ khóa SEO (phân cách bằng dấu phẩy)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
