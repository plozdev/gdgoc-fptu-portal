import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useInventoryStore, InventoryItem, InventoryCategory } from '../../store/useInventoryStore';
import { useMemberStore } from '../../store/useMemberStore';
import { 
  PackageSearch,
  PackagePlus,
  Archive,
  Gift,
  Boxes,
  User,
  Calendar,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Phone,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const InventoryManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { items, addItem, updateItem, deleteItem } = useInventoryStore();
  const { members } = useMemberStore();

  // 🚨 CRITICAL RULE: Chỉ Ban Chủ Nhiệm (Chapter Lead & Co-Chapter Lead) mới có quyền truy cập.
  if (user?.tier !== 'ORG_ADMIN') {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | InventoryCategory>('all');

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // Form state
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<InventoryCategory>('Asset');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedHolderId, setSelectedHolderId] = useState<string>('club_cabinet');
  const [customHolderName, setCustomHolderName] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setItemName('');
    setItemCategory('Asset');
    setItemQuantity(1);
    setSelectedHolderId('club_cabinet');
    setCustomHolderName('');
    setItemNotes('');
    setShowItemModal(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setItemToEdit(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemQuantity(item.quantity);
    
    // Check if holder matches a member
    const matchedMember = members.find(m => item.holderName.includes(m.name));
    if (matchedMember) {
      setSelectedHolderId(matchedMember.id);
      setCustomHolderName('');
    } else if (item.holderName.includes('tủ') || item.holderName.includes('CLB')) {
      setSelectedHolderId('club_cabinet');
      setCustomHolderName('');
    } else {
      setSelectedHolderId('custom');
      setCustomHolderName(item.holderName);
    }

    setItemNotes(item.notes || '');
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || itemQuantity <= 0) return;

    let holderName = '';
    let holderStudentId: string | undefined = undefined;
    let holderPhone: string | undefined = undefined;

    if (selectedHolderId === 'club_cabinet') {
      holderName = 'Lưu tại tủ đồ CLB (Chưa bàn giao)';
    } else if (selectedHolderId === 'custom') {
      holderName = customHolderName.trim() || 'Chưa bàn giao';
    } else {
      const mem = members.find(m => m.id === selectedHolderId);
      if (mem) {
        holderName = `${mem.name} (${mem.position})`;
        holderStudentId = mem.studentId;
        holderPhone = mem.phone;
      } else {
        holderName = 'Thành viên CLB';
      }
    }

    if (itemToEdit) {
      updateItem(itemToEdit.id, {
        name: itemName.trim(),
        category: itemCategory,
        quantity: itemQuantity,
        holderName,
        holderStudentId,
        holderPhone,
        notes: itemNotes.trim()
      });
    } else {
      addItem({
        name: itemName.trim(),
        category: itemCategory,
        quantity: itemQuantity,
        holderName,
        holderStudentId,
        holderPhone,
        notes: itemNotes.trim()
      });
    }

    setShowItemModal(false);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  // Filtered items
  const filteredItems = items.filter(item => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      item.name.toLowerCase().includes(query) ||
      item.holderName.toLowerCase().includes(query) ||
      (item.holderStudentId && item.holderStudentId.toLowerCase().includes(query)) ||
      (item.notes && item.notes.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (cat: InventoryCategory) => {
    switch(cat) {
      case 'Asset': return <Boxes className="w-4 h-4 text-blue-500" />;
      case 'Gift': return <Gift className="w-4 h-4 text-pink-500" />;
      case 'Consumable': return <Archive className="w-4 h-4 text-amber-500" />;
    }
  };

  const getCategoryBadge = (cat: InventoryCategory) => {
    switch(cat) {
      case 'Asset': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Tài sản cố định</span>;
      case 'Gift': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">Quà tặng / Swag</span>;
      case 'Consumable': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Đồ tiêu hao</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono-code">
              INVENTORY MANAGEMENT
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Lưu trữ phân tán giữa các thành viên</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>Quản Lý Vật Tư & Quà Tặng CLB</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono-code">
              {items.length} vật phẩm
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Do CLB không có kho lưu trữ cố định, hệ thống theo dõi trực tiếp thành viên nào đang giữ vật tư gì.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <PackagePlus className="w-4 h-4" />
          <span>Thêm Vật Tư Mới</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên đồ vật, tên người giữ hoặc MSSV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất Cả ({items.length})
            </button>
            <button
              onClick={() => setCategoryFilter('Asset')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'Asset' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tài Sản
            </button>
            <button
              onClick={() => setCategoryFilter('Gift')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'Gift' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quà Tặng
            </button>
            <button
              onClick={() => setCategoryFilter('Consumable')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'Consumable' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đồ Tiêu Hao
            </button>
          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tên Vật Tư & Loại</th>
                <th className="px-4 py-3">Số Lượng</th>
                <th className="px-4 py-3">Người Đang Giữ Vật Tư</th>
                <th className="px-4 py-3">Ngày Giao & Ghi Chú</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Không tìm thấy vật tư nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isClubCabinet = item.holderName.includes('tủ') || item.holderName.includes('CLB') || item.holderName.includes('Chưa bàn giao');

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Category */}
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</p>
                            <div className="mt-0.5">{getCategoryBadge(item.category)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono-code font-extrabold text-sm text-slate-900">
                          {item.quantity}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1">món</span>
                      </td>

                      {/* Người Đang Giữ */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            isClubCabinet ? 'bg-slate-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            {isClubCabinet ? '🏠' : item.holderName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{item.holderName}</p>
                            {item.holderPhone && (
                              <p className="text-[10px] text-slate-500 font-mono-code flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                <span>{item.holderPhone}</span>
                                {item.holderStudentId && <span>• #{item.holderStudentId}</span>}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Ngày Giao & Ghi Chú */}
                      <td className="px-4 py-3.5">
                        <p className="text-slate-700 text-xs">{item.notes || 'Không có ghi chú'}</p>
                        <p className="text-[10px] text-slate-400 font-mono-code mt-0.5">
                          Cập nhật: {item.assignedDate}
                        </p>
                      </td>

                      {/* Thao Tác */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Chỉnh sửa vật tư hoặc đổi người giữ"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            title="Xóa vật phẩm"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">
                {itemToEdit ? 'Chỉnh Sửa Vật Tư & Người Giữ' : 'Thêm Vật Tư Mới'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              {/* Tên vật phẩm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Vật Tư / Quà Tặng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Standee GDGoC Gen 4, Áo thun mùa hè..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Danh mục */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Danh Mục
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Asset">Tài Sản Lâu Dài</option>
                    <option value="Gift">Quà Tặng / Swag</option>
                    <option value="Consumable">Đồ Tiêu Hao</option>
                  </select>
                </div>

                {/* Số lượng */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono-code font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Gán Người Giữ Luôn Khi Tạo */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2.5">
                <label className="block text-xs font-extrabold text-blue-900">
                  Gán Trực Tiếp Người Đang Giữ Vật Tư:
                </label>
                <select
                  value={selectedHolderId}
                  onChange={(e) => setSelectedHolderId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="club_cabinet">🏠 Lưu tại tủ đồ CLB (Chưa bàn giao)</option>
                  <optgroup label="Thành viên CLB">
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.position}) - #{m.studentId}
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">✏️ Nhập tên người giữ khác...</option>
                </select>

                {selectedHolderId === 'custom' && (
                  <input
                    type="text"
                    placeholder="Nhập tên người đang giữ (ví dụ: Diễn giả, Đối tác...)"
                    value={customHolderName}
                    onChange={(e) => setCustomHolderName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-400 rounded-xl text-xs font-medium focus:outline-none mt-2"
                  />
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mục Đích / Ghi Chú Sử Dụng
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Giữ phục vụ workshop AI Showcase ngày 20/09..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none resize-none"
                />
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{itemToEdit ? 'Lưu Thay Đổi' : 'Tạo Vật Tư'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Xóa Vật Tư Này?</h3>
            <p className="text-xs text-slate-500">
              Bạn có chắc chắn muốn xóa <strong>{itemToDelete.name}</strong>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Xóa Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
