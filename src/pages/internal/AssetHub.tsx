import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useMemberStore } from '../../store/useMemberStore';
import { 
  Folder, 
  FolderLock, 
  Lock, 
  Unlock, 
  ExternalLink, 
  FileText, 
  Image, 
  FileCode, 
  FileArchive, 
  Search, 
  Plus, 
  ShieldCheck, 
  AlertCircle,
  HardDrive,
  Trash2,
  Filter,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { BanId, BAN_NAMES, BAN_ID_TO_DEPT_CODE, DEPT_CODE_TO_BAN_ID } from '../../types/auth.types';
import { assetsApi, DriveCategory, AccessLevel } from '../../api';

interface AssetItem {
  id: string;
  name: string;
  description?: string;
  category: DriveCategory;
  driveUrl: string;
  driveFileId: string;
  accessLevel: AccessLevel;
  createdAt: string;
  department?: {
    id: string;
    code: string;
    name: string;
  };
  event?: {
    id: string;
    title: string;
  };
  tenure?: {
    id: string;
    name: string;
    genLabel: string;
  };
}

const CATEGORY_NAMES: Record<DriveCategory, string> = {
  BRAND_KIT: 'Bộ Nhận Diện Brand Kit',
  TECH_LIBRARY: 'Tài Liệu & Source Code Kỹ Thuật',
  MEDIA_VAULT: 'Kho Media, Footage & Video',
  PR_COMMS: 'Tài Liệu PR & Truyền Thông',
  FINANCE: 'Tài Chính & Kế Hoạch',
  HANDOVER_VAULT: 'Tài Liệu Bàn Giao & Lưu Trữ',
};

const CATEGORIES: DriveCategory[] = [
  'BRAND_KIT',
  'TECH_LIBRARY',
  'MEDIA_VAULT',
  'PR_COMMS',
  'FINANCE',
  'HANDOVER_VAULT',
];

export const AssetHub: React.FC = () => {
  const { user } = useAuthStore();
  const { activeTenureId } = useMemberStore();

  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBan, setSelectedBan] = useState<string>('all');

  // Modal Add Asset State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<DriveCategory>('TECH_LIBRARY');
  const [newDriveUrl, setNewDriveUrl] = useState('');
  const [newDriveFileId, setNewDriveFileId] = useState('');
  const [newAccessLevel, setNewAccessLevel] = useState<AccessLevel>('INTERNAL_MEMBER');
  const [newBan, setNewBan] = useState<BanId | 'shared'>('shared');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isOrgAdmin = user?.tier === 'ORG_ADMIN';
  const isLead = user?.tier === 'BAN_LEAD' || isOrgAdmin;

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await assetsApi.getAssets({ limit: 100 });
      const items = (res as any)?.items || (Array.isArray(res) ? res : []);
      setAssets(items);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDriveUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const deptCode = newBan === 'shared' ? undefined : BAN_ID_TO_DEPT_CODE[newBan];
      const fileId = newDriveFileId.trim() || `file_${Date.now()}`;

      await assetsApi.createAsset({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        category: newCategory,
        driveUrl: newDriveUrl.trim(),
        driveFileId: fileId,
        accessLevel: newAccessLevel,
        departmentCode: deptCode,
        tenureId: activeTenureId || undefined,
      });

      setIsAddModalOpen(false);
      setNewName('');
      setNewDesc('');
      setNewDriveUrl('');
      setNewDriveFileId('');
      setActionSuccess('Đăng ký tài nguyên Google Drive thành công!');
      setTimeout(() => setActionSuccess(null), 3500);
      await fetchAssets();
    } catch (err: any) {
      console.error('Failed to create asset:', err);
      alert(err.message || 'Lỗi khi tạo tài nguyên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài nguyên "${name}"?`)) return;
    try {
      await assetsApi.deleteAsset(id);
      setActionSuccess(`Đã xóa "${name}" thành công!`);
      setTimeout(() => setActionSuccess(null), 3500);
      await fetchAssets();
    } catch (err: any) {
      console.error('Failed to delete asset:', err);
      alert(err.message || 'Lỗi khi xóa tài nguyên');
    }
  };

  // Filter Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        !searchQuery ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || asset.category === selectedCategory;

      const assetBanId = asset.department?.code
        ? DEPT_CODE_TO_BAN_ID[asset.department.code]
        : 'shared';

      const matchesBan =
        selectedBan === 'all' ||
        (selectedBan === 'shared' && !asset.department) ||
        assetBanId === selectedBan;

      return matchesSearch && matchesCat && matchesBan;
    });
  }, [assets, searchQuery, selectedCategory, selectedBan]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      {/* Toast */}
      {actionSuccess && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-xs font-bold">{actionSuccess}</p>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                GOOGLE DRIVE HUB • GDGoC-OS
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-emerald-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Phân quyền 4 cấp độ
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Kho Tài Nguyên & Lưu Trữ Đám Mây
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Truy cập tập trung toàn bộ Brand Kit, Notebook AI, source code, tài liệu bàn giao và media footage chính thức của CLB.
            </p>
          </div>

          {isLead && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng Ký Tài Nguyên Drive</span>
            </button>
          )}
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu, thư mục, notebook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Tất Cả Danh Mục ({assets.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_NAMES[cat]}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedBan}
            onChange={(e) => setSelectedBan(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Toàn Bộ CLB & Các Ban</option>
            <option value="shared">Thư Mục Dùng Chung</option>
            {Object.entries(BAN_NAMES).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-bold">Đang tải kho tài nguyên Google Drive...</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto space-y-3">
          <HardDrive className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">Không tìm thấy tài nguyên nào</h3>
          <p className="text-xs text-slate-500">
            {searchQuery || selectedCategory !== 'all' || selectedBan !== 'all'
              ? 'Thử thay đổi từ khóa hoặc bộ lọc để xem các tài nguyên khác.'
              : 'Hiện chưa có tài nguyên Google Drive nào được đăng ký trong hệ thống.'}
          </p>
          {isLead && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Đăng ký tài nguyên đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const isShared = !asset.department;
            const categoryLabel = CATEGORY_NAMES[asset.category] || asset.category;

            return (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 truncate">
                      {categoryLabel}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      asset.accessLevel === 'PUBLIC'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : asset.accessLevel === 'INTERNAL_MEMBER'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : asset.accessLevel === 'EXECUTIVE_ONLY'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {asset.accessLevel === 'PUBLIC'
                        ? 'Public'
                        : asset.accessLevel === 'INTERNAL_MEMBER'
                        ? 'Nội Bộ'
                        : asset.accessLevel === 'EXECUTIVE_ONLY'
                        ? 'Ban Chủ Nhiệm'
                        : 'Ban Chuyên Môn'}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Folder className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {asset.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {asset.department?.name || 'Tài nguyên chung toàn CLB'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {asset.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2">
                      {asset.description}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>

                  <div className="flex items-center gap-2">
                    {isLead && (
                      <button
                        onClick={() => handleDeleteAsset(asset.id, asset.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa tài nguyên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <a
                      href={asset.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Mở Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Asset */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Đăng Ký Tài Nguyên Drive Mới
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Lưu trữ liên kết Google Drive chính thức lên hệ thống
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên tài nguyên / Thư mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Master Brand Kit 2026, Notebooks Vertex AI"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Google Drive Link (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={newDriveUrl}
                  onChange={(e) => setNewDriveUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Danh mục tài nguyên
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DriveCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_NAMES[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ban sở hữu
                  </label>
                  <select
                    value={newBan}
                    onChange={(e) => setNewBan(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="shared">Chung toàn CLB</option>
                    {Object.entries(BAN_NAMES).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cấp độ truy cập
                </label>
                <select
                  value={newAccessLevel}
                  onChange={(e) => setNewAccessLevel(e.target.value as AccessLevel)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="INTERNAL_MEMBER">Toàn bộ thành viên nội bộ (INTERNAL_MEMBER)</option>
                  <option value="PUBLIC">Công khai khách truy cập (PUBLIC)</option>
                  <option value="DEPARTMENT_ONLY">Chỉ thành viên trong ban (DEPARTMENT_ONLY)</option>
                  <option value="EXECUTIVE_ONLY">Chỉ Ban Chủ Nhiệm (EXECUTIVE_ONLY)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mô tả chi tiết (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú nội dung các tệp chứa bên trong..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Lưu Tài Nguyên</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
