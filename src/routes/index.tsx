import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/modules/auth/pages/LoginPage";
import { useAuthStore } from "@/modules/auth/store";
import React from "react";

import DashboardPage from "@/modules/dashboard/DashboardPage";
import UsersPage from "@/modules/users/pages/UsersPage";
import { CategoriesProductsPage } from "@/modules/catalog";
import ProductDetailPage from "@/modules/catalog/pages/products/pages/ProductDetailPage";
import OrdersPage from "@/modules/orders/pages/OrdersPage";
import OrderDetailPage from "@/modules/orders/pages/OrderDetailPage";
import CustomersPage from "@/modules/customers/pages/CustomersPage";
import DiscountsPage from "@/modules/discounts/pages/DiscountsPage";
import InventoryPage from "@/modules/inventory/pages/InventoryPage";
import RolesPage from "@/modules/roles/pages/RolesPage";
import MediaPage from "@/modules/media/pages/MediaPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      {
        path: "products-and-categories",
        children: [
          {
            index: true,
            element: <CategoriesProductsPage />,
          },
          {
            path: "products/:id",
            element: <ProductDetailPage />,
          },
        ],
      },
      {
        path: "orders",
        children: [
          {
            index: true,
            element: <OrdersPage />,
          },
          {
            path: ":id",
            element: <OrderDetailPage />,
          },
        ],
      },
      {
        path: "customers",
        element: <CustomersPage />,
      },
      {
        path: "discounts",
        element: <DiscountsPage />,
      },
      {
        path: "inventory",
        element: <InventoryPage />,
      },
      {
        path: "roles",
        element: <RolesPage />,
      },
      {
        path: "media",
        element: <MediaPage />,
      },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
