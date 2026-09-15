import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useInventoryStore, InventoryCategory, AllocationStatus } from '../../store/useInventoryStore';
import { mockUsers } from '../../mocks/fixtures/users';
import { 
  PackageSearch,
  PackagePlus,
  ShieldAlert,
  ArrowLeftRight,
  Archive,
  Gift,
  Boxes,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const InventoryManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { items, allocations, addItem, allocateItem, updateAllocationStatus } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'allocations'>('inventory');
  
  // Modals state
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAllocate, setShowAllocate] = useState(false);
  
  // Form state - Add Item
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('Asset');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  // Form state - Allocate Item
  const [allocItemId, setAllocItemId] = useState('');
  const [allocMemberId, setAllocMemberId] = useState('');
  const [allocQuantity, setAllocQuantity] = useState(1);
  const [allocNotes, setAllocNotes] = useState('');

  // 🚨 CRITICAL RULE: "Chỉ BCN và Lead quản lý khâu này"
  const hasAccess = user?.tier === 'ORG_ADMIN' || user?.tier === 'BAN_LEAD';

  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border-2 border-red-200 shadow-lg text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">
            Quyền Truy Cập Bị Từ Chối (403)
          </h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Phân hệ <strong>Quản Lý Vật Tư & Quà Tặng</strong> chỉ dành riêng cho <strong>Ban Chủ Nhiệm và Trưởng Ban</strong> do tính bảo mật tài sản. Vai trò hiện tại của bạn (<span className="text-blue-600 font-bold">{user?.tier}</span>) không được cấp quyền.
          </p>
          <Link
            to="/app/dashboard"
            className="inline-block px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors"
          >
            Về Màn Hình Chính
          </Link>
        </div>
      </div>
    );
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemQuantity <= 0) return;
    addItem({
      name: newItemName,
      category: newItemCategory,
      totalQuantity: newItemQuantity,
    });
    setNewItemName('');
    setNewItemQuantity(1);
    setShowAddItem(false);
  };

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocItemId || !allocMemberId || allocQuantity <= 0) return;
    
    allocateItem({
      itemId: allocItemId,
      memberId: allocMemberId,
      quantity: allocQuantity,
      status: 'Active',
      notes: allocNotes,
    });
    
    setAllocItemId('');
    setAllocMemberId('');
    setAllocQuantity(1);
    setAllocNotes('');
    setShowAllocate(false);
    setActiveTab('allocations');
  };

  const getCategoryIcon = (cat: InventoryCategory) => {
    switch(cat) {
      case 'Asset': return <Boxes className="w-4 h-4 text-blue-500" />;
      case 'Gift': return <Gift className="w-4 h-4 text-pink-500" />;
      case 'Consumable': return <Archive className="w-4 h-4 text-amber-500" />; // Used lucide icon instead of Package
    }
  };

  const getStatusBadge = (status: AllocationStatus) => {
    switch(status) {
      case 'Active': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Đang Giữ</span>;
      case 'Returned': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Đã Trả</span>;
      case 'Consumed': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Đã Dùng</span>;
      case 'Damaged': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Hỏng/Mất</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono-code">
              INVENTORY HUB
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Lưu trữ phân tán</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Quản Lý Vật Tư & Quà Tặng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi, phân bổ và quản lý tài sản chung của CLB đang được các thành viên giữ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAllocate(true)}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Phân Bổ Cho TV</span>
          </button>
          <button 
            onClick={() => setShowAddItem(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PackagePlus className="w-4 h-4 text-emerald-400" />
            <span>Thêm Vật Tư Mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'inventory' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Kho Vật Tư Hiện Tại
        </button>
        <button
          onClick={() => setActiveTab('allocations')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'allocations' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Lịch Sử Phân Bổ
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'allocations' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
            {allocations.filter(a => a.status === 'Active').length} Active
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.category}</span>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{item.name}</h3>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Sẵn Sàng / Tổng</p>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5 font-mono-code">
                    <span className={item.availableQuantity === 0 ? 'text-red-500' : 'text-emerald-600'}>
                      {item.availableQuantity}
                    </span>
                    <span className="text-slate-400"> / {item.totalQuantity}</span>
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setAllocItemId(item.id);
                    setShowAllocate(true);
                  }}
                  disabled={item.availableQuantity === 0}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Phân Bổ
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
               <PackageSearch className="w-12 h-12 mx-auto mb-3 text-slate-300" />
               <p className="text-sm font-bold">Chưa có vật tư nào trong kho.</p>
             </div>
          )}
        </div>
      )}

      {activeTab === 'allocations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-bold">
                  <th className="p-4 w-[25%]">Vật Tư</th>
                  <th className="p-4 w-[25%]">Người Giữ</th>
                  <th className="p-4 text-center w-[10%]">SL</th>
                  <th className="p-4 w-[15%]">Ngày Nhận</th>
                  <th className="p-4 text-center w-[10%]">Trạng Thái</th>
                  <th className="p-4 text-right w-[15%]">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map((alloc) => {
                  const item = items.find(i => i.id === alloc.itemId);
                  const member = mockUsers.find(u => u.id === alloc.memberId);
                  return (
                    <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {item && getCategoryIcon(item.category)}
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item?.name || 'Vật tư đã xóa'}</p>
                            {alloc.notes && <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">{alloc.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{member?.name || 'Người dùng ẩn'}</p>
                            <p className="text-[10px] text-slate-500">{member?.banName || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-mono-code text-sm font-bold text-slate-700">{alloc.quantity}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{alloc.assignedDate}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(alloc.status)}
                      </td>
                      <td className="p-4 text-right">
                        {alloc.status === 'Active' && (
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => updateAllocationStatus(alloc.id, 'Returned')}
                              title="Thu hồi vật tư"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            {(item?.category === 'Gift' || item?.category === 'Consumable') && (
                              <button 
                                onClick={() => updateAllocationStatus(alloc.id, 'Consumed')}
                                title="Đã sử dụng/tiêu hao"
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => updateAllocationStatus(alloc.id, 'Damaged')}
                              title="Báo Hỏng/Mất"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-slate-500 font-medium">
                      Chưa có lịch sử phân bổ vật tư nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-extrabold text-slate-900">Thêm Vật Tư / Quà Tặng Mới</h3>
            </div>
            <form onSubmit={handleAddItem} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên vật phẩm</label>
                <input 
                  type="text" required 
                  value={newItemName} onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="VD: Áo thun sự kiện, Standee..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phân Loại</label>
                  <select 
                    value={newItemCategory} onChange={e => setNewItemCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Asset">Tài sản (Sử dụng lâu dài)</option>
                    <option value="Gift">Quà Tặng (Phát cho TV/Khách)</option>
                    <option value="Consumable">Vật tư tiêu hao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Số lượng nhập</label>
                  <input 
                    type="number" min="1" required 
                    value={newItemQuantity} onChange={e => setNewItemQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono-code bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddItem(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer">
                  Lưu Vật Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAllocate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-extrabold text-slate-900">Phân Bổ Vật Tư Cho Thành Viên</h3>
            </div>
            <form onSubmit={handleAllocate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Chọn Vật Tư</label>
                <select 
                  required value={allocItemId} onChange={e => setAllocItemId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="">-- Chọn vật tư trong kho --</option>
                  {items.filter(i => i.availableQuantity > 0).map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Còn {i.availableQuantity})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Giao Cho Thành Viên</label>
                <select 
                  required value={allocMemberId} onChange={e => setAllocMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="">-- Chọn người giữ vật tư --</option>
                  {mockUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} - {u.banName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Số Lượng Giao</label>
                  <input 
                    type="number" min="1" 
                    max={allocItemId ? items.find(i => i.id === allocItemId)?.availableQuantity || 1 : 1}
                    required 
                    value={allocQuantity} onChange={e => setAllocQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono-code bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ghi Chú Mục Đích (Tùy chọn)</label>
                <textarea 
                  rows={2}
                  value={allocNotes} onChange={e => setAllocNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="VD: Mượn quay video clip intro..."
                />
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAllocate(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer">
                  Xác Nhận Phân Bổ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
