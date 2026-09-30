import { api, buildQueryString } from '../client';

export interface CreateInventoryItemDto {
  name: string;
  category: string;
  quantity: number;
  holderName: string;
  holderUserId?: string;
  notes?: string;
}

export const inventoryApi = {
  getInventory: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    api.get(`/api/inventory${buildQueryString(params)}`),

  getInventoryItem: (id: string) => api.get(`/api/inventory/${id}`),

  createInventoryItem: (dto: CreateInventoryItemDto) =>
    api.post('/api/inventory', dto),

  updateInventoryItem: (id: string, dto: Partial<CreateInventoryItemDto>) =>
    api.put(`/api/inventory/${id}`, dto),

  deleteInventoryItem: (id: string) => api.delete(`/api/inventory/${id}`),
};
