import { Modal, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { ordersApi } from "@/apis/orders";
import type { Order } from "../types";

interface CancelOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export default function CancelOrderDialog({
    isOpen,
    onClose,
    order,
}: CancelOrderDialogProps) {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();

    const cancelMutation = useMutation({
        mutationFn: ({ id, note }: { id: string; note?: string }) =>
            ordersApi.cancelOrder(id, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            message.success("Hủy đơn hàng thành công!");
            form.resetFields();
            onClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || "Hủy đơn hàng thất bại!");
        },
    });

    const handleCancel = () => {
        form.validateFields().then((values) => {
            if (order) {
                cancelMutation.mutate({ id: order.id, note: values.note });
            }
        });
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={
                <span>
                    <ExclamationCircleOutlined className="text-red-500 mr-2" />
                    Xác nhận hủy đơn hàng
                </span>
            }
            open={isOpen}
            onCancel={handleClose}
            onOk={handleCancel}
            confirmLoading={cancelMutation.isPending}
            okText="Hủy đơn"
            cancelText="Đóng"
            okButtonProps={{ danger: true }}
        >
            <div className="space-y-4">
                <p className="text-gray-700">
                    Bạn có chắc chắn muốn hủy đơn hàng{" "}
                    <strong>#{order?.orderNumber}</strong>?
                </p>
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Lý do hủy"
                        name="note"
                        rules={[{ required: true, message: "Vui lòng nhập lý do hủy" }]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập lý do hủy đơn hàng..."
                        />
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}
