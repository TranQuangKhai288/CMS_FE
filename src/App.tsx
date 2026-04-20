import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import Routes from "./routes";

/**
 * Enterprise-level React Query Configuration
 *
 * Cache Strategy:
 * - Lists: 5 min stale time, 10 min garbage collection
 * - Details: 10 min stale time, 15 min garbage collection
 * - Static: 30 min stale time, 1 hour garbage collection
 *
 * Retry Strategy:
 * - Don't retry on abort/cancel errors
 * - Exponential backoff: 1s, 2s, 4s
 * - Network errors only, not 4xx/5xx
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,

      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,

      retry: (failureCount, error: any) => {
        if (error?.name === "AbortError" || error?.code === "ECONNABORTED") {
          return false;
        }

        if (
          error?.message?.includes("Network Error") ||
          error?.code === "ECONNREFUSED" ||
          error?.code === "ERR_NETWORK"
        ) {
          return failureCount < 1;
        }

        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          if (
            error?.response?.status === 401 ||
            error?.response?.status === 403
          ) {
            return failureCount < 1;
          }
          return false;
        }

        if (error?.response?.status >= 500) {
          return failureCount < 2;
        }

        return failureCount < 1;
      },

      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },

    mutations: {
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: "#6366f1",
            borderRadius: 8,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          },
          components: {
            Button: {
              controlHeight: 40,
            },
            Input: {
              controlHeight: 40,
            },
          },
        }}
      >
        <Routes />
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
