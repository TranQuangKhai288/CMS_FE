import { useState } from "react";
import type { Category } from "../types";

export function useCategoriesManagement() {
  const [searchText, setSearchText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  // Utility function to filter categories tree by search text
  const filterCategories = (
    categories: Category[],
    search: string,
  ): Category[] => {
    if (!search) return categories;

    const filtered: Category[] = [];

    for (const cat of categories) {
      const matchesSearch = cat.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const filteredChildren = cat.children
        ? filterCategories(cat.children, search)
        : [];

      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...cat,
          children:
            filteredChildren.length > 0 ? filteredChildren : cat.children,
        });
      }
    }

    return filtered;
  };

  return {
    // State
    searchText,
    isDialogOpen,
    isDeleteDialogOpen,
    selectedCategory,
    // Setters
    setSearchText,
    // Handlers
    handleSearch,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleCloseDialog,
    handleCloseDeleteDialog,
    // Utilities
    filterCategories,
  };
}
