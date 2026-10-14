import { matchesMemberGroup } from '../../utils/memberGroups';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGenerationStore } from '../../store/useGenerationStore';
import { useMemberStore, Member } from '../../store/useMemberStore';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  RotateCcw,
  FileSpreadsheet,
  Edit2,
  Trash2,
  AlertTriangle,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  Shield,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { MemberModal } from '../../components/hr/MemberModal';
import { ExcelImportModal } from '../../components/hr/ExcelImportModal';

export const HRManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { currentGen } = useGenerationStore();
  const { members, isLoading, fetchMembers, deleteMember, getAvailableGens } = useMemberStore();

  const [selectedBan, setSelectedBan] = useState<string>('all');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  
  // Delete confirm state
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 🚨 CRITICAL RULE: Phân quyền truy cập cho BCN (ORG_ADMIN) và toàn bộ Ban HR-Event (Lead & Member)
  const isOrgAdmin = !user?.readOnly && user?.tier === 'ORG_ADMIN';
  const isHRBan = user?.banId === 'hr-event';
  const hasHRAccess = !user?.readOnly && (isOrgAdmin || isHRBan);

  const clubMembers = members;

  const availableGens = useMemo(() => {
    const set = new Set<string>();
    clubMembers.forEach(m => {
      if (m.gen) set.add(m.gen);
    });
    return Array.from(set).sort();
  }, [clubMembers]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return clubMembers.filter(m => {
      const posLower = (m.position || '').toLowerCase();
      const matchesBan = matchesMemberGroup(m, selectedBan);

      const matchesGen = selectedGen === 'all' || m.gen.toUpperCase() === selectedGen.toUpperCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        m.name.toLowerCase().includes(query) ||
        m.studentId.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.phone && m.phone.includes(query)) ||
        (m.position && posLower.includes(query));

      return matchesBan && matchesGen && matchesSearch;
    });
  }, [clubMembers, selectedBan, selectedGen, searchQuery]);

  const banTabs = useMemo(() => [
    ['all', 'Tất Cả'], ['ai', 'Ban AI'], ['cloud', 'Ban Cloud'], ['web', 'Ban Web'],
    ['research', 'Ban Research'], ['media', 'Ban Media'], ['hr-event', 'Ban HR-Event'],
    ['bcn', 'Ban Chủ Nhiệm'], ['alumni', 'Alumni'],
  ].map(([id, label]) => ({ id, label, count: clubMembers.filter(m =>
    matchesMemberGroup(m, id) && (selectedGen === 'all' || m.gen.toUpperCase() === selectedGen.toUpperCase())
  ).length })), [clubMembers, selectedGen]);

  if (!hasHRAccess) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleOpenAddModal = () => {
    setMemberToEdit(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setMemberToEdit(member);
    setIsMemberModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      try {
        await deleteMember(memberToDelete.id);
        setMemberToDelete(null);
      } catch (err: any) { alert(err?.message || 'Không thể xóa thành viên'); }
    }
  };

  // Helper cho màu avatar theo ban
  const getBanColor = (banId?: string, tier?: string) => {
    if (tier === 'ORG_ADMIN') return 'bg-amber-500 text-white';
    switch (banId) {
      case 'ai': return 'bg-emerald-600 text-white';
      case 'cloud': return 'bg-blue-600 text-white';
      case 'web': return 'bg-indigo-600 text-white';
      case 'research': return 'bg-purple-600 text-white';
      case 'media': return 'bg-rose-500 text-white';
      case 'hr-event': return 'bg-teal-600 text-white';
      default: return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12 animate-fadeIn">
      {/* Google 4-Color Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] rounded-full shadow-xs mb-2" />

      {/* Top Banner: Thống kê & Quản lý */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-mono-code uppercase tracking-wider">
              Talent Directory
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {isOrgAdmin ? 'Ban Chủ Nhiệm Quản trị' : 'Ban Nhân Sự & Sự Kiện phụ trách'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Danh Sách Nhân Sự CLB</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono-code">
              {clubMembers.length} thành viên
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý hồ sơ, phân quyền và khóa Gen hoạt động của các thành viên GDG on Campus FPTU HCMC.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={() => fetchMembers()}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Tải lại danh sách từ server"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm Mới</span>
          </button>

          {isOrgAdmin && (
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nhập Excel</span>
            </button>
          )}

          {isOrgAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Thành Viên</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search, Gen Filter & View Switcher Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Tên, MSSV, Email hoặc Số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Gen Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <select
                value={selectedGen}
                onChange={(e) => setSelectedGen(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
              >
                <option value="all">Tất Cả Khóa Gen ({clubMembers.length})</option>
                {availableGens.map(g => {
                  const count = clubMembers.filter(m => m.gen === g).length;
                  return (
                    <option key={g} value={g}>
                      {g} ({count} thành viên)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng bảng gọn"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng thẻ trực quan"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Ban Filter Tabs */}
        <div className="flex overflow-x-auto px-4 border-b border-slate-100 bg-white gap-1.5 py-2.5 custom-scrollbar">
          {banTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedBan(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
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

        {/* Content View: Table or Cards */}
        {filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
            <p className="text-sm font-medium text-slate-500">
              Không tìm thấy thành viên nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW: Tinh gọn, chỉ 5 cột, không tràn chữ Gen */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Thành Viên & MSSV</th>
                  <th className="px-5 py-3.5">Ban & Vai Trò</th>
                  <th className="px-5 py-3.5">Khóa Hoạt Động</th>
                  <th className="px-5 py-3.5">Liên Hệ</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map(m => {
                  const isAdmin = m.status !== 'ALUMNI' && ['ORG_ADMIN', 'ADVISOR'].includes(m.tier);
                  const isLead = m.status !== 'ALUMNI' && m.tier === 'BAN_LEAD';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Cột 1: Tên & MSSV */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${getBanColor(m.banId, m.tier)}`}>
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{m.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono-code text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                                {m.studentId}
                              </span>
                              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                {m.academicYear || 'K20'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Ban & Cấp bậc */}
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-800 text-xs">{m.status === 'ALUMNI' ? 'Alumni' : m.banName || 'Chưa phân ban'}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            isAdmin 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : isLead 
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isAdmin ? '👑 BCN' : isLead ? '⚡ LEAD' : 'MEMBER'}
                          </span>
                          <span className="text-slate-500 text-[11px] font-medium truncate max-w-[140px]">
                            {m.position || 'Thành Viên'}
                          </span>
                        </div>
                      </td>

                      {/* Cột 3: Khóa Gen (Fix hoàn toàn lỗi tràn chữ) */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono-code text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 whitespace-nowrap shadow-2xs">
                            {m.gen || 'Gen 4.0'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border whitespace-nowrap ${
                            m.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : m.status === 'PROBATION'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      </td>

                      {/* Cột 4: Liên hệ */}
                      <td className="px-5 py-3.5 font-mono-code text-slate-600">
                        <p className="text-slate-800 text-xs font-medium truncate max-w-[210px]">{m.email}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{m.phone || 'Chưa cập nhật SĐT'}</p>
                      </td>

                      {/* Cột 5: Thao tác */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {isOrgAdmin && (
                            <button
                              onClick={() => handleOpenEditModal(m)}
                              title="Sửa thông tin hoặc phân quyền"
                              className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {isOrgAdmin && (
                            <button
                              onClick={() => setMemberToDelete(m)}
                              title="Xóa thành viên khỏi danh sách"
                              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD GRID VIEW: Thẻ hồ sơ cá nhân hiện đại */
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(m => {
              const isAdmin = m.status !== 'ALUMNI' && ['ORG_ADMIN', 'ADVISOR'].includes(m.tier);
              const isLead = m.status !== 'ALUMNI' && m.tier === 'BAN_LEAD';

              return (
                <div key={m.id} className="bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all hover:shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shadow-xs ${getBanColor(m.banId, m.tier)}`}>
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{m.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{m.status === 'ALUMNI' ? 'Alumni' : m.banName || 'Chưa phân ban'}</p>
                      </div>
                    </div>

                    {isOrgAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-white transition-colors cursor-pointer"
                          title="Sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMemberToDelete(m)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center flex-wrap gap-1.5 pt-1">
                    <span className="font-mono-code text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
                      {m.studentId} • {m.academicYear || 'K20'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono-code text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80 whitespace-nowrap">
                      {m.gen || 'Gen 4.0'}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isAdmin ? 'bg-amber-50 text-amber-700 border-amber-200' : isLead ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {m.position || 'Thành Viên'}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="pt-2 border-t border-slate-200/60 text-xs font-mono-code text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{m.email}</span>
                    </div>
                    {m.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{m.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Xác Nhận Xóa Thành Viên?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa <strong>{memberToDelete.name}</strong> ({memberToDelete.studentId}) khỏi danh sách thành viên GDG on Campus không? Thao tác này sẽ xóa quyền truy cập của thành viên.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Xóa Thành Viên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        memberToEdit={memberToEdit}
        availableGens={availableGens}
        currentGen={currentGen}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        availableGens={availableGens}
        currentGen={currentGen}
      />
    </div>
  );
};
