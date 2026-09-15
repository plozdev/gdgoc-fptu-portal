import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InventoryCategory = 'Asset' | 'Gift' | 'Consumable';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  holderName: string;        // Người đang giữ vật tư (ví dụ: "Trần Nguyên Bảo (AI Lead)" hoặc "Lưu tại tủ đồ CLB")
  holderStudentId?: string;  // MSSV người giữ
  holderPhone?: string;      // SĐT người giữ
  assignedDate: string;      // dd/MM/yyyy
  notes?: string;            // Ghi chú / Mục đích sử dụng
}

interface InventoryState {
  items: InventoryItem[];
  
  // Actions
  addItem: (item: Omit<InventoryItem, 'id' | 'assignedDate'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
}

// Initial mock items with direct holders
const MOCK_ITEMS: InventoryItem[] = [
  { 
    id: 'item-1', 
    name: 'Standee GDGoC Gen 4 Chữ X', 
    category: 'Asset', 
    quantity: 2, 
    holderName: 'Vũ Thị Lan Hương (Media Lead)',
    holderStudentId: 'SE190505',
    holderPhone: '0907890123',
    assignedDate: '10/09/2026',
    notes: 'Giữ phục vụ backdrop cho sự kiện AI Showcase'
  },
  { 
    id: 'item-2', 
    name: 'Áo Thun GDGoC Phiên Bản Mùa Hè 2026', 
    category: 'Gift', 
    quantity: 45, 
    holderName: 'Bùi Đức Thịnh (HR-Event Lead)',
    holderStudentId: 'SE190606',
    holderPhone: '0908901234',
    assignedDate: '12/09/2026',
    notes: 'Túi quà tặng cho diễn giả và khách mời workshop'
  },
  { 
    id: 'item-3', 
    name: 'Bộ Mic Không Dây Rode Wireless GO II', 
    category: 'Asset', 
    quantity: 1, 
    holderName: 'Lê Minh Tú (Media Member)',
    holderStudentId: 'SE211111',
    holderPhone: '0913456789',
    assignedDate: '01/09/2026',
    notes: 'Dùng quay video phỏng vấn và livestream'
  },
  { 
    id: 'item-4', 
    name: 'Sticker Hologram GDG on Campus (Pack 200 cái)', 
    category: 'Consumable', 
    quantity: 200, 
    holderName: 'Lưu tại tủ đồ CLB (Phòng 204)',
    assignedDate: '15/09/2026',
    notes: 'Dán laptop phát cho tân sinh viên K22'
  }
];

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      items: MOCK_ITEMS,

      addItem: (itemData) => set((state) => {
        const newItem: InventoryItem = {
          ...itemData,
          id: `item-${Date.now()}`,
          assignedDate: new Date().toLocaleDateString('vi-VN'),
        };
        return { items: [newItem, ...state.items] };
      }),

      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),

      deleteItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
    }),
    {
      name: 'gdgoc_inventory_store_v2',
    }
  )
);
