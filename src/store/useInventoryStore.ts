import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InventoryCategory = 'Asset' | 'Gift' | 'Consumable';
export type AllocationStatus = 'Active' | 'Returned' | 'Consumed' | 'Damaged';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  totalQuantity: number;
  availableQuantity: number;
  description?: string;
  imageUrl?: string;
}

export interface ItemAllocation {
  id: string;
  itemId: string;
  memberId: string; // Refers to user session ID
  quantity: number;
  status: AllocationStatus;
  assignedDate: string; // dd/MM/yyyy
  returnDate?: string; // dd/MM/yyyy (Optional, if it's an asset to be returned)
  notes?: string;
}

interface InventoryState {
  items: InventoryItem[];
  allocations: ItemAllocation[];
  
  // Actions
  addItem: (item: Omit<InventoryItem, 'id' | 'availableQuantity'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  
  allocateItem: (allocation: Omit<ItemAllocation, 'id' | 'assignedDate'>) => void;
  updateAllocationStatus: (id: string, newStatus: AllocationStatus) => void;
  deleteAllocation: (id: string) => void;
}

// Initial mock data
const MOCK_ITEMS: InventoryItem[] = [
  { id: 'item-1', name: 'Standee GDGoC Gen 4', category: 'Asset', totalQuantity: 2, availableQuantity: 1 },
  { id: 'item-2', name: 'Áo Thun GDGoC Phiên Bản Mùa Hè', category: 'Gift', totalQuantity: 50, availableQuantity: 45 },
  { id: 'item-3', name: 'Bộ Mic Không Dây Rode', category: 'Asset', totalQuantity: 1, availableQuantity: 0 },
];

const MOCK_ALLOCATIONS: ItemAllocation[] = [
  {
    id: 'alloc-1',
    itemId: 'item-1',
    memberId: '7', // Media Lead
    quantity: 1,
    status: 'Active',
    assignedDate: '10/09/2026',
    notes: 'Mượn dùng sự kiện AI Showcase',
  },
  {
    id: 'alloc-2',
    itemId: 'item-2',
    memberId: '8', // HR-Event Lead
    quantity: 5,
    status: 'Active',
    assignedDate: '12/09/2026',
    notes: 'Phát cho Ban Tổ Chức sự kiện',
  },
  {
    id: 'alloc-3',
    itemId: 'item-3',
    memberId: '13', // Media Member
    quantity: 1,
    status: 'Active',
    assignedDate: '01/09/2026',
    notes: 'Quay phim phỏng vấn diễn giả',
  }
];

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: MOCK_ITEMS,
      allocations: MOCK_ALLOCATIONS,

      addItem: (itemData) => set((state) => {
        const newItem: InventoryItem = {
          ...itemData,
          id: `item-${Date.now()}`,
          availableQuantity: itemData.totalQuantity,
        };
        return { items: [newItem, ...state.items] };
      }),

      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),

      deleteItem: (id) => set((state) => {
        // Only delete if there are no active allocations
        const hasAllocations = state.allocations.some(a => a.itemId === id && a.status === 'Active');
        if (hasAllocations) {
          alert('Không thể xóa vật tư đang có người mượn/giữ!');
          return state;
        }
        return {
          items: state.items.filter(i => i.id !== id),
          allocations: state.allocations.filter(a => a.itemId !== id)
        };
      }),

      allocateItem: (allocData) => set((state) => {
        const item = state.items.find(i => i.id === allocData.itemId);
        if (!item || item.availableQuantity < allocData.quantity) {
          alert('Số lượng vật tư trong kho không đủ!');
          return state;
        }

        const newAlloc: ItemAllocation = {
          ...allocData,
          id: `alloc-${Date.now()}`,
          assignedDate: new Date().toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
        };

        return {
          allocations: [newAlloc, ...state.allocations],
          items: state.items.map(i => 
            i.id === item.id 
              ? { ...i, availableQuantity: i.availableQuantity - allocData.quantity }
              : i
          )
        };
      }),

      updateAllocationStatus: (id, newStatus) => set((state) => {
        const alloc = state.allocations.find(a => a.id === id);
        if (!alloc) return state;

        const isReturning = (newStatus === 'Returned' || newStatus === 'Damaged' || newStatus === 'Consumed') && alloc.status === 'Active';
        const isReActivating = newStatus === 'Active' && alloc.status !== 'Active';

        let quantityChange = 0;
        if (isReturning) quantityChange = alloc.quantity;
        else if (isReActivating) quantityChange = -alloc.quantity;

        return {
          allocations: state.allocations.map(a => 
            a.id === id ? { ...a, status: newStatus } : a
          ),
          items: state.items.map(i =>
            i.id === alloc.itemId
              ? { ...i, availableQuantity: i.availableQuantity + quantityChange }
              : i
          )
        };
      }),

      deleteAllocation: (id) => set((state) => {
        const alloc = state.allocations.find(a => a.id === id);
        if (!alloc) return state;

        // If it was active, restore available quantity
        const quantityChange = alloc.status === 'Active' ? alloc.quantity : 0;

        return {
          allocations: state.allocations.filter(a => a.id !== id),
          items: state.items.map(i =>
            i.id === alloc.itemId
              ? { ...i, availableQuantity: i.availableQuantity + quantityChange }
              : i
          )
        };
      })
    }),
    {
      name: 'gdg-inventory-storage',
    }
  )
);
