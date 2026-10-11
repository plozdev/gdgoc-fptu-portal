/**
 * @file useInventoryStore.ts
 * @description Zustand store quản lý kho vật tư & quà tặng CLB, tích hợp trực tiếp PostgreSQL API.
 */

import { create } from 'zustand';
import { inventoryApi } from '../api/inventory.api';

// ==========================================
// TYPES
// ==========================================

export type InventoryCategory = 'Asset' | 'Gift' | 'Consumable';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  holderUserId?: string | null;
  holderName: string;        // Người đang giữ vật tư
  holderStudentId?: string;  // MSSV người giữ
  holderPhone?: string;      // SĐT người giữ
  assignedDate: string;      // dd/MM/yyyy
  notes?: string;            // Ghi chú / Mục đích sử dụng
}

// ==========================================
// STATE INTERFACE
// ==========================================

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'assignedDate'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export function mapBackendItemToFrontend(raw: any): InventoryItem {
  let assignedDate = new Date().toLocaleDateString('vi-VN');
  if (raw.assignedDate) {
    assignedDate = new Date(raw.assignedDate).toLocaleDateString('vi-VN');
  } else if (raw.createdAt) {
    assignedDate = new Date(raw.createdAt).toLocaleDateString('vi-VN');
  }

  // Parse studentId/phone from notes if stored there
  let holderStudentId: string | undefined = undefined;
  let holderPhone: string | undefined = undefined;
  if (raw.notes) {
    const studentMatch = raw.notes.match(/MSSV:\s*([A-Za-z0-9]+)/i);
    if (studentMatch) holderStudentId = studentMatch[1];
    const phoneMatch = raw.notes.match(/SĐT:\s*([0-9+]+)/i);
    if (phoneMatch) holderPhone = phoneMatch[1];
  }

  return {
    id: raw.id,
    name: raw.name,
    category: (raw.category || 'Asset') as InventoryCategory,
    quantity: Number(raw.quantity) || 0,
    holderUserId: raw.holderUserId,
    holderName: raw.holderName || 'Lưu tại tủ đồ CLB',
    holderStudentId,
    holderPhone,
    assignedDate,
    notes: raw.notes || '',
  };
}

// ==========================================
// STORE
// ==========================================

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await inventoryApi.getInventory({ limit: 100 });
      const rawList = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const mapped = rawList.map(mapBackendItemToFrontend);
      set({ items: mapped, isLoading: false });
    } catch (err: any) {
      console.error('[InventoryStore] fetchItems error:', err);
      set({ isLoading: false, error: err?.message || 'Lỗi tải danh sách kho vật tư' });
    }
  },

  addItem: async (itemData) => {
    set({ isLoading: true, error: null });
    try {
      // Pack extra details into notes if present
      let finalNotes = itemData.notes || '';
      if (itemData.holderStudentId && !finalNotes.includes(itemData.holderStudentId)) {
        finalNotes = finalNotes ? `${finalNotes} • MSSV: ${itemData.holderStudentId}` : `MSSV: ${itemData.holderStudentId}`;
      }
      if (itemData.holderPhone && !finalNotes.includes(itemData.holderPhone)) {
        finalNotes = finalNotes ? `${finalNotes} • SĐT: ${itemData.holderPhone}` : `SĐT: ${itemData.holderPhone}`;
      }

      const res: any = await inventoryApi.createInventoryItem({
        name: itemData.name,
        category: itemData.category,
        quantity: itemData.quantity,
        holderName: itemData.holderName,
        holderUserId: itemData.holderUserId,
        notes: finalNotes,
      });

      const newItem = mapBackendItemToFrontend(res);
      set((state) => ({
        items: [newItem, ...state.items],
        isLoading: false,
      }));
    } catch (err: any) {
      console.error('[InventoryStore] addItem error:', err);
      set({
        isLoading: false,
        error: err?.message || 'Lỗi thêm vật tư vào server',
      });
      throw err;
    }
  },

  updateItem: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      let finalNotes = updates.notes;
      if (updates.holderStudentId && finalNotes !== undefined && !finalNotes.includes(updates.holderStudentId)) {
        finalNotes = finalNotes ? `${finalNotes} • MSSV: ${updates.holderStudentId}` : `MSSV: ${updates.holderStudentId}`;
      }

      await inventoryApi.updateInventoryItem(id, {
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.quantity !== undefined && { quantity: updates.quantity }),
        ...(updates.holderUserId !== undefined && { holderUserId: updates.holderUserId }),
        ...(updates.holderName !== undefined && { holderName: updates.holderName }),
        ...(finalNotes !== undefined && { notes: finalNotes }),
      });

      set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        isLoading: false,
      }));
    } catch (err: any) {
      console.error('[InventoryStore] updateItem error:', err);
      set({
        isLoading: false,
        error: err?.message || 'Lỗi cập nhật vật tư',
      });
      throw err;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await inventoryApi.deleteInventoryItem(id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      console.error('[InventoryStore] deleteItem error:', err);
      set({ isLoading: false, error: err?.message || 'Lỗi xóa vật tư' });
      throw err;
    }
  },
}));
