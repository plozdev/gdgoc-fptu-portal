import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ShieldAlert, 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Shield, 
  CheckCircle, 
  Sparkles,
  Calendar,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { mockUsers, BAN_NAMES, BanId } from '../../mocks/fixtures/users';
import { useGenerationStore } from '../../store/useGenerationStore';

export const HRManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { currentGen } = useGenerationStore();
  const [selectedBan, setSelectedBan] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 🚨 CRITICAL RULE: "Chỉ có role đứng đầu mới xem được"
  if (user?.tier !== 'ORG_ADMIN') {
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
            Phân hệ <strong>Nhân Sự & Niên Khóa</strong> chỉ dành riêng cho <strong>Ban Chủ Nhiệm (Chapter Lead & Co-Chapter Lead)</strong>. Vai trò hiện tại của bạn (<span className="text-blue-600 font-bold">{user?.tier}</span>) không được cấp quyền xem dữ liệu nhân sự tổng.
          </p>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Bảng Tổng Quan</span>
          </Link>
        </div>
      </div>
    );
  }

  // Filter users
  const filteredUsers = mockUsers.filter(u => {
    const matchesBan = selectedBan === 'all' || u.banId === selectedBan;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBan && matchesSearch;
  });

  const banTabs = [
    { id: 'all', label: 'Tất Cả Các Ban', count: mockUsers.length },
    { id: 'ai', label: 'Ban AI', count: mockUsers.filter(u => u.banId === 'ai').length },
    { id: 'cloud', label: 'Ban Cloud', count: mockUsers.filter(u => u.banId === 'cloud').length },
    { id: 'web', label: 'Ban Web', count: mockUsers.filter(u => u.banId === 'web').length },
    { id: 'research', label: 'Ban Research', count: mockUsers.filter(u => u.banId === 'research').length },
    { id: 'media', label: 'Ban Media', count: mockUsers.filter(u => u.banId === 'media').length },
    { id: 'hr-event', label: 'Ban HR-Event', count: mockUsers.filter(u => u.banId === 'hr-event').length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Niên khóa Control for ORG_ADMIN */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 font-mono-code">
              ĐẶC QUYỀN CHAPTER LEAD
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Quản trị niên khóa hoạt động</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>Niên Khóa Đang Hoạt Động:</span>
            <span className="text-[#4285F4]">{currentGen}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chuyển niên khóa sẽ lưu trữ dữ liệu cũ thành Read-Only và tạo môi trường mới cho nhiệm kỳ tiếp theo.
          </p>
        </div>

        <Link
          to="/app/settings/generation"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Cấu Hình & Chuyển Niên Khóa</span>
        </Link>
      </div>

      {/* Directory & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Thành Viên</span>
            </button>
          </div>
        </div>

        {/* Ban Filter Tabs */}
        <div className="flex overflow-x-auto px-4 border-b border-slate-200 bg-white gap-2 py-2.5 custom-scrollbar">
          {banTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedBan(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedBan === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-code ${
                selectedBan === tab.id ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Thành Viên</th>
                <th className="px-4 py-3">Cấp Bậc (Tier)</th>
                <th className="px-4 py-3">Ban Chuyên Môn</th>
                <th className="px-4 py-3">Email FPT</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => {
                const isAdmin = u.tier === 'ORG_ADMIN';
                const isLead = u.tier === 'BAN_LEAD';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                          isAdmin ? 'bg-[#EA4335]' : isLead ? 'bg-[#4285F4]' : 'bg-[#34A853]'
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono-code">ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        isAdmin 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : isLead 
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {isAdmin ? '👑 ORG_ADMIN' : isLead ? '⚡ BAN_LEAD' : 'BAN_MEMBER'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {u.banName || 'Ban Chủ Nhiệm'}
                    </td>
                    <td className="px-4 py-3 font-mono-code text-slate-600">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer">
                        Phân Quyền
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
