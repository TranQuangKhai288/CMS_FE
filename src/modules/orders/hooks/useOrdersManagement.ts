import { useState } from "react";
import type { Order, OrderStatus, PaymentStatus } from "../types";

export function useOrdersManagement() {
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<
        PaymentStatus | ""
    >("");

    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] =
        useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPage(1);
    };

    const handleStatusFilter = (value: OrderStatus | "") => {
        setStatusFilter(value);
        setPage(1);
    };

    const handlePaymentStatusFilter = (value: PaymentStatus | "") => {
        setPaymentStatusFilter(value);
        setPage(1);
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsViewDialogOpen(true);
    };

    const handleUpdateStatus = (order: Order) => {
        setSelectedOrder(order);
        setIsUpdateStatusDialogOpen(true);
    };

    const handleCancelOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsCancelDialogOpen(true);
    };

    const handleCloseViewDialog = () => {
        setIsViewDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleCloseUpdateStatusDialog = () => {
        setIsUpdateStatusDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleCloseCancelDialog = () => {
        setIsCancelDialogOpen(false);
        setSelectedOrder(null);
    };

    return {
        // State
        page,
        searchText,
        statusFilter,
        paymentStatusFilter,
        isViewDialogOpen,
        isUpdateStatusDialogOpen,
        isCancelDialogOpen,
        selectedOrder,

        // Setters
        setPage,
        setSearchText,
        setStatusFilter,
        setPaymentStatusFilter,

        // Handlers
        handleSearch,
        handleStatusFilter,
        handlePaymentStatusFilter,
        handleViewOrder,
        handleUpdateStatus,
        handleCancelOrder,
        handleCloseViewDialog,
        handleCloseUpdateStatusDialog,
        handleCloseCancelDialog,
    };
}
