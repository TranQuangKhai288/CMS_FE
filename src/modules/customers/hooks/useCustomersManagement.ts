import { useState } from "react";
import type { Customer } from "../types";

export function useCustomersManagement() {
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
        undefined
    );

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null
    );

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPage(1);
    };

    const handleIsActiveFilter = (value: boolean | undefined) => {
        setIsActiveFilter(value);
        setPage(1);
    };

    const handleAddCustomer = () => {
        setSelectedCustomer(null);
        setIsDialogOpen(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDialogOpen(true);
    };

    const handleDeleteCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDeleteDialogOpen(true);
    };

    const handleViewCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsViewDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedCustomer(null);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setSelectedCustomer(null);
    };

    const handleCloseViewDialog = () => {
        setIsViewDialogOpen(false);
        setSelectedCustomer(null);
    };

    return {
        // State
        page,
        searchText,
        isActiveFilter,
        isDialogOpen,
        isDeleteDialogOpen,
        isViewDialogOpen,
        selectedCustomer,

        // Setters
        setPage,
        setSearchText,
        setIsActiveFilter,

        // Handlers
        handleSearch,
        handleIsActiveFilter,
        handleAddCustomer,
        handleEditCustomer,
        handleDeleteCustomer,
        handleViewCustomer,
        handleCloseDialog,
        handleCloseDeleteDialog,
        handleCloseViewDialog,
    };
}
