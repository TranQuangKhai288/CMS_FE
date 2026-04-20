import axios from "axios";
import type { ApiResponse, AuthResponse } from "@/modules/auth/types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Store for managing request cancellation
const pendingRequests = new Map<string, AbortController>();

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Helper function to generate request key for deduplication
const generateRequestKey = (config: any): string => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
};

// Helper function to cancel pending request
export const cancelPendingRequest = (config: any) => {
  const key = generateRequestKey(config);
  const controller = pendingRequests.get(key);
  if (controller) {
    controller.abort();
    pendingRequests.delete(key);
  }
};

// Helper function to cancel all pending requests
export const cancelAllPendingRequests = () => {
  pendingRequests.forEach((controller) => {
    controller.abort();
  });
  pendingRequests.clear();
};

// Request interceptor - thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    // Tạo AbortController cho request này
    const controller = new AbortController();
    const key = generateRequestKey(config);

    // Hủy request cũ cùng key nếu có (prevent duplicate requests)
    cancelPendingRequest(config);

    // Lưu controller để có thể hủy sau
    pendingRequests.set(key, controller);
    config.signal = controller.signal;

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - tự động refresh token khi hết hạn
api.interceptors.response.use(
  (response) => {
    // Xóa request khỏi pending list khi thành công
    const key = generateRequestKey(response.config);
    pendingRequests.delete(key);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xóa request khỏi pending list nếu bị hủy
    if (originalRequest) {
      const key = generateRequestKey(originalRequest);
      pendingRequests.delete(key);
    }

    // Nếu lỗi là do abort (hủy request), không retry
    if (error.name === "AbortError" || error.code === "ECONNABORTED") {
      return Promise.reject(error);
    }

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // Không có refresh token, chuyển về trang login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const response = await axios.post<ApiResponse<AuthResponse>>(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Lưu token mới
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Cập nhật store nếu có
        try {
          const { useAuthStore } = await import("@/modules/auth/store");
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        } catch {}

        // Xử lý queue
        processQueue(null, accessToken);

        // Retry request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại, đăng xuất user
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
