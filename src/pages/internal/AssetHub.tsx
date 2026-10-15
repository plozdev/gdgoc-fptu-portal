import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { eventsApi } from '../../api/events.api';
import { useAuthStore } from '../../store/useAuthStore';
import { BAN_NAMES, BanId } from '../../types/auth';
import { 
  Folder, 
  FolderArchive,
  ExternalLink, 
  Search, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  FileText, 
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
  AlertTriangle,
  ChevronRight,
  Copy,
  Calendar,
  Link2,
  FolderOpen,
  ArrowLeft,
  Edit3
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

interface EventItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  location: string;
  startTime: string;
  endTime: string;
  status?: string;
  driveFolderUrl?: string | null;
  tenureId?: string;
  tenure?: { id: string; name: string; genLabel: string; isArchived: boolean };
  tenureName?: string;
  tenureGen?: string;
  semesterId?: string;
  semester?: { id: string; name: string; isClosed: boolean };
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

const safeDriveUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
};

const formatEventDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export const AssetHub: React.FC = () => {
  const { user } = useAuthStore();
  const requestVersion = useRef(0);
  const departmentCodes: Record<BanId, string> = { 
    ai: 'TECH_AI', 
    cloud: 'TECH_CLOUD', 
    web: 'TECH_WEB', 
    research: 'RESEARCH', 
    media: 'MEDIA', 
    'hr-event': 'HR_EVENT' 
  };
  const isLevelOne = !user?.readOnly && (user?.tier === 'ORG_ADMIN' || user?.tier === 'ADVISOR');
  const canManage = isLevelOne || (!user?.readOnly && user?.tier === 'BAN_LEAD');

  // Main Tabs: EVENTS (Kho sự kiện) vs GENERAL (Danh mục chung)
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'GENERAL'>('EVENTS');

  // Toast feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // ==========================================
  // SECTION 1: EVENTS DIRECTORY (Cây thư mục sự kiện)
  // ==========================================
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [eventSearch, setEventSearch] = useState('');

  // Event Directory Navigation
  // 'CURRENT_YEAR' = Events > 2026 - 2027
  // 'ARCHIVE_ROOT' = Events > Archive
  // 'ARCHIVE_YEAR' = Events > Archive > 2025 - 2026
  const [eventNavMode, setEventNavMode] = useState<'CURRENT_YEAR' | 'ARCHIVE_ROOT' | 'ARCHIVE_YEAR'>('CURRENT_YEAR');
  const [selectedArchiveYear, setSelectedArchiveYear] = useState<string>('');

  // Modal gắn / sửa link Google Drive của Sự kiện
  const [editingDriveEvent, setEditingDriveEvent] = useState<EventItem | null>(null);
  const [eventDriveUrlInput, setEventDriveUrlInput] = useState('');
  const [isUpdatingEventDrive, setIsUpdatingEventDrive] = useState(false);

  const loadEvents = useCallback(async () => {
    setIsEventsLoading(true);
    try {
      const res: any = await eventsApi.getEvents();
      const rawEvents: EventItem[] = Array.isArray(res) ? res : res?.data || [];
      setEvents(rawEvents);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách sự kiện:', err);
      showToast('Không thể tải danh sách sự kiện', 'error');
    } finally {
      setIsEventsLoading(false);
    }
  }, []);

  // Phân loại Events theo Năm học / Nhiệm kỳ
  const { currentYearEvents, currentYearLabel, archivedYearsMap, archivedYearsList } = useMemo(() => {
    // Current year events: events where tenure.isArchived === false
    // or fallback to latest events
    const current = events.filter(e => e.tenure ? !e.tenure.isArchived : true);
    const label = current.length > 0 && (current[0].tenure?.name || current[0].tenureName)
      ? (current[0].tenure?.name || current[0].tenureName || '2026 - 2027')
      : '2026 - 2027';

    // Archived events: tenure.isArchived === true
    const archived = events.filter(e => e.tenure?.isArchived);
    const map: Record<string, EventItem[]> = {};

    archived.forEach(e => {
      const year = e.tenure?.name || e.tenureName || '2025 - 2026';
      if (!map[year]) map[year] = [];
      map[year].push(e);
    });

    const yearsList = Object.keys(map).sort((a, b) => b.localeCompare(a));

    return {
      currentYearEvents: current,
      currentYearLabel: label,
      archivedYearsMap: map,
      archivedYearsList: yearsList,
    };
  }, [events]);

  // Handle open modal update event drive link
  const handleOpenEditEventDrive = (e: React.MouseEvent, event: EventItem) => {
    e.stopPropagation();
    setEditingDriveEvent(event);
    setEventDriveUrlInput(event.driveFolderUrl || '');
  };

  // Submit update event drive link
  const handleSaveEventDriveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriveEvent) return;

    try {
      setIsUpdatingEventDrive(true);
      const trimmedUrl = eventDriveUrlInput.trim();
      if (trimmedUrl && !safeDriveUrl(trimmedUrl)) {
        showToast('Vui lòng nhập đường dẫn Google Drive hợp lệ (https://...)', 'error');
        return;
      }

      await eventsApi.updateEvent(editingDriveEvent.id, {
        driveFolderUrl: trimmedUrl || null,
      } as any);

      // Cập nhật state local
      setEvents(prev => prev.map(item => 
        item.id === editingDriveEvent.id ? { ...item, driveFolderUrl: trimmedUrl || null } : item
      ));

      showToast(`Đã lưu liên kết Google Drive cho ${editingDriveEvent.title}!`, 'success');
      setEditingDriveEvent(null);
      setEventDriveUrlInput('');
    } catch (err: any) {
      console.error('Lỗi khi cập nhật link Google Drive:', err);
      showToast(err?.message || 'Không thể cập nhật liên kết Drive', 'error');
    } finally {
      setIsUpdatingEventDrive(false);
    }
  };

  // Copy drive link helper
  const handleCopyLink = (e: React.MouseEvent, url?: string | null) => {
    e.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url);
    showToast('Đã sao chép liên kết Google Drive vào bộ nhớ tạm!', 'success');
  };

  // ==========================================
  // SECTION 2: GENERAL ASSETS (Danh mục dùng chung)
  // ==========================================
  const [assets, setAssets] = useState<DriveAsset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [assetSearch, setAssetSearch] = useState('');
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);

  // Modal thêm/sửa tài nguyên dùng chung
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAsset, setNewAsset] = useState({
    name: '',
    description: '',
    category: 'BRAND_KIT',
    accessLevel: 'INTERNAL_MEMBER',
    driveUrl: '',
    departmentCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageAsset = (asset: DriveAsset) => 
    isLevelOne || (canManage && asset.uploadedById === user?.id && asset.department?.code === (user?.banId ? departmentCodes[user.banId] : '') && asset.accessLevel !== 'EXECUTIVE_ONLY');

  const loadAssets = useCallback(async () => {
    const version = ++requestVersion.current;
    setIsAssetsLoading(true);
    setAssetError(null);
    try {
      const query = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(assetSearch ? { search: assetSearch } : {}),
        ...(selectedCategory !== 'ALL' ? { category: selectedCategory } : {}),
      });
      const response = await api.get<{ items: DriveAsset[]; totalPages: number }>('/api/assets?' + query.toString());
      if (version !== requestVersion.current) return;
      setAssets(response?.items || []);
    } catch (err: any) {
      if (version !== requestVersion.current) return;
      setAssets([]);
      setAssetError(err?.message || 'Không thể tải danh sách tài nguyên dùng chung');
    } finally {
      if (version === requestVersion.current) setIsAssetsLoading(false);
    }
  }, [assetSearch, selectedCategory]);

  useEffect(() => {
    void loadEvents();
    void loadAssets();
  }, [loadEvents, loadAssets]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.driveUrl) return;

    setIsSubmitting(true);
    try {
      const safe = safeDriveUrl(newAsset.driveUrl);
      if (!safe) throw new Error('Vui lòng nhập link file hoặc thư mục Google Drive hợp lệ.');

      const payload = {
        ...newAsset,
        driveFileId: 'manual_entry',
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
      showToast('Lưu tài nguyên dùng chung thành công!', 'success');
      await loadAssets();
    } catch (err: any) {
      showToast(err?.message || 'Không thể đăng ký tài nguyên', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài nguyên "${name}"?`)) return;
    try {
      await api.delete(`/api/assets/${id}`);
      showToast('Đã xóa tài nguyên thành công!', 'success');
      await loadAssets();
    } catch (err: any) {
      showToast(err?.message || 'Không thể xóa tài nguyên', 'error');
    }
  };

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

  // Filtered Events based on search
  const displayedEvents = useMemo(() => {
    let sourceEvents: EventItem[] = [];
    if (eventNavMode === 'CURRENT_YEAR') {
      sourceEvents = currentYearEvents;
    } else if (eventNavMode === 'ARCHIVE_YEAR' && selectedArchiveYear) {
      sourceEvents = archivedYearsMap[selectedArchiveYear] || [];
    }

    if (!eventSearch.trim()) return sourceEvents;
    const q = eventSearch.toLowerCase();
    return sourceEvents.filter(e => 
      e.title.toLowerCase().includes(q) || 
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.type && e.type.toLowerCase().includes(q))
    );
  }, [eventNavMode, selectedArchiveYear, currentYearEvents, archivedYearsMap, eventSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-14 animate-fadeIn">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold transition-all shadow-md ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
            : 'bg-red-50 text-red-900 border-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Google 4-Color Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] rounded-full shadow-xs" />

      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-mono-code uppercase tracking-wider">
              Smart Asset Hub
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Kho tài nguyên Google Drive & Thư mục sự kiện GDGoC FPTU HCMC
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Kho Tài Nguyên Số CLB</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Tài liệu dùng chung toàn CLB, Brand Kit, và toàn bộ Thư mục Sự kiện (Events) được phân loại theo năm học trực tiếp từ Google Drive.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={() => {
              void loadEvents();
              void loadAssets();
              showToast('Đã làm mới dữ liệu từ server!', 'success');
            }}
            disabled={isEventsLoading || isAssetsLoading}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Đồng bộ danh sách"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${(isEventsLoading || isAssetsLoading) ? 'animate-spin text-blue-600' : ''}`} />
            <span>Làm Mới</span>
          </button>

          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            <span>Mở Drive Tổng ↗</span>
          </a>

          {activeTab === 'GENERAL' && canManage && (
            <button
              onClick={() => {
                setEditingId(null);
                setNewAsset({ 
                  name: '', 
                  description: '', 
                  category: 'BRAND_KIT', 
                  accessLevel: 'INTERNAL_MEMBER', 
                  driveUrl: '', 
                  departmentCode: user?.banId ? departmentCodes[user.banId] : '' 
                });
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

      {/* Primary Navigation Tabs: Kho Sự Kiện (Events) vs Danh Mục Chung */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'EVENTS'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeTab === 'EVENTS' ? 'text-blue-400' : 'text-slate-500'}`} />
          <span>Kho Sự Kiện (EVENTS Directory)</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono-code ${
            activeTab === 'EVENTS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {currentYearEvents.length} năm nay • {events.length - currentYearEvents.length} lưu trữ
          </span>
        </button>

        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'GENERAL'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'GENERAL' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Danh Mục Dùng Chung (General Vault)</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono-code ${
            activeTab === 'GENERAL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {assets.length} tài nguyên
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: KHO SỰ KIỆN (EVENTS DIRECTORY - GOOGLE DRIVE TREE) */}
      {/* ======================================================== */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-4">
          {/* Breadcrumb Bar (Styled exactly like Google Drive breadcrumb) */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold flex-wrap">
              <span className="text-slate-400 font-mono-code">My Drive &gt; GDGoC FPTU HCM &gt;</span>
              
              <button
                onClick={() => {
                  setEventNavMode('CURRENT_YEAR');
                  setSelectedArchiveYear('');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  eventNavMode === 'CURRENT_YEAR'
                    ? 'bg-blue-50 text-blue-700 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Folder className="w-4 h-4 text-blue-500" />
                <span>EVENTS</span>
              </button>

              <ChevronRight className="w-4 h-4 text-slate-300" />

              {eventNavMode === 'CURRENT_YEAR' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100/70 text-blue-900 font-black">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>{currentYearLabel}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-600 text-white rounded-md">Hiện tại</span>
                </div>
              )}

              {eventNavMode === 'ARCHIVE_ROOT' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-900 font-black">
                  <FolderArchive className="w-4 h-4 text-amber-700" />
                  <span>Archive (Các năm đã lưu trữ)</span>
                </div>
              )}

              {eventNavMode === 'ARCHIVE_YEAR' && (
                <>
                  <button
                    onClick={() => {
                      setEventNavMode('ARCHIVE_ROOT');
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-amber-600" />
                    <span>Archive</span>
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-900 font-black">
                    <FolderOpen className="w-4 h-4 text-amber-700" />
                    <span>{selectedArchiveYear}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-600 text-white rounded-md">Lưu trữ</span>
                  </div>
                </>
              )}
            </div>

            {/* Quick Switch & Add Event Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/app/events"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Tạo sự kiện mới tại trang Quản Lý Sự Kiện"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Sự Kiện</span>
              </Link>

              {eventNavMode === 'CURRENT_YEAR' ? (
                <button
                  onClick={() => setEventNavMode('ARCHIVE_ROOT')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-amber-600" />
                  <span>Xem Thư Mục Archive ({archivedYearsList.length} năm cũ)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEventNavMode('CURRENT_YEAR');
                    setSelectedArchiveYear('');
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quay Lại Năm Hiện Tại ({currentYearLabel})</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar inside Events */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  eventNavMode === 'CURRENT_YEAR'
                    ? `Tìm kiếm sự kiện trong năm ${currentYearLabel}...`
                    : eventNavMode === 'ARCHIVE_YEAR'
                    ? `Tìm kiếm sự kiện năm ${selectedArchiveYear}...`
                    : "Tìm kiếm sự kiện..."
                }
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium transition-all"
              />
            </div>
            {eventSearch && (
              <button
                onClick={() => setEventSearch('')}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 cursor-pointer"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>

          {/* EVENTS CONTENT SWITCHER */}
          {isEventsLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-3">
              <RotateCcw className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Đang tải danh sách thư mục sự kiện...</p>
            </div>
          ) : eventNavMode === 'ARCHIVE_ROOT' ? (
            /* ARCHIVE ROOT VIEW: Lists archived tenure years */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Thư mục Archive:</strong> Chứa tài nguyên của các nhiệm kỳ và năm học đã đóng. Bấm vào từng năm để mở danh sách sự kiện.
                  </span>
                </div>
              </div>

              {archivedYearsList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-2">
                  <FolderArchive className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">Chưa có nhiệm kỳ nào được lưu trữ vào Archive</p>
                  <p className="text-xs text-slate-400">Các sự kiện cũ khi kết thúc nhiệm kỳ sẽ được gom tự động vào đây.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {archivedYearsList.map(year => {
                    const yearEvents = archivedYearsMap[year] || [];
                    return (
                      <div
                        key={year}
                        onClick={() => {
                          setSelectedArchiveYear(year);
                          setEventNavMode('ARCHIVE_YEAR');
                        }}
                        className="bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="p-3 bg-amber-50 group-hover:bg-amber-100 rounded-2xl text-amber-700 transition-colors">
                            <FolderArchive className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono-code">
                            {yearEvents.length} sự kiện
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                            {year}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Thư mục lưu trữ tài nguyên
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                          <span>Mở thư mục năm</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* CURRENT_YEAR or ARCHIVE_YEAR: Event Folders Grid (Matching User Screenshot 1 & 3) */
            <div className="space-y-4">
              {/* Year indicator alert */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-xs font-bold bg-white border-slate-200">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-blue-600" />
                  <span>
                    Danh sách sự kiện: <strong className="text-slate-900 font-mono-code">{eventNavMode === 'CURRENT_YEAR' ? currentYearLabel : selectedArchiveYear}</strong> ({displayedEvents.length} sự kiện)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
                  Click [Mở Google Drive] để truy cập trực tiếp thư mục Drive của Event
                </span>
              </div>

              {displayedEvents.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-3">
                  <Folder className="w-12 h-12 mx-auto text-slate-300 opacity-60" />
                  <h3 className="text-sm font-extrabold text-slate-700">Chưa có sự kiện nào trong thư mục này</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {eventSearch 
                      ? 'Không tìm thấy sự kiện nào khớp với từ khóa tìm kiếm.' 
                      : 'Các sự kiện được tạo ở mục Quản Lý Sự Kiện sẽ tự động hiển thị thư mục tại đây.'}
                  </p>
                  {!eventSearch && (
                    <div className="pt-2">
                      <Link
                        to="/app/events"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Đến Trang Quản Lý Sự Kiện Để Tạo Mới</span>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedEvents.map((event) => {
                    const hasDriveUrl = Boolean(event.driveFolderUrl && safeDriveUrl(event.driveFolderUrl));

                    return (
                      <div
                        key={event.id}
                        className="bg-white rounded-3xl border border-slate-200/80 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{event.type}</span>
                            </span>

                            {event.startTime && (
                              <span className="text-[10px] font-semibold text-slate-400 font-mono-code">
                                {formatEventDate(event.startTime)}
                              </span>
                            )}
                          </div>

                          {/* Event Title */}
                          <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors flex items-start gap-2.5">
                              <div className="p-2 bg-blue-50 group-hover:bg-blue-100 rounded-xl text-blue-600 shrink-0 transition-colors">
                                <Folder className="w-4 h-4 fill-blue-500/20" />
                              </div>
                              <span className="line-clamp-2 leading-snug">{event.title}</span>
                            </h3>

                            {event.location && (
                              <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 flex items-center gap-1">
                                <span>📍 {event.location}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Open Drive + Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {hasDriveUrl ? (
                              <>
                                <a
                                  href={event.driveFolderUrl!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 shadow-2xs transition-all cursor-pointer"
                                  title="Mở thư mục Google Drive của sự kiện"
                                >
                                  <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Mở Google Drive</span>
                                  <ExternalLink className="w-3 h-3 text-blue-500" />
                                </a>

                                <button
                                  type="button"
                                  onClick={(e) => handleCopyLink(e, event.driveFolderUrl)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  title="Sao chép link Google Drive"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400 italic flex items-center gap-1">
                                <span>Chưa gắn link Drive</span>
                              </span>
                            )}
                          </div>

                          {/* Lead / BCN action: Attach or Edit Drive Link */}
                          {canManage && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditEventDrive(e, event)}
                              className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                              title="Gắn hoặc cập nhật link Google Drive"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{hasDriveUrl ? 'Sửa link' : 'Gắn link'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: DANH MỤC DÙNG CHUNG (GENERAL VAULT) */}
      {/* ======================================================== */}
      {activeTab === 'GENERAL' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 px-1">
            Kho tài nguyên dùng chung toàn CLB: Brand Kit, Sổ tay vận hành, Tài liệu bàn giao và Ngân sách BCN.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên file, folder, mô tả tài nguyên dùng chung..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium transition-all"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {CATEGORIES.filter(cat => cat.id !== 'FINANCE' || isLevelOne).map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
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
          {assetError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{assetError}</span>
            </div>
          )}

          {/* Asset Cards Grid */}
          {isAssetsLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-3">
              <RotateCcw className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Đang đồng bộ danh mục dùng chung...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-3">
              <Folder className="w-12 h-12 mx-auto text-slate-300 opacity-60" />
              <h3 className="text-sm font-extrabold text-slate-700">Chưa có tài nguyên phù hợp</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Không tìm thấy tài nguyên nào thuộc danh mục này phù hợp với quyền truy cập của bạn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => {
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

                      <div className="flex items-center gap-1">
                        {canManageAsset(asset) && (
                          <button 
                            type="button" 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold cursor-pointer transition-colors" 
                            onClick={() => {
                              setEditingId(asset.id);
                              setNewAsset({ 
                                name: asset.name, 
                                description: asset.description || '', 
                                category: asset.category, 
                                accessLevel: asset.accessLevel, 
                                driveUrl: asset.driveUrl, 
                                departmentCode: asset.department?.code || '' 
                              });
                              setIsModalOpen(true);
                            }}
                          >
                            Sửa
                          </button>
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
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: GẮN / SỬA LINK GOOGLE DRIVE CỦA SỰ KIỆN */}
      {/* ======================================================== */}
      {editingDriveEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleSaveEventDriveUrl}
            className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <span>Cập Nhật Thư Mục Google Drive Sự Kiện</span>
              </h2>
              <button
                type="button"
                onClick={() => setEditingDriveEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sự kiện</p>
                <p className="text-sm font-bold text-slate-900">{editingDriveEvent.title}</p>
                {editingDriveEvent.location && (
                  <p className="text-slate-500">📍 {editingDriveEvent.location}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đường Dẫn Thư Mục Google Drive (URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={eventDriveUrlInput}
                  onChange={(e) => setEventDriveUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Dán link thư mục Google Drive của sự kiện (thư mục Media, Slide, Minh chứng...). Thành viên sẽ được mở trực tiếp khi bấm vào.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingDriveEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isUpdatingEventDrive}
                className="px-5 py-2 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUpdatingEventDrive ? 'Đang Lưu...' : 'Lưu Liên Kết Drive'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ĐĂNG KÝ / SỬA TÀI NGUYÊN DÙNG CHUNG */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleCreateAsset}
            className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200 custom-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <span>{editingId ? 'Chỉnh Sửa Tài Nguyên Dùng Chung' : 'Đăng Ký Tài Nguyên Dùng Chung Mới'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Tài Nguyên / Thư Mục *</label>
                <input
                  required
                  placeholder="Ví dụ: GDGoC Official Brand Kit & Guidelines"
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
                    <option value="HANDOVER_VAULT">Sổ Tay & Bàn Giao</option>
                    <option value="TECH_LIBRARY">Tech Library & Code</option>
                    <option value="MEDIA_VAULT">Media Vault (Ảnh/Video)</option>
                    <option value="PR_COMMS">PR & Truyền Thông</option>
                    {isLevelOne && <option value="FINANCE">Ngân Sách & BCN</option>}
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
                    {isLevelOne && <option value="EXECUTIVE_ONLY">Ban Chủ Nhiệm (LEAD / ADMIN)</option>}
                    <option value="PUBLIC">Công Khai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ban sở hữu {newAsset.accessLevel === 'DEPARTMENT_ONLY' ? '*' : ''}</label>
                <select 
                  required={newAsset.accessLevel === 'DEPARTMENT_ONLY' || !isLevelOne} 
                  disabled={!isLevelOne} 
                  value={newAsset.departmentCode} 
                  onChange={e => setNewAsset({ ...newAsset, departmentCode: e.target.value })} 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="">Không gắn ban</option>
                  {Object.entries(BAN_NAMES).map(([id, name]) => <option key={id} value={departmentCodes[id as BanId]}>{name}</option>)}
                  {isLevelOne && <option value="EXECUTIVE">Ban Chủ Nhiệm</option>}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Chi Tiết Tài Nguyên</label>
                <textarea
                  rows={3}
                  placeholder="Nêu rõ mục đích, hướng dẫn sử dụng tài nguyên..."
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
