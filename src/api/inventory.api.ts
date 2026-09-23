import { api } from './client';

export interface CreateInventoryItemDto {
  name: string;
  category: string;
  quantity: number;
  holderName: string;
  holderUserId?: string;
  notes?: string;
}

export const inventoryApi = {
  getInventory: (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    return api.get(`/api/inventory${queryString ? `?${queryString}` : ''}`);
  },

  getInventoryItem: (id: string) => api.get(`/api/inventory/${id}`),

  createInventoryItem: (dto: CreateInventoryItemDto) =>
    api.post('/api/inventory', dto),

  updateInventoryItem: (id: string, dto: Partial<CreateInventoryItemDto>) =>
    api.put(`/api/inventory/${id}`, dto),

  deleteInventoryItem: (id: string) => api.delete(`/api/inventory/${id}`),
};
