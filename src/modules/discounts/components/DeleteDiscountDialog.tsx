import { Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discountsApi } from "@/apis/discounts";
import type { Discount } from "../types";

interface DeleteDiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    discount: Discount | null;
}

export default function DeleteDiscountDialog({
    isOpen,
    onClose,
    discount,
}: DeleteDiscountDialogProps) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => discountsApi.deleteDiscount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
            message.success("Xóa mã giảm giá thành công!");
            onClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || "Xóa mã giảm giá thất bại!");
        },
    });

    const handleDelete = () => {
        if (discount) {
            deleteMutation.mutate(discount.id);
        }
    };

    return (
        <Modal
            title={
                <span>
                    <ExclamationCircleOutlined className="text-red-500 mr-2" />
                    Xác nhận xóa mã giảm giá
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
            <div className="py-4">
                <p className="mb-4">Bạn có chắc chắn muốn xóa mã giảm giá này?</p>
                {discount && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="mb-2">
                            <span className="font-semibold">Mã:</span>{" "}
                            <span className="font-mono text-blue-600">{discount.code}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Tên:</span> {discount.name}
                        </div>
                    </div>
                )}
                <p className="mt-4 text-red-500 text-sm">
                    ⚠️ Hành động này không thể hoàn tác!
                </p>
            </div>
        </Modal>
    );
}
