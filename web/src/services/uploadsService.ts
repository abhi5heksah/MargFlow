import { apiClient } from './apiClient';

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export const uploadsService = {
  getScreenshotPresignedUrl: (fileName: string, mimeType: string) =>
    apiClient.post<PresignedUrlResponse>('/uploads/screenshot-presigned', { fileName, mimeType }),

  getViewUrl: (key: string) =>
    apiClient.get<{ url: string }>(`/uploads/view/${encodeURIComponent(key)}`),

  deleteScreenshot: (key: string) =>
    apiClient.delete<{ success: boolean }>(`/uploads/screenshot/${encodeURIComponent(key)}`),
};