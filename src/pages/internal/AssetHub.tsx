import React, { useCallback, useEffect, useState, useRef } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { BAN_NAMES, BanId } from '../../types/auth';
import { 
  Folder, 
  ExternalLink, 
  Search, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Code2, 
  Lock, 
  Globe, 
  Users, 
  Trash2, 
  X, 
  BookOpen, 
  HardDrive,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DriveAsset {
  id: string;
  name: string;
  description?: string;
  driveUrl: string;
  driveFileId?: string;
  category: string;
  accessLevel: string;
  department?: { id: string; name: string; code: string };
  tenure?: { id: string; name: string; genLabel: string };
  createdAt?: string;
  uploadedById?: string;
}

const CATEGORIES = [
  { id: 'ALL', label: 'Tất Cả', icon: Layers, color: 'bg-slate-100 text-slate-800' },
  { id: 'BRAND_KIT', label: 'Brand Kit & Logo', icon: Sparkles, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'TECH_LIBRARY', label: 'Tech Library & Code', icon: Code2, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'MEDIA_VAULT', label: 'Media Vault (Ảnh/Video)', icon: ImageIcon, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'PR_COMMS', label: 'PR & Truyền Thông', icon: FileText, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'HANDOVER_VAULT', label: 'Sổ Tay & Bàn Giao', icon: BookOpen, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'FINANCE', label: 'Ngân Sách & BCN', icon: ShieldCheck, color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const ACCESS_LEVEL_MAP: Record<string, { label: string; color: string; icon: any }> = {
  PUBLIC: { label: 'Công Khai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Globe },
  INTERNAL_MEMBER: { label: 'Toàn CLB', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Users },
  DEPARTMENT_ONLY: { label: 'Nội Bộ Ban', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Lock },
  EXECUTIVE_ONLY: { label: 'Ban Chủ Nhiệm', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ShieldCheck },
};

function safeDriveUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['drive.google.com', 'docs.google.com'].includes(url.hostname)
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export const AssetHub: React.FC = () => {
  const { user } = useAuthStore();
  const requestVersion = useRef(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const scopeKey = [user?.id, user?.tier, user?.banId, user?.readOnly].join(':');
  const [loadedScope, setLoadedScope] = useState('');
  const departmentCodes: Record<BanId, string> = { ai: 'TECH_AI', cloud: 'TECH_CLOUD', web: 'TECH_WEB', research: 'RESEARCH', media: 'MEDIA', 'hr-event': 'HR_EVENT' };
  const isLevelOne = !user?.readOnly && (user?.tier === 'ORG_ADMIN' || user?.tier === 'ADVISOR');

  const [assets, setAssets] = useState<DriveAsset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal thêm tài nguyên mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    description: '',
    category: 'BRAND_KIT',
    accessLevel: 'INTERNAL_MEMBER',
    driveUrl: '',
    departmentCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = isLevelOne || (!user?.readOnly && user?.tier === 'BAN_LEAD');
  const canManageAsset = (asset: DriveAsset) => isLevelOne || (canManage && asset.uploadedById === user?.id && asset.department?.code === (user?.banId ? departmentCodes[user.banId] : '') && asset.accessLevel !== 'EXECUTIVE_ONLY');
  const displayedAssets = loadedScope === scopeKey ? assets : [];

  const loadAssets = useCallback(async () => {
    const version = ++requestVersion.current;
    setAssets([]);
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '50',
        ...(search ? { search } : {}),
        ...(selectedCategory !== 'ALL' ? { category: selectedCategory } : {}),
      });
      const response = await api.get<{ items: DriveAsset[]; totalPages: number }>('/api/assets?' + query.toString());
      if (version !== requestVersion.current) return;
      setLoadedScope(scopeKey);
      setAssets(response?.items || []);
      setTotalPages(response?.totalPages || 1);
    } catch (err: any) {
      if (version !== requestVersion.current) return;
      setAssets([]);
      setError(err?.message || 'Không thể tải danh sách tài nguyên');
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [page, search, selectedCategory, scopeKey]);

  useEffect(() => {
    void loadAssets();
    return () => { requestVersion.current++; };
  }, [loadAssets]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.driveUrl) return;

    setIsSubmitting(true);
    try {
      const match = newAsset.driveUrl.match(/[-\w]{20,}/);
      if (!safeDriveUrl(newAsset.driveUrl) || !match) throw new Error('Vui lòng nhập link file hoặc thư mục Google Drive hợp lệ.');
      const driveFileId = match[0];

      const payload = {
        ...newAsset,
        driveFileId,
        departmentCode: newAsset.departmentCode || undefined,
      };
      if (editingId) await api.patch(`/api/assets/${editingId}`, payload);
      else await api.post('/api/assets', payload);

      setIsModalOpen(false);
      setEditingId(null);
      setNewAsset({
        name: '',
        description: '',
        category: 'BRAND_KIT',
        accessLevel: 'INTERNAL_MEMBER',
        driveUrl: '',
        departmentCode: '',
      });
      await loadAssets();
    } catch (err: any) {
      alert(err?.message || 'Không thể đăng ký tài nguyên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài nguyên "${name}"?`)) return;
    try {
      await api.delete(`/api/assets/${id}`);
      await loadAssets();
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa tài nguyên');
    }
  };

  // Helper chọn icon đại diện cho category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BRAND_KIT': return Sparkles;
      case 'TECH_LIBRARY': return Code2;
      case 'MEDIA_VAULT': return ImageIcon;
      case 'PR_COMMS': return FileText;
      case 'HANDOVER_VAULT': return BookOpen;
      case 'FINANCE': return ShieldCheck;
      default: return Folder;
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
              Google Drive Cloud Hub
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Danh sách liên kết Drive • Phân quyền hiển thị trong hệ thống
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Kho Tài Nguyên Số CLB</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono-code">
              {displayedAssets.length} tài nguyên
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bộ nhận diện thương hiệu, mã nguồn dự án, hình ảnh sự kiện và tài liệu vận hành GDG on Campus FPTU HCMC.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={() => void loadAssets()}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Đồng bộ danh sách tài nguyên"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm Mới</span>
          </button>

          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            <span>Mở Drive Tổng</span>
          </a>

          {canManage && (
            <button
              onClick={() => {
                setEditingId(null);
                setNewAsset({ name: '', description: '', category: 'BRAND_KIT', accessLevel: 'INTERNAL_MEMBER', driveUrl: '', departmentCode: user?.banId ? departmentCodes[user.banId] : '' });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng Ký Tài Nguyên</span>
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 px-2">Ban trên thẻ là ban sở hữu. “Toàn CLB” cho phép mọi tài khoản nội bộ xem, kể cả Alumni. Quyền mở file thực tế do Google Drive kiểm soát; hệ thống chưa tự đồng bộ quyền chia sẻ Drive.</p>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên file, folder, mô tả tài nguyên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Asset Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-3">
          <RotateCcw className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Đang đồng bộ tài nguyên từ hệ thống...</p>
        </div>
      ) : displayedAssets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-3">
          <Folder className="w-12 h-12 mx-auto text-slate-300 opacity-60" />
          <h3 className="text-sm font-extrabold text-slate-700">Chưa có tài nguyên phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Không tìm thấy tài nguyên nào thuộc danh mục này phù hợp với quyền truy cập của bạn. Bạn có thể bấm "Làm mới" hoặc liên hệ BCN để được phân quyền.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedAssets.map((asset) => {
            const url = safeDriveUrl(asset.driveUrl);
            const accessInfo = ACCESS_LEVEL_MAP[asset.accessLevel] || {
              label: asset.accessLevel,
              color: 'bg-slate-100 text-slate-700 border-slate-200',
              icon: Lock,
            };
            const AccessIcon = accessInfo.icon;
            const CategoryIcon = getCategoryIcon(asset.category);

            return (
              <article
                key={asset.id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-blue-300 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Header: Category & Access Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <CategoryIcon className="w-3 h-3 text-slate-500" />
                        <span>{asset.category.replace('_', ' ')}</span>
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${accessInfo.color}`}>
                        <AccessIcon className="w-3 h-3" />
                        <span>{accessInfo.label}</span>
                      </span>
                    </div>

                    {asset.department?.name && (
                      <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                        {asset.department.name}
                      </span>
                    )}
                  </div>

                  {/* Asset Title & Description */}
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex items-start gap-2">
                      <Folder className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{asset.name}</span>
                    </h2>
                    {asset.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {asset.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Drive Link & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 shadow-2xs transition-all duration-150"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                      <span>Mở Google Drive</span>
                      <ExternalLink className="w-3 h-3 text-blue-500" />
                    </a>
                  ) : (
                    <span className="text-xs text-red-500 font-medium">Link Drive chưa hợp lệ</span>
                  )}

                  {canManageAsset(asset) && (
                    <button type="button" className="p-1.5 text-blue-600 text-xs" onClick={() => {
                      setEditingId(asset.id);
                      setNewAsset({ name: asset.name, description: asset.description || '', category: asset.category, accessLevel: asset.accessLevel, driveUrl: asset.driveUrl, departmentCode: asset.department?.code || '' });
                      setIsModalOpen(true);
                    }}>Sửa quyền</button>
                  )}
                  {canManageAsset(asset) && (
                    <button
                      onClick={() => handleDeleteAsset(asset.id, asset.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa tài nguyên"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && !error && <div className="flex justify-center items-center gap-3 text-sm">
        <button disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)}>Trang trước</button>
        <span>{page} / {totalPages}</span>
        <button disabled={page >= totalPages || isLoading} onClick={() => setPage(page + 1)}>Trang sau</button>
      </div>}

      {/* MODAL: Đăng ký tài nguyên Google Drive mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleCreateAsset}
            className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200 custom-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <span>{editingId ? 'Chỉnh Sửa Tài Nguyên & Quyền' : 'Đăng Ký Tài Nguyên Drive Mới'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Tài Nguyên / Thư Mục *</label>
                <input
                  required
                  placeholder="Ví dụ: Brand Kit GDGoC Fall 2026 hoặc Slide Template"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đường Dẫn Google Drive URL *</label>
                <input
                  required
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={newAsset.driveUrl}
                  onChange={(e) => setNewAsset({ ...newAsset, driveUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh Mục Tài Nguyên *</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="BRAND_KIT">Brand Kit & Logo</option>
                    <option value="TECH_LIBRARY">Tech Library & Code</option>
                    <option value="MEDIA_VAULT">Media Vault (Ảnh/Video)</option>
                    <option value="PR_COMMS">PR & Truyền Thông</option>
                    <option value="HANDOVER_VAULT">Sổ Tay & Bàn Giao</option>
                    <option value="FINANCE">Ngân Sách & BCN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cấp Độ Phân Quyền *</label>
                  <select
                    value={newAsset.accessLevel}
                    onChange={(e) => setNewAsset({ ...newAsset, accessLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="INTERNAL_MEMBER">Toàn CLB (Thành viên đã login)</option>
                    <option value="DEPARTMENT_ONLY">Nội Bộ Ban (Theo ban phụ trách)</option>
                    {isLevelOne && <option value="EXECUTIVE_ONLY">Ban Chủ Nhiệm (LEAD / ADVISOR / ADMIN)</option>}
                    <option value="PUBLIC">Công Khai (Mức quyền trong hệ thống)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ban sở hữu {newAsset.accessLevel === 'DEPARTMENT_ONLY' ? '*' : ''}</label>
                <select required={newAsset.accessLevel === 'DEPARTMENT_ONLY' || !isLevelOne} disabled={!isLevelOne} value={newAsset.departmentCode} onChange={e => setNewAsset({ ...newAsset, departmentCode: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="">Không gắn ban</option>
                  {Object.entries(BAN_NAMES).map(([id, name]) => <option key={id} value={departmentCodes[id as BanId]}>{name}</option>)}
                  {isLevelOne && <option value="EXECUTIVE">Ban Chủ Nhiệm</option>}
                </select>
              </div>
              <p className="text-xs text-amber-700">Sau khi đổi quyền ở đây, cần kiểm tra và chỉnh Share trên Google Drive tương ứng. Hệ thống chưa tự thay đổi quyền Drive.</p>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Chi Tiết Tài Nguyên</label>
                <textarea
                  rows={3}
                  placeholder="Nêu rõ mục đích, hướng dẫn sử dụng hoặc quyền truy cập của tài nguyên..."
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang Lưu...' : editingId ? 'Lưu Thay Đổi' : 'Đăng Ký Tài Nguyên'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
