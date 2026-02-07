import { QueryClient } from "@tanstack/react-query";

/**
 * Quản lý cache để tránh lưu trữ error results
 * Nguyên tắc: Nếu query fail do abort/cancel hoặc error, không cache kết quả
 */

/**
 * Setup error handling cho QueryClient
 * Gọi hàm này một lần trong App initialization
 */
export function setupCacheErrorHandling(queryClient: QueryClient) {
  // Xử lý error khi query fail
  queryClient.getDefaultOptions().queries = {
    ...queryClient.getDefaultOptions().queries,

    // Hàm này chạy khi query throw error
    // Return false để không cache error
    throwOnError: false,
  };

  // Invalidate cache khi request bị abort/cancel
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      return await originalFetch(...args);
    } catch (error: any) {
      if (error?.name === "AbortError") {
        throw error;
      }
      throw error;
    }
  };
}

/**
 * Helper function để clear cache của một query key
 * Sử dụng khi user manually hủy request
 */
export function clearQueryCache(queryClient: QueryClient, queryKey: string[]) {
  queryClient.removeQueries({
    queryKey,
  });
}

/**
 * Helper function để invalidate cache (đánh dấu stale)
 * Sử dụng khi có mutation thành công
 */
export function invalidateQueries(
  queryClient: QueryClient,
  queryKey: string[],
) {
  queryClient.invalidateQueries({
    queryKey,
  });
}

/**
 * Helper function để refetch query ngay lập tức
 * Sử dụng khi user click "Retry"
 */
export async function refetchQuery(
  queryClient: QueryClient,
  queryKey: string[],
) {
  return queryClient.refetchQueries({
    queryKey,
  });
}

/**
 * Helper function để reset cache hoàn toàn
 * Sử dụng khi logout
 */
export function resetAllCache(queryClient: QueryClient) {
  queryClient.clear();
}

/**
 * Monitor error và log cho debugging
 * Giúp track các query nào bị error
 */
export function setupQueryErrorLogging() {
  // Track failed queries
  const failedQueries = new Map<string, { count: number; lastError: any }>();

  // Expose để debugging
  (window as any).__failedQueries = failedQueries;
}

/**
 * Tự động clear error queries sau một khoảng thời gian
 * Giúp prevent memory leak từ error cache
 */
export function setupAutoCleanupErrorQueries(
  queryClient: QueryClient,
  timeout: number = 5 * 60 * 1000, // 5 minutes
) {
  setInterval(() => {
    const queries = queryClient.getQueryCache().getAll();

    queries.forEach((query) => {
      // Nếu query có error state và chưa được update lâu
      if (query.state.status === "error") {
        const lastUpdated = query.state.dataUpdatedAt;
        const now = Date.now();

        if (now - lastUpdated > timeout) {
          // Clear error cache
          queryClient.removeQueries({
            queryKey: query.queryKey,
          });
        }
      }
    });
  }, 60 * 1000); // Check mỗi 1 phút
}

/**
 * Get cache statistics (debugging)
 */
export function getCacheStats(queryClient: QueryClient) {
  const queries = queryClient.getQueryCache().getAll();

  const stats = {
    total: queries.length,
    fresh: queries.filter((q) => q.state.status === "success" && !q.isStale())
      .length,
    stale: queries.filter((q) => q.isStale()).length,
    error: queries.filter((q) => q.state.status === "error").length,
    loading: queries.filter((q) => q.state.fetchStatus === "fetching").length,
  };

  return stats;
}

/**
 * Debug function - log tất cả queries hiện tại
 */
export function debugQueries(queryClient: QueryClient) {
  const queries = queryClient.getQueryCache().getAll();

  console.table(
    queries.map((q) => ({
      key: JSON.stringify(q.queryKey),
      status: q.state.status,
      stale: q.isStale(),
      data: q.state.data ? "✓" : "✗",
      error: q.state.error ? "✓" : "✗",
    })),
  );
}
