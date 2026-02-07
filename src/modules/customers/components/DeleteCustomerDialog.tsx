import { Modal, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { customersApi } from "@/apis/customers";
import type { Customer } from "../types";

interface DeleteCustomerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

export default function DeleteCustomerDialog({
    isOpen,
    onClose,
    customer,
}: DeleteCustomerDialogProps) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => customersApi.deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            message.success("Xóa khách hàng thành công!");
            onClose();
        },
        onError: (error: any) => {
            message.error(
                error.response?.data?.message || "Xóa khách hàng thất bại!"
            );
        },
    });

    const handleDelete = () => {
        if (customer) {
            deleteMutation.mutate(customer.id);
        }
    };

    return (
        <Modal
            title={
                <span>
                    <ExclamationCircleOutlined className="text-red-500 mr-2" />
                    Xác nhận xóa khách hàng
                </span>
            }
            open={isOpen}
            onCancel={onClose}
            onOk={handleDelete}
            confirmLoading={deleteMutation.isPending}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
        >
            <p className="text-gray-700">
                Bạn có chắc chắn muốn xóa khách hàng{" "}
                <strong>
                    {customer?.firstName} {customer?.lastName}
                </strong>{" "}
                ({customer?.email})?
            </p>
            <p className="text-sm text-gray-500 mt-2">
                Hành động này không thể hoàn tác.
            </p>
        </Modal>
    );
}
