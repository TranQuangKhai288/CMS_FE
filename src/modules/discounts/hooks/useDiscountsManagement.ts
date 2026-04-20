import { useState } from "react";
import type { Discount } from "../types";

export function useDiscountsManagement() {
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [isActiveFilter, setIsActiveFilter] = useState<string>("all");

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

    // Handlers
    const handleSearch = (value: string) => {
        setSearchText(value);
        setPage(1); // Reset to first page
    };

    const handleTypeFilterChange = (value: string) => {
        setTypeFilter(value);
        setPage(1);
    };

    const handleActiveFilterChange = (value: string) => {
        setIsActiveFilter(value);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        setSelectedDiscount(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (discount: Discount) => {
        setSelectedDiscount(discount);
        setIsDialogOpen(true);
    };

    const handleView = (discount: Discount) => {
        setSelectedDiscount(discount);
        setIsViewDialogOpen(true);
    };

    const handleDelete = (discount: Discount) => {
        setSelectedDiscount(discount);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedDiscount(null);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setSelectedDiscount(null);
    };

    const handleCloseViewDialog = () => {
        setIsViewDialogOpen(false);
        setSelectedDiscount(null);
    };

    return {
        // State
        page,
        searchText,
        typeFilter,
        isActiveFilter,
        selectedDiscount,

        // Dialog states
        isDialogOpen,
        isDeleteDialogOpen,
        isViewDialogOpen,

        // Handlers
        handleSearch,
        handleTypeFilterChange,
        handleActiveFilterChange,
        handlePageChange,
        handleAdd,
        handleEdit,
        handleView,
        handleDelete,
        handleCloseDialog,
        handleCloseDeleteDialog,
        handleCloseViewDialog,
    };
}
