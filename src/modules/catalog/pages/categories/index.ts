// Export all category-related types
export * from "./types";

// Export pages
export { default as CategoriesPage } from "./pages/CategoriesPage";

// Export components
export { default as CategoryDialog } from "./components/CategoryDialog";
export { default as DeleteCategoryDialog } from "./components/DeleteCategoryDialog";
export { default as CategoriesTable } from "./components/CategoriesTable";

// Export hooks
export { useCategoriesManagement } from "./hooks/useCategoriesManagement";
