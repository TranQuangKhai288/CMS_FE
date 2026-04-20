import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import ProductsTable from "@/modules/catalog/pages/products/components/ProductsTable";
import { productsApi } from "@/apis/products";
import type { Product } from "@/modules/catalog/pages/products";

// Mock the products API
vi.mock("@/apis/products");

const mockProducts = {
  data: [
    {
      id: "1",
      name: "Test Product",
      sku: "TEST-001",
      price: 100,
      stock: 50,
      status: "ACTIVE",
      categories: [{ id: "1", name: "Category 1" }],
      createdAt: new Date().toISOString(),
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("ProductsTable Component", () => {
  beforeEach(() => {
    vi.mocked(productsApi.getProducts).mockResolvedValue(mockProducts as any);
  });

  it("should display products when data is loaded", async () => {
    render(
      <TestWrapper>
        <ProductsTable
          data={mockProducts.data as Product[]}
          loading={false}
          pagination={{
            current: mockProducts.pagination.page,
            pageSize: mockProducts.pagination.limit,
            total: mockProducts.pagination.total,
            onChange: function (page: number): void {
              throw new Error("Function not implemented.");
            },
          }}
          onEdit={function (product: Product): void {
            throw new Error("Function not implemented.");
          }}
          onDelete={function (product: Product): void {
            throw new Error("Function not implemented.");
          }}
        />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("TEST-001")).toBeInTheDocument();
    });
  });

  it("should show loading state initially", () => {
    render(
      <TestWrapper>
        <ProductsTable
          loading={true}
          data={[]}
          pagination={{
            current: 0,
            pageSize: 0,
            total: 0,
            onChange: function (page: number): void {
              throw new Error("Function not implemented.");
            },
          }}
          onEdit={function (product: Product): void {
            throw new Error("Function not implemented.");
          }}
          onDelete={function (product: Product): void {
            throw new Error("Function not implemented.");
          }}
        />
      </TestWrapper>,
    );

    // Ant Design Table shows loading state
    expect(document.querySelector(".ant-spin")).toBeInTheDocument();
  });
});
