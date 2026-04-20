import React from "react";
import { Modal, Form, Select, Input, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/apis/orders";
import type { Order, OrderStatus } from "../types";

interface UpdateStatusDialogProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

const statusOptions: { label: string; value: OrderStatus }[] = [
    { label: "Chờ xử lý", value: "PENDING" },
    { label: "Đã xác nhận", value: "CONFIRMED" },
    { label: "Đang xử lý", value: "PROCESSING" },
    { label: "Đang giao", value: "SHIPPED" },
    { label: "Đã giao", value: "DELIVERED" },
    { label: "Đã hủy", value: "CANCELLED" },
    { label: "Đã hoàn tiền", value: "REFUNDED" },
];

export default function UpdateStatusDialog({
    isOpen,
    onClose,
    order,
}: UpdateStatusDialogProps) {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            status,
            note,
        }: {
            id: string;
            status: string;
            note?: string;
        }) => ordersApi.updateOrderStatus(id, status, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            message.success("Cập nhật trạng thái thành công!");
            form.resetFields();
            onClose();
        },
        onError: (error: any) => {
            message.error(
                error.response?.data?.message || "Cập nhật trạng thái thất bại!"
            );
        },
    });

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (order) {
                updateMutation.mutate({
                    id: order.id,
                    status: values.status,
                    note: values.note,
                });
            }
        });
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    // Set initial values when dialog opens
    React.useEffect(() => {
        if (isOpen && order) {
            form.setFieldsValue({
                status: order.status,
            });
        }
    }, [isOpen, order, form]);

    return (
        <Modal
            title="Cập nhật trạng thái đơn hàng"
            open={isOpen}
            onCancel={handleClose}
            onOk={handleSubmit}
            confirmLoading={updateMutation.isPending}
            okText="Cập nhật"
            cancelText="Hủy"
        >
            <div className="mb-4">
                <p className="text-gray-600">
                    Đơn hàng: <strong>#{order?.orderNumber}</strong>
                </p>
            </div>
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Trạng thái mới"
                    name="status"
                    rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                >
                    <Select options={statusOptions} placeholder="Chọn trạng thái" />
                </Form.Item>
                <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea rows={3} placeholder="Ghi chú (tùy chọn)..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
