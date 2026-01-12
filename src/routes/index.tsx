import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/modules/auth/pages/LoginPage";
import { useAuthStore } from "@/modules/auth/store";
import React from "react";

import UsersPage from "@/modules/users/pages/UsersPage";
import ProductsPage from "@/modules/products/pages/ProductsPage";

const Dashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Products</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
      </div>
    </div>
  </div>
);

const ModulePlaceholder = ({ title }: { title: string }) => (
  <div>
    <h1 className="text-2xl font-bold mb-6">{title}</h1>
    <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
      <p className="text-gray-500">This module is under development.</p>
    </div>
  </div>
);

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
      { index: true, element: <Dashboard /> },
      { path: "users", element: <UsersPage /> },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "categories",
        element: <ModulePlaceholder title="Categories Management" />,
      },
      {
        path: "orders",
        element: <ModulePlaceholder title="Orders Management" />,
      },
      {
        path: "discounts",
        element: <ModulePlaceholder title="Discounts Management" />,
      },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
