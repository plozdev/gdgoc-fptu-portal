import { api } from './client';

export interface CreateGiftDto {
  name: string;
  description?: string;
  imageUrl?: string;
  gemsPrice: number;
  stock?: number;
  isActive?: boolean;
}

export const giftsApi = {
  getGifts: () => api.get('/api/gifts'),

  getGift: (id: string) => api.get(`/api/gifts/${id}`),

  createGift: (dto: CreateGiftDto) => api.post('/api/gifts', dto),

  updateGift: (id: string, dto: Partial<CreateGiftDto>) =>
    api.put(`/api/gifts/${id}`, dto),

  deleteGift: (id: string) => api.delete(`/api/gifts/${id}`),

  redeemGift: (giftItemId: string) =>
    api.post('/api/gifts/redeem', { giftItemId }),

  getRedemptions: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    return api.get(`/api/gifts/redemptions${queryString ? `?${queryString}` : ''}`);
  },

  updateRedemptionStatus: (
    id: string,
    dto: { status: string; notes?: string },
  ) => api.patch(`/api/gifts/redemptions/${id}/status`, dto),
};
