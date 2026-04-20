import { Modal, Form, Select, InputNumber, Input, message, Alert } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, type AdjustStockDto } from "@/apis/inventory";
import { useEffect, useMemo } from "react";

const { TextArea } = Input;

interface Product {
    id: string;
    name: string;
    sku: string;
    stock: number;
}

interface AdjustStockDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function AdjustStockDialog({
    isOpen,
    onClose,
    product,
}: AdjustStockDialogProps) {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const adjustMutation = useMutation({
        mutationFn: (data: AdjustStockDto) => inventoryApi.adjustStock(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            message.success("Điều chỉnh tồn kho thành công!");
            onClose();
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(
                error.response?.data?.message || "Điều chỉnh tồn kho thất bại!"
            );
        },
    });

    useEffect(() => {
        if (isOpen && product) {
            form.resetFields();
        }
    }, [isOpen, product, form]);

    const handleSubmit = async () => {
        if (!product) return;

        try {
            const values = await form.validateFields();

            adjustMutation.mutate({
                productId: product.id,
                type: values.type,
                quantity: values.quantity,
                note: values.note,
            });
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    // Watch quantity to show preview
    const quantity = Form.useWatch("quantity", form) || 0;

    const newStock = useMemo(() => {
        if (!product) return 0;
        return product.stock + quantity;
    }, [product, quantity]);

    const isValidAdjustment = useMemo(() => {
        return newStock >= 0 && quantity !== 0;
    }, [newStock, quantity]);

    if (!product) return null;

    return (
        <Modal
            title="Điều chỉnh tồn kho"
            open={isOpen}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={adjustMutation.isPending}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ disabled: !isValidAdjustment }}
            width={600}
        >
            <div className="py-4">
                {/* Product Info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="mb-2">
                        <span className="text-gray-600">Sản phẩm:</span>{" "}
                        <span className="font-semibold">{product.name}</span>
                    </div>
                    <div className="mb-2">
                        <span className="text-gray-600">SKU:</span>{" "}
                        <span className="font-mono">{product.sku}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Tồn kho hiện tại:</span>{" "}
                        <span className="font-bold text-blue-600 text-lg">{product.stock}</span>
                    </div>
                </div>

                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Loại điều chỉnh"
                        name="type"
                        rules={[{ required: true, message: "Vui lòng chọn loại điều chỉnh!" }]}
                        initialValue="ADJUSTMENT"
                    >
                        <Select>
                            <Select.Option value="ADJUSTMENT">
                                ⚙️ Điều chỉnh (Adjustment)
                            </Select.Option>
                            <Select.Option value="DAMAGE">
                                ⚠️ Hư hỏng (Damage)
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Số lượng thay đổi"
                        name="quantity"
                        rules={[
                            { required: true, message: "Vui lòng nhập số lượng!" },
                            {
                                validator: (_, value) => {
                                    if (value === 0) {
                                        return Promise.reject("Số lượng không được bằng 0!");
                                    }
                                    if (product.stock + value < 0) {
                                        return Promise.reject(
                                            `Số lượng không hợp lệ! Tồn kho không thể âm (hiện tại: ${product.stock})`
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        extra="Nhập số dương để tăng, số âm để giảm tồn kho"
                    >
                        <InputNumber
                            className="w-full"
                            placeholder="VD: +20 hoặc -10"
                            controls
                            step={1}
                        />
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="note">
                        <TextArea
                            rows={3}
                            placeholder="Ghi chú về lý do điều chỉnh..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>
                </Form>

                {/* Preview */}
                {quantity !== 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">Xem trước:</div>
                        <div className="flex items-center gap-3 text-lg">
                            <span className="font-bold text-gray-700">{product.stock}</span>
                            <span className="text-gray-400">→</span>
                            <span
                                className={`font-bold ${newStock < 0
                                        ? "text-red-600"
                                        : newStock === 0
                                            ? "text-orange-600"
                                            : "text-green-600"
                                    }`}
                            >
                                {newStock}
                            </span>
                            <span
                                className={`text-sm ${quantity > 0 ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                ({quantity > 0 ? "+" : ""}
                                {quantity})
                            </span>
                        </div>
                    </div>
                )}

                {/* Warning for negative stock */}
                {newStock < 0 && (
                    <Alert
                        type="error"
                        message="Tồn kho không thể âm!"
                        className="mt-4"
                        showIcon
                    />
                )}
            </div>
        </Modal>
    );
}
