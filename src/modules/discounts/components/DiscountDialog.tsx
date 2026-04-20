import { Modal, Form, Input, Select, InputNumber, DatePicker, Switch, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discountsApi } from "@/apis/discounts";
import type { Discount, CreateDiscountDto, UpdateDiscountDto } from "../types";
import { useEffect } from "react";
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface DiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    discount: Discount | null;
}

export default function DiscountDialog({ isOpen, onClose, discount }: DiscountDialogProps) {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const isEdit = !!discount;

    const createMutation = useMutation({
        mutationFn: (data: CreateDiscountDto) => discountsApi.createDiscount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
            message.success("Tạo mã giảm giá thành công!");
            onClose();
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || "Tạo mã giảm giá thất bại!");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDiscountDto }) =>
            discountsApi.updateDiscount(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
            message.success("Cập nhật mã giảm giá thành công!");
            onClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || "Cập nhật mã giảm giá thất bại!");
        },
    });

    useEffect(() => {
        if (isOpen && discount) {
            form.setFieldsValue({
                code: discount.code,
                name: discount.name,
                description: discount.description,
                type: discount.type,
                value: discount.value,
                minOrderValue: discount.minOrderValue,
                maxDiscount: discount.maxDiscount,
                usageLimit: discount.usageLimit,
                dateRange: [dayjs(discount.startDate), dayjs(discount.endDate)],
                isActive: discount.isActive,
            });
        } else if (isOpen) {
            form.resetFields();
        }
    }, [isOpen, discount, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const [startDate, endDate] = values.dateRange;

            const data = {
                ...values,
                code: values.code.toUpperCase(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                dateRange: undefined,
            };

            if (isEdit && discount) {
                const { code, ...updateData } = data;
                updateMutation.mutate({ id: discount.id, data: updateData });
            } else {
                createMutation.mutate(data);
            }
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const discountType = Form.useWatch("type", form);

    return (
        <Modal
            title={isEdit ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
            open={isOpen}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            width={700}
            okText={isEdit ? "Cập nhật" : "Tạo mới"}
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    label="Mã giảm giá"
                    name="code"
                    rules={[
                        { required: true, message: "Vui lòng nhập mã giảm giá!" },
                        { pattern: /^[A-Z0-9_]+$/, message: "Chỉ chấp nhận chữ in hoa, số và dấu gạch dưới!" },
                    ]}
                >
                    <Input
                        placeholder="VD: SUMMER2024"
                        disabled={isEdit}
                        style={{ textTransform: "uppercase" }}
                    />
                </Form.Item>

                <Form.Item
                    label="Tên"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                    <Input placeholder="VD: Giảm giá mùa hè" />
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                    <TextArea rows={3} placeholder="Mô tả chi tiết về mã giảm giá..." />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label="Loại giảm giá"
                        name="type"
                        rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
                    >
                        <Select placeholder="Chọn loại" disabled={isEdit}>
                            <Select.Option value="PERCENTAGE">Phần trăm (%)</Select.Option>
                            <Select.Option value="FIXED_AMOUNT">Số tiền cố định (₫)</Select.Option>
                            <Select.Option value="FREE_SHIPPING">Miễn phí vận chuyển</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={discountType === "PERCENTAGE" ? "Giá trị (%)" : "Giá trị (₫)"}
                        name="value"
                        rules={[
                            { required: discountType !== "FREE_SHIPPING", message: "Vui lòng nhập giá trị!" },
                            {
                                validator: (_, value) => {
                                    if (discountType === "PERCENTAGE" && (value < 0 || value > 100)) {
                                        return Promise.reject("Giá trị phải từ 0-100%");
                                    }
                                    if (discountType === "FIXED_AMOUNT" && value <= 0) {
                                        return Promise.reject("Giá trị phải lớn hơn 0");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            className="w-full"
                            min={0}
                            max={discountType === "PERCENTAGE" ? 100 : undefined}
                            disabled={discountType === "FREE_SHIPPING"}
                            placeholder={discountType === "PERCENTAGE" ? "VD: 20" : "VD: 50000"}
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Giá trị đơn hàng tối thiểu (₫)" name="minOrderValue">
                        <InputNumber className="w-full" min={0} placeholder="VD: 100000" />
                    </Form.Item>

                    {discountType === "PERCENTAGE" && (
                        <Form.Item label="Giảm tối đa (₫)" name="maxDiscount">
                            <InputNumber className="w-full" min={0} placeholder="VD: 50000" />
                        </Form.Item>
                    )}

                    {discountType !== "PERCENTAGE" && (
                        <Form.Item label="Số lần sử dụng tối đa" name="usageLimit">
                            <InputNumber className="w-full" min={1} placeholder="VD: 100" />
                        </Form.Item>
                    )}
                </div>

                {discountType === "PERCENTAGE" && (
                    <Form.Item label="Số lần sử dụng tối đa" name="usageLimit">
                        <InputNumber className="w-full" min={1} placeholder="VD: 100" />
                    </Form.Item>
                )}

                <Form.Item
                    label="Thời gian hiệu lực"
                    name="dateRange"
                    rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
                >
                    <RangePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item label="Trạng thái" name="isActive" valuePropName="checked" initialValue={true}>
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
