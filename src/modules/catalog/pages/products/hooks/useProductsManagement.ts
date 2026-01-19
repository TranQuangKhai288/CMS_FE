import { useState } from "react";
import type { Product } from "../types";

export function useProductsManagement() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [limit] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  return {
    // State
    page,
    searchText,
    limit,
    isDialogOpen,
    isDeleteDialogOpen,
    selectedProduct,
    // Setters
    setPage,
    setSearchText,
    // Handlers
    handleSearch,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleCloseDialog,
    handleCloseDeleteDialog,
  };
}
