/**
 * @file useInventoryStore.ts
 * @description Zustand store quản lý kho vật tư & quà tặng CLB kết nối Backend API.
 */

import { create } from 'zustand';
import { inventoryApi } from '../api';

// ==========================================
// TYPES
// ==========================================

export type InventoryCategory = 'Asset' | 'Gift' | 'Consumable';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
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

function mapBackendItemToUi(item: any): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    category: (item.category as InventoryCategory) || 'Asset',
    quantity: item.quantity,
    holderName: item.holderName || item.holderUser?.fullName || 'Tủ CLB',
    holderStudentId: item.holderUser?.mssv,
    holderPhone: item.holderUser?.phoneNumber,
    assignedDate: item.assignedDate
      ? new Date(item.assignedDate).toLocaleDateString('vi-VN')
      : item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('vi-VN')
      : new Date().toLocaleDateString('vi-VN'),
    notes: item.notes || '',
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
      const res = await inventoryApi.getInventory({ limit: 100 });
      const rawItems = (res as any)?.items || (Array.isArray(res) ? res : []);
      const mapped = rawItems.map(mapBackendItemToUi);
      set({ items: mapped, isLoading: false });
    } catch (err: any) {
      console.error('[InventoryStore] Failed to fetch items:', err);
      set({ error: err.message || 'Không thể tải kho vật tư', isLoading: false });
    }
  },

  addItem: async (itemData) => {
    try {
      await inventoryApi.createInventoryItem({
        name: itemData.name,
        category: itemData.category,
        quantity: itemData.quantity,
        holderName: itemData.holderName,
        notes: itemData.notes,
      });
      await get().fetchItems();
    } catch (err: any) {
      console.error('[InventoryStore] Failed to add item:', err);
      throw err;
    }
  },

  updateItem: async (id, updates) => {
    try {
      await inventoryApi.updateInventoryItem(id, {
        name: updates.name,
        category: updates.category,
        quantity: updates.quantity,
        holderName: updates.holderName,
        notes: updates.notes,
      });
      await get().fetchItems();
    } catch (err: any) {
      console.error('[InventoryStore] Failed to update item:', err);
      throw err;
    }
  },

  deleteItem: async (id) => {
    try {
      await inventoryApi.deleteInventoryItem(id);
      await get().fetchItems();
    } catch (err: any) {
      console.error('[InventoryStore] Failed to delete item:', err);
      throw err;
    }
  },
}));
