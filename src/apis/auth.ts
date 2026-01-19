import { api } from "@/lib/axios";
import type {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  AuthResponse,
  User,
  ApiResponse,
} from "../modules/auth/types";

export const authApi = {
  login: async (data: LoginDto) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data,
    );
    return response.data.data;
  },

  register: async (data: RegisterDto) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data,
    );
    return response.data.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<void>>("/auth/logout");
    return response.data;
  },

  refreshToken: async (data: RefreshTokenDto) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/refresh",
      data,
    );
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordDto) => {
    const response = await api.post<ApiResponse<void>>(
      "/auth/change-password",
      data,
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  },
};
