import React from "react";
import { Modal, Form, Input, Switch, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/apis/customers";
import type { Customer } from "../types";

interface CustomerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

export default function CustomerDialog({
    isOpen,
    onClose,
    customer,
}: CustomerDialogProps) {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const isEditMode = !!customer;

    const createMutation = useMutation({
        mutationFn: (data: any) => customersApi.createCustomer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            message.success("Tạo khách hàng thành công!");
            form.resetFields();
            onClose();
        },
        onError: (error: any) => {
            message.error(
                error.response?.data?.message || "Tạo khách hàng thất bại!"
            );
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            customersApi.updateCustomer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            message.success("Cập nhật khách hàng thành công!");
            form.resetFields();
            onClose();
        },
        onError: (error: any) => {
            message.error(
                error.response?.data?.message || "Cập nhật khách hàng thất bại!"
            );
        },
    });

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            // Parse addresses if it's a string
            let parsedValues = { ...values };
            if (values.addresses && typeof values.addresses === "string") {
                try {
                    parsedValues.addresses = JSON.parse(values.addresses);
                } catch (e) {
                    message.error("Địa chỉ không đúng định dạng JSON!");
                    return;
                }
            }

            if (isEditMode && customer) {
                updateMutation.mutate({ id: customer.id, data: parsedValues });
            } else {
                createMutation.mutate(parsedValues);
            }
        });
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    // Set initial values when dialog opens
    React.useEffect(() => {
        if (isOpen && customer) {
            form.setFieldsValue({
                ...customer,
                addresses:
                    customer.addresses && typeof customer.addresses === "object"
                        ? JSON.stringify(customer.addresses, null, 2)
                        : customer.addresses,
            });
        } else if (isOpen && !customer) {
            form.setFieldsValue({
                isActive: true,
            });
        }
    }, [isOpen, customer, form]);

    return (
        <Modal
            title={isEditMode ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            open={isOpen}
            onCancel={handleClose}
            onOk={handleSubmit}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            okText={isEditMode ? "Cập nhật" : "Tạo mới"}
            cancelText="Hủy"
            width={600}
        >
            <Form form={form} layout="vertical" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label="Họ"
                        name="firstName"
                        rules={[{ required: true, message: "Vui lòng nhập họ" }]}
                    >
                        <Input placeholder="Nhập họ..." />
                    </Form.Item>

                    <Form.Item
                        label="Tên"
                        name="lastName"
                        rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                        <Input placeholder="Nhập tên..." />
                    </Form.Item>
                </div>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                    ]}
                >
                    <Input placeholder="Nhập email..." disabled={isEditMode} />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phone">
                    <Input placeholder="Nhập số điện thoại..." />
                </Form.Item>

                <Form.Item label="Avatar URL" name="avatar">
                    <Input placeholder="Nhập URL avatar..." />
                </Form.Item>

                <Form.Item
                    label="Địa chỉ (JSON)"
                    name="addresses"
                    help='Nhập địa chỉ dưới dạng JSON array. Ví dụ: [{"type": "shipping", "address1": "123 Main St"}]'
                >
                    <Input.TextArea
                        rows={4}
                        placeholder='[{"type": "shipping", "address1": "..."}]'
                    />
                </Form.Item>

                <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
                </Form.Item>
            </Form>
        </Modal >
    );
}
