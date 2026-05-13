import { apiClient } from './apiClient';

export interface Guide {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publicSlug?: string;
  createdAt: string;
  updatedAt: string;
  steps?: Step[];
  owner?: { id: string; email: string; name?: string };
  _count?: { steps: number };
}

export interface Step {
  id: string;
  index: number;
  actionType: string;
  selector?: string;
  url: string;
  textContent?: string;
  inputPreview?: string;
  screenshotKey?: string;
  title: string;
  description?: string;
  metadata?: any;
  createdAt: string;
}

export interface CreateGuideDto {
  title?: string;
  description?: string;
}

export interface UpdateGuideDto {
  title?: string;
  description?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface CreateStepDto {
  actionType: string;
  selector?: string;
  url: string;
  textContent?: string;
  inputPreview?: string;
  screenshotKey?: string;
  title?: string;
  description?: string;
  metadata?: any;
}

export interface UpdateStepDto {
  title?: string;
  description?: string;
  index?: number;
  screenshotKey?: string | null;
}

export const guidesService = {
  list: () => apiClient.get<Guide[]>('/guides'),

  get: (id: string) => apiClient.get<Guide>(`/guides/${id}`),

  create: (data: CreateGuideDto) => apiClient.post<Guide>('/guides', data),

  update: (id: string, data: UpdateGuideDto) => apiClient.patch<Guide>(`/guides/${id}`, data),

  delete: (id: string) => apiClient.delete<Guide>(`/guides/${id}`),

  createStep: (guideId: string, data: CreateStepDto) =>
    apiClient.post<Step>(`/guides/${guideId}/steps`, data),

  updateStep: (stepId: string, data: UpdateStepDto) =>
    apiClient.patch<Step>(`/steps/${stepId}`, data),

  deleteStep: (stepId: string) => apiClient.delete<Step>(`/steps/${stepId}`),

  reorderSteps: (guideId: string, updates: { id: string; index: number }[]) =>
    apiClient.patch(`/guides/${guideId}/reorder-steps`, { updates }),
};