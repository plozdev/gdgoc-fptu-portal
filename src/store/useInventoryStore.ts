/**
 * @file useInventoryStore.ts
 * @description Zustand store quản lý kho vật tư & quà tặng CLB.
 *
 * ⚠️  MOCK DATA ĐÃ BỊ XÓA — Store bắt đầu với danh sách rỗng.
 * Khi backend được tích hợp, data sẽ được fetch từ GET /api/inventory.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addItem: (item: Omit<InventoryItem, 'id' | 'assignedDate'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
}

// ==========================================
// STORE
// ==========================================

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      items: [], // Empty — data comes from backend

      addItem: (itemData) =>
        set((state) => {
          const newItem: InventoryItem = {
            ...itemData,
            id: `item-${Date.now()}`,
            assignedDate: new Date().toLocaleDateString('vi-VN'),
          };
          return { items: [newItem, ...state.items] };
        }),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
    }),
    {
      name: 'gdgoc_inventory_store_v2',
    }
  )
);
