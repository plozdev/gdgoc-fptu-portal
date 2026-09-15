import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGenerationStore } from '../../store/useGenerationStore';
import { useMemberStore, Member } from '../../store/useMemberStore';
import { Link, Navigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Layers
} from 'lucide-react';
import { MemberModal } from '../../components/hr/MemberModal';
import { ExcelImportModal } from '../../components/hr/ExcelImportModal';

export const HRManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { currentGen } = useGenerationStore();
  const { members, deleteMember, getAvailableGens } = useMemberStore();

  const [selectedBan, setSelectedBan] = useState<string>('all');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  
  // Delete confirm state
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // 🚨 CRITICAL RULE: Phân quyền truy cập cho BCN (ORG_ADMIN) và toàn bộ Ban HR-Event (Lead & Member)
  const isOrgAdmin = user?.tier === 'ORG_ADMIN';
  const isHRBan = user?.banId === 'hr-event';
  const hasHRAccess = isOrgAdmin || isHRBan;

  if (!hasHRAccess) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const availableGens = getAvailableGens();

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesBan = selectedBan === 'all' || m.banId === selectedBan;
    const matchesGen = selectedGen === 'all' || m.gen === selectedGen;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      m.name.toLowerCase().includes(query) ||
      m.studentId.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      (m.phone && m.phone.includes(query)) ||
      (m.position && m.position.toLowerCase().includes(query));

    return matchesBan && matchesGen && matchesSearch;
  });

  const banTabs = [
    { id: 'all', label: 'Tất Cả Các Ban', count: members.length },
    { id: 'ai', label: 'Ban AI', count: members.filter(u => u.banId === 'ai').length },
    { id: 'cloud', label: 'Ban Cloud', count: members.filter(u => u.banId === 'cloud').length },
    { id: 'web', label: 'Ban Web', count: members.filter(u => u.banId === 'web').length },
    { id: 'research', label: 'Ban Research', count: members.filter(u => u.banId === 'research').length },
    { id: 'media', label: 'Ban Media', count: members.filter(u => u.banId === 'media').length },
    { id: 'hr-event', label: 'Ban HR-Event', count: members.filter(u => u.banId === 'hr-event').length },
  ];

  const handleOpenAddModal = () => {
    setMemberToEdit(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setMemberToEdit(member);
    setIsMemberModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      {/* Top Banner: Niên khóa & Quyền Quản Trị */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono-code">
              HR & TALENT DIRECTORY
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {isOrgAdmin ? 'Ban Chủ Nhiệm quản trị toàn diện' : 'Phân hệ phụ trách bởi Ban Nhân Sự & Sự Kiện'}
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>Quản Lý Nhân Sự & Khóa Hoạt Động</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono-code">
              {members.length} thành viên
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi, phân quyền, cập nhật khóa Gen và quản lý toàn bộ hồ sơ thành viên GDG on Campus FPTU HCMC.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhập từ Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thành Viên</span>
          </button>
        </div>
      </div>

      {/* Directory Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Gen Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Tên, MSSV (SE...), Email hoặc Số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Gen Filter Dropdown (Hỗ trợ Gen lẻ) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Khóa Gen:</span>
            </span>
            <select
              value={selectedGen}
              onChange={(e) => setSelectedGen(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất Cả Các Gen ({members.length})</option>
              {availableGens.map(g => {
                const count = members.filter(m => m.gen === g).length;
                return (
                  <option key={g} value={g}>
                    {g} ({count} thành viên)
                  </option>
                );
              })}
            </select>
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
                <th className="px-4 py-3">MSSV & Khóa</th>
                <th className="px-4 py-3">Chức Vụ & Cấp Bậc</th>
                <th className="px-4 py-3">Ban Chuyên Môn</th>
                <th className="px-4 py-3">Khóa Gen</th>
                <th className="px-4 py-3">Email FPT & SĐT</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Không tìm thấy thành viên nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => {
                  const isAdmin = m.tier === 'ORG_ADMIN';
                  const isLead = m.tier === 'BAN_LEAD';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tên & Avatar */}
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                            isAdmin ? 'bg-[#EA4335]' : isLead ? 'bg-[#4285F4]' : 'bg-[#34A853]'
                          }`}>
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{m.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono-code">{m.status}</span>
                          </div>
                        </div>
                      </td>

                      {/* MSSV & Khóa */}
                      <td className="px-4 py-3">
                        <div className="font-mono-code font-bold text-slate-900">
                          {m.studentId}
                        </div>
                        <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {m.academicYear || 'K20'}
                        </span>
                      </td>

                      {/* Position & Cấp bậc */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{m.position || 'Thành Viên'}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border inline-block mt-0.5 ${
                          isAdmin 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : isLead 
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isAdmin ? '👑 ORG_ADMIN' : isLead ? '⚡ BAN_LEAD' : 'BAN_MEMBER'}
                        </span>
                      </td>

                      {/* Ban Chuyên Môn */}
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {m.banName || 'Ban Chủ Nhiệm'}
                      </td>

                      {/* Khóa Gen */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md font-mono-code text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {m.gen}
                        </span>
                      </td>

                      {/* Email & SĐT */}
                      <td className="px-4 py-3 font-mono-code text-slate-600">
                        <p className="text-slate-800 text-[11px]">{m.email}</p>
                        <p className="text-[10px] text-slate-400">{m.phone || 'Chưa có SĐT'}</p>
                      </td>

                      {/* Thao tác */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            title="Sửa thông tin hoặc phân quyền"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Xóa thành viên: chỉ BCN hoặc HR Lead */}
                          {(isOrgAdmin || (isHRBan && user?.tier === 'BAN_LEAD')) && (
                            <button
                              onClick={() => setMemberToDelete(m)}
                              title="Xóa thành viên khỏi danh sách"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
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
