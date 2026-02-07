import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Switch,
  InputNumber,
  Button,
  Space,
  Card,
  Row,
  Col,
  Divider,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { productsApi, categoriesApi } from "../api"; // Đảm bảo import đúng đường dẫn
import type { Product } from "../types";
import {
  CoreInput,
  CoreInputCurrency,
  CoreSelect,
  CoreSwitch,
  CoreTextArea,
} from "@/components/core/form-elements";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

// Định nghĩa lại form data để Attributes là mảng object thay vì string
interface ProductFormData {
  name: string;
  slug?: string;
  sku?: string;
  shortDesc?: string;
  description?: string;
  categoryId?: string;
  // Attributes đổi thành mảng object để dễ thao tác trên UI
  attributes?: { key: string; label: string; value: string | number }[];
  basePrice?: number;
  salePrice?: number;
  costPrice?: number;
  stock?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "OUT_OF_STOCK";
  isActive?: boolean;
}

export default function ProductDialog({
  isOpen,
  onClose,
  product,
}: ProductDialogProps) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isEdit = !!product;

  // 1. Fetch Categories để hiển thị trong Select
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
    enabled: isOpen, // Chỉ fetch khi modal mở
  });

  // Xử lý data categories (giả sử API trả về structure như bạn cung cấp)
  const categoryOptions = Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data.map((cat: any) => ({
        label: cat.name,
        value: cat.id,
      }))
    : [];

  // 2. Xử lý dữ liệu ban đầu
  useEffect(() => {
    if (isOpen && product) {
      // Parse attributes từ JSON/String sang Array cho Form List
      let parsedAttributes = [];
      try {
        if (Array.isArray(product.attributes)) {
          parsedAttributes = product.attributes;
        } else if (typeof product.attributes === "string") {
          parsedAttributes = JSON.parse(product.attributes);
        }
      } catch (e) {
        console.error("Lỗi parse attributes:", e);
        parsedAttributes = [];
      }

      form.setFieldsValue({
        name: product.name,
        slug: product.slug || "",
        sku: product.sku || "",
        shortDesc: product.shortDesc || "",
        description: product.description || "",
        categoryId: product.categoryId || undefined,
        attributes: parsedAttributes, // Set mảng object vào form
        basePrice: product.basePrice ?? 0,
        salePrice: product.salePrice ?? 0,
        costPrice: product.costPrice ?? 0,
        stock: product.stock ?? 0,
        status: product.status || "DRAFT",
        isActive: product.isActive ?? true,
      });
    } else if (isOpen) {
      form.resetFields();
      form.setFieldValue("isActive", true); // Mặc định active khi tạo mới
      form.setFieldValue("status", "PUBLISHED");
    }
  }, [isOpen, product, form]);

  const createMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Tạo sản phẩm thành công!");
      handleCancel();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Tạo sản phẩm thất bại!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => productsApi.updateProduct(product!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Cập nhật sản phẩm thành công!");
      handleCancel();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Cập nhật sản phẩm thất bại!",
      );
    },
  });

  const handleSubmit = (values: ProductFormData) => {
    // 3. Chuẩn hóa dữ liệu trước khi gửi đi
    // Attributes từ Form đang là Array Object, API cần Array Object (JSON)
    // Nếu API của bạn BẮT BUỘC nhận string, hãy dùng JSON.stringify(values.attributes)
    // Ở đây mình gửi nguyên array (khuyên dùng), backend tự xử lý hoặc stringify nếu cần.

    const payload = {
      ...values,
      // Đảm bảo attributes luôn là mảng (tránh null/undefined)
      attributes: values.attributes || [],
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      open={isOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      okText={isEdit ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
      width={900} // Tăng độ rộng để hiển thị đẹp hơn
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          {/* CỘT TRÁI */}
          <Col span={14}>
            <Card title="Thông tin chung" size="small" className="mb-4">
              <CoreInput
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
                placeholder="VD: iPhone 15"
              />

              <Row gutter={16}>
                <Col span={12}>
                  <CoreSelect
                    label="Danh mục"
                    name="categoryId"
                    options={categoryOptions}
                    loading={categoriesLoading}
                    placeholder="Chọn danh mục"
                  />
                </Col>
                <Col span={12}>
                  <CoreInput label="SKU" name="sku" placeholder="SP-001" />
                </Col>
              </Row>

              <CoreInput
                label="Slug"
                name="slug"
                tooltip="Để trống sẽ tự động tạo từ tên"
              />

              <CoreTextArea
                label="Mô tả ngắn"
                name="shortDesc"
                rows={2}
                maxLength={255}
                showCount
              />

              <CoreTextArea
                label="Mô tả chi tiết"
                name="description"
                rows={6}
              />
            </Card>
          </Col>

          {/* CỘT PHẢI */}
          <Col span={10}>
            <Card title="Giá & Kho hàng" size="small" className="mb-4">
              <Row gutter={12}>
                <Col span={12}>
                  <CoreInputCurrency
                    label="Giá bán"
                    name="salePrice"
                    isCurrency={true}
                    addonAfter="₫"
                  />
                </Col>
                <Col span={12}>
                  <CoreInputCurrency
                    label="Giá gốc"
                    name="basePrice"
                    isCurrency={true}
                    addonAfter="₫"
                  />
                </Col>
                <Col span={12}>
                  <CoreInputCurrency
                    label="Giá vốn"
                    name="costPrice"
                    isCurrency={true}
                    addonAfter="₫"
                  />
                </Col>
                <Col span={12}>
                  <CoreInputCurrency label="Tồn kho" name="stock" />
                </Col>
              </Row>

              <Divider className="my-2" />

              <Row gutter={12}>
                <Col span={12}>
                  <CoreSelect
                    label="Trạng thái"
                    name="status"
                    options={[
                      { label: "Nháp", value: "DRAFT" },
                      { label: "Công khai", value: "PUBLISHED" },
                      { label: "Lưu trữ", value: "ARCHIVED" },
                      { label: "Hết hàng", value: "OUT_OF_STOCK" },
                    ]}
                    className="mb-0"
                  />
                </Col>
                <Col span={12}>
                  <CoreSwitch
                    label="Hiển thị"
                    name="isActive"
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                  />
                </Col>
              </Row>
            </Card>

            <Card title="Thuộc tính" size="small">
              <Form.List name="attributes">
                {(fields, { add, remove }) => (
                  <>
                    <div className="flex flex-col gap-2">
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          className="flex items-center justify-center gap-2"
                        >
                          <CoreInput
                            {...restField}
                            name={[name, "key"] as any}
                            placeholder="Khóa"
                            className="mb-0"
                          />
                          <CoreInput
                            {...restField}
                            name={[name, "label"] as any}
                            placeholder="Nhãn"
                            className="mb-0"
                          />
                          <CoreInput
                            {...restField}
                            name={[name, "value"] as any}
                            placeholder="Giá trị"
                            className="mb-0"
                          />
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="text-red-500 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm thuộc tính
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
