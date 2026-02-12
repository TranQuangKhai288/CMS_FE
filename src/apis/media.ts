import { api } from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

export interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  title?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadResponse {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  title?: string;
}

export interface MediaListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  mimeType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const mediaApi = {
  // Upload single file
  uploadFile: async (
    file: File,
    options?: { folder?: string; alt?: string; title?: string },
  ): Promise<ApiResponse<MediaUploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.folder) formData.append("folder", options.folder);
    if (options?.alt) formData.append("alt", options.alt);
    if (options?.title) formData.append("title", options.title);

    const response = await api.post("/admin/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Upload multiple files
  uploadFiles: async (
    files: File[],
    options?: { folder?: string },
  ): Promise<ApiResponse<MediaUploadResponse[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    if (options?.folder) formData.append("folder", options.folder);

    const response = await api.post("/admin/media/upload-multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all media
  getMedia: async (params?: MediaListParams): Promise<ApiResponse<Media[]>> => {
    const response = await api.get("/admin/media", { params });
    return response.data;
  },

  // Get media by ID
  getMediaById: async (id: string): Promise<ApiResponse<Media>> => {
    const response = await api.get(`/admin/media/${id}`);
    return response.data;
  },

  // Delete media
  deleteMedia: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/admin/media/${id}`);
    return response.data;
  },

  // Bulk delete
  bulkDelete: async (ids: string[]): Promise<ApiResponse<void>> => {
    const response = await api.post("/admin/media/bulk-delete", { ids });
    return response.data;
  },
};
