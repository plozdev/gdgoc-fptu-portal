import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLandingContentStore } from '../../store/useLandingContentStore';
import { useMemberStore, Member } from '../../store/useMemberStore';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Globe, 
  Save, 
  ExternalLink, 
  RotateCcw, 
  Calendar, 
  Users, 
  BarChart3, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles,
  Eye,
  Loader2,
  AlertCircle,
  Search,
  UserPlus,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { EventItem, OrganizerMember } from '../../types';
import { DateInput } from '../../components/common/DateInput';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

export const LandingCMS: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    events, 
    organizers, 
    stats, 
    isLoading,
    isSaving,
    fetchCmsData,
    saveCmsPublish,
    updateEvent, 
    addEvent, 
    deleteEvent, 
    toggleShowOnLanding,
    setOrganizers,
    addOrganizer, 
    deleteOrganizer, 
    updateStats,
    resetToDefaults 
  } = useLandingContentStore();

  const { members, fetchMembers } = useMemberStore();

  const [activeTab, setActiveTab] = useState<'events' | 'organizers' | 'stats'>('events');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Drag and drop state for organizers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Edit Event state
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [showEventPickerModal, setShowEventPickerModal] = useState(false);

  // Add Member to Core Team Modal state
  const [showMemberPickerModal, setShowMemberPickerModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedBanFilter, setSelectedBanFilter] = useState('ALL');

  // Fetch CMS live data & members on component mount
  useEffect(() => {
    fetchCmsData();
    fetchMembers();
  }, [fetchCmsData, fetchMembers]);

  // 🚨 Chỉ BCN (ORG_ADMIN - Chapter Lead & Co-Chapter Lead) mới có quyền truy cập Landing CMS
  if (user?.tier !== 'ORG_ADMIN') {
    return <Navigate to="/app/dashboard" replace />;
  }

  const getDefaultAvatar = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Member')}&background=4285F4&color=fff&bold=true`;

  const mapBanToDomain = (banName?: string, position?: string): OrganizerMember['domain'] => {
    const combined = `${banName || ''} ${position || ''}`.toLowerCase();
    if (
      combined.includes('tech') ||
      combined.includes('kỹ thuật') ||
      combined.includes('web') ||
      combined.includes('ai') ||
      combined.includes('cloud')
    ) {
      return 'Tech';
    }
    if (
      combined.includes('media') ||
      combined.includes('design') ||
      combined.includes('truyền thông') ||
      combined.includes('thiết kế')
    ) {
      return 'Design & Media';
    }
    if (
      combined.includes('event') ||
      combined.includes('hr') ||
      combined.includes('nhân sự') ||
      combined.includes('sự kiện')
    ) {
      return 'Event Operations';
    }
    return 'Leads';
  };

  const handleAddMemberToCoreTeam = async (m: Member) => {
    const domain = mapBanToDomain(m.banName, m.position);
    const newOrg: OrganizerMember = {
      id: m.id,
      name: m.name,
      role: m.position || 'Core Team',
      domain,
      major: 'Kỹ thuật phần mềm',
      cohort: m.academicYear || 'K18',
      bio: m.bio || `${m.position} @ GDG on Campus FPT University HCMC`,
      avatarUrl: m.avatar || getDefaultAvatar(m.name),
      color: '#4285F4',
      dotColor: '#4285F4',
      githubUrl: m.socials?.github,
      linkedinUrl: m.socials?.linkedin,
    };
    addOrganizer(newOrg);
    await handleSave();
  };

  const handleRemoveOrganizer = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn gỡ ${name} khỏi danh sách Core Team hiển thị ngoài Landing Page?`)) {
      deleteOrganizer(id);
      await handleSave();
    }
  };

  // Drag and drop / reorder handlers for organizers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {
      // browser compatibility fallback
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...organizers];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    setOrganizers(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
    await handleSave();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMoveOrganizer = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= organizers.length) return;

    const reordered = [...organizers];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setOrganizers(reordered);
    await handleSave();
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await saveCmsPublish();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Có lỗi xảy ra khi lưu & xuất bản nội dung.');
    }
  };

  const handleUpdateEditingEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    updateEvent(editingEvent.id, editingEvent);
    setEditingEvent(null);
    await handleSave();
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      memberSearchQuery.trim() === '' ||
      m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.studentId.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      (m.position && m.position.toLowerCase().includes(memberSearchQuery.toLowerCase()));

    const matchesBan =
      selectedBanFilter === 'ALL' ||
      (m.banName && m.banName.toLowerCase().includes(selectedBanFilter.toLowerCase()));

    return matchesSearch && matchesBan;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-mono-code">
              LANDING PAGE CMS • NỘI DUNG ĐỘNG
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Cập nhật trực tiếp trang chủ cho khách</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Quản Trị Nội Dung Hiển Thị Ngoài Landing Page
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mọi thay đổi khi bấm "Lưu & Xuất Bản" sẽ được áp dụng ngay lập tức ra ngoài Landing Page của khách truy cập.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn khôi phục về dữ liệu mặc định ban đầu?')) {
                resetToDefaults();
                handleSave();
              }
            }}
            disabled={isSaving}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi Phục Gốc</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Xem Thử Landing Page</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Lưu & Xuất Bản</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã lưu và xuất bản thành công! Nội dung mới đã được cập nhật trực tiếp lên Landing Page ngoài trang chủ.</span>
        </div>
      )}

      {/* Save Error Alert */}
      {saveError && (
        <div className="bg-red-50 border-2 border-red-300 text-red-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl gap-3">
        <button
          onClick={() => setActiveTab('events')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'events'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1. Sự Kiện Ngoài Web ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('organizers')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'organizers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Đội Ngũ Core Team ({organizers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'stats'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>3. Số Liệu Dấu Ấn ({stats.length} Thẻ)</span>
        </button>
      </div>

      {/* TAB 1: EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-white p-6 rounded-b-2xl border border-slate-200 border-t-0 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
            <div>
              <h4 className="text-xs font-bold text-blue-950">Sự Kiện Xuất Bản Ngoài Landing Page</h4>
              <p className="text-[11px] text-blue-800/80 mt-0.5">
                Chọn từ danh sách sự kiện nội bộ của CLB để xuất bản hoặc ẩn khỏi Landing Page cho khách vãng lai.
              </p>
            </div>
            <button
              onClick={() => setShowEventPickerModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Chọn Sự Kiện Xuất Bản ({events.filter(e => e.showOnLanding !== false).length}/{events.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.filter(e => e.showOnLanding !== false).map((ev) => (
              <div key={ev.id} className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 space-y-2.5 transition-all shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                    {ev.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      ev.status === 'Registration Open'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ev.status === 'Opening Soon'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : ev.status === 'Upcoming'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {ev.status}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Đang hiển thị
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{ev.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium">📅 {formatDateToDDMMYYYY(ev.date)} • {ev.time}</p>
                <p className="text-[11px] text-slate-500">📍 {ev.location}</p>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono-code truncate max-w-[130px]">
                    ID: {ev.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingEvent(ev)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-blue-600" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleShowOnLanding(ev.id);
                        handleSave();
                      }}
                      title="Gỡ khỏi Landing Page (vẫn giữ trong hệ thống CLB)"
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-200 transition-colors cursor-pointer"
                    >
                      <span>Ẩn Khỏi Landing</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {events.filter(e => e.showOnLanding !== false).length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Hiện chưa có sự kiện nào được chọn để xuất bản ra ngoài Landing Page.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORGANIZERS */}
      {activeTab === 'organizers' && (
        <div className="bg-white p-6 rounded-b-2xl border border-slate-200 border-t-0 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-blue-950">Đội Ngũ Core Team Xuất Bản Ngoài Landing Page</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono-code">
                  KÉO THẢ ĐỂ SẮP XẾP THỨ TỰ
                </span>
              </div>
              <p className="text-[11px] text-blue-800/80 mt-0.5">
                Bạn có thể <strong>kéo thả các thẻ</strong> hoặc dùng nút mũi tên <strong>▲ ▼</strong> để sắp xếp thứ tự hiển thị của các thành viên ngoài trang chủ. Mọi thứ tự mới sẽ tự động lưu và cập nhật ngay lập tức.
              </p>
            </div>
            <button
              onClick={() => setShowMemberPickerModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Thêm Thành Viên Vào Core Team ({organizers.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {organizers.map((org, index) => {
              const defaultAvatar = getDefaultAvatar(org.name);
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index && draggedIndex !== index;

              return (
                <div 
                  key={org.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all duration-150 relative select-none cursor-grab active:cursor-grabbing ${
                    isDragging 
                      ? 'opacity-40 border-dashed border-blue-400 bg-blue-50/30 scale-[0.98]' 
                      : isDragOver
                      ? 'border-blue-500 bg-blue-50/90 ring-2 ring-blue-400/50 scale-[1.02] shadow-md z-10'
                      : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  {/* Card Header: Reorder Handle, Position Number, & Up/Down Arrows */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-black font-mono-code px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                        Vị trí #{index + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Kéo để đổi</span>
                    </div>

                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveOrganizer(index, 'up')}
                        title="Di chuyển lên trước"
                        className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === organizers.length - 1}
                        onClick={() => handleMoveOrganizer(index, 'down')}
                        title="Di chuyển xuống sau"
                        className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <img 
                      src={org.avatarUrl || defaultAvatar} 
                      alt={org.name} 
                      onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shrink-0 shadow-xs pointer-events-none" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{org.name}</p>
                        <span className="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                          {org.domain}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-600 font-semibold truncate">{org.role}</p>
                      <p className="text-[10px] text-slate-400 font-mono-code">{org.cohort} • {org.major}</p>
                      {org.bio && (
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                          {org.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-slate-400 font-mono-code truncate max-w-[130px]">
                      ID: {org.id.slice(0, 8)}...
                    </span>
                    <button
                      onClick={() => handleRemoveOrganizer(org.id, org.name)}
                      title="Gỡ thành viên khỏi Landing Page"
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] rounded-lg border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      <span>Gỡ khỏi Landing Page</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {organizers.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Hiện chưa có thành viên nào trong danh sách Core Team ngoài Landing Page. Bấm "+ Thêm Thành Viên Vào Core Team" để bổ sung.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white p-6 rounded-b-2xl border border-slate-200 border-t-0 shadow-xs space-y-4">
          <p className="text-xs text-slate-500">4 Con số ấn tượng hiển thị trong section "Dấu Ấn Thực Tế" ngoài trang chủ Landing Page. Mọi chỉnh sửa được tự động đồng bộ và lưu vào cơ sở dữ liệu:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-mono-code">THẺ SỐ #{idx + 1}</span>
                  <span className="text-xs font-black text-blue-600">{stat.value}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tiêu Đề Nhãn</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStats(idx, { label: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Giá Trị Hiển Thị (Value)</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStats(idx, { value: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mô Tả Chi Tiết</label>
                  <textarea
                    rows={2}
                    value={stat.description}
                    onChange={(e) => updateStats(idx, { description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* MODAL: CHỌN SỰ KIỆN XUẤT BẢN RA LANDING PAGE */}
      {showEventPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Chọn Sự Kiện Hiển Thị Ngoài Landing Page</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bật/tắt sự kiện từ danh sách sự kiện nội bộ của CLB để xuất bản ra trang chủ.
                </p>
              </div>
              <button
                onClick={() => setShowEventPickerModal(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {events.map((ev) => {
                const isShown = ev.showOnLanding !== false;
                return (
                  <div 
                    key={ev.id} 
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 ${
                      isShown 
                        ? 'border-emerald-300 bg-emerald-50/40' 
                        : 'border-slate-200 bg-slate-50/70 opacity-75'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                          {ev.category}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {formatDateToDDMMYYYY(ev.date)} • {ev.time}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {ev.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">📍 {ev.location}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toggleShowOnLanding(ev.id);
                        handleSave();
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        isShown
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {isShown ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Đang Hiển Thị</span>
                        </>
                      ) : (
                        <span>+ Bật Hiển Thị</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <Link
                to="/app/events"
                onClick={() => setShowEventPickerModal(false)}
                className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
              >
                <span>Tạo sự kiện mới tại trang Quản Lý Sự Kiện →</span>
              </Link>
              <button
                onClick={() => setShowEventPickerModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHỌN THÀNH VIÊN VÀO CORE TEAM */}
      {showMemberPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span>Thêm Thành Viên Vào Đội Ngũ Core Team</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn từ danh sách nhân sự chính thức của CLB để xuất bản ra trang chủ. Thông tin của thành viên sẽ được tự động hiển thị.
                </p>
              </div>
              <button
                onClick={() => setShowMemberPickerModal(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Search & Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên thành viên, MSSV hoặc vị trí..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Ban Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['ALL', 'Ban Điều Hành', 'Ban Trí Tuệ Nhân Tạo', 'Ban Phát Triển Web', 'Ban Điện Toán Đám Mây', 'Ban Nghiên Cứu', 'Ban Truyền Thông', 'Ban Nhân Sự'].map((ban) => (
                  <button
                    key={ban}
                    onClick={() => setSelectedBanFilter(ban)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedBanFilter === ban
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {ban}
                  </button>
                ))}
              </div>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredMembers.map((mem) => {
                const isAlreadyInCore = organizers.some(
                  (o) => o.id === mem.id || o.name.toLowerCase() === mem.name.toLowerCase()
                );
                const memAvatar = mem.avatar || getDefaultAvatar(mem.name);

                return (
                  <div
                    key={mem.id}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                      isAlreadyInCore
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={memAvatar}
                        alt={mem.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = getDefaultAvatar(mem.name); }}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{mem.name}</p>
                          <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {mem.studentId}
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-600 font-semibold truncate">
                          {mem.position} • {mem.banName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono-code">
                          {mem.academicYear || 'K18'} • {mem.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAlreadyInCore ? (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã Có Trong Core Team</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddMemberToCoreTeam(mem)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Thêm Vào Core Team</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Không tìm thấy thành viên phù hợp với từ khóa tìm kiếm.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Đang có {organizers.length} thành viên trong Core Team xuất bản.
              </span>
              <button
                onClick={() => setShowMemberPickerModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateEditingEvent} className="bg-white rounded-2xl max-w-lg w-full p-6 border-2 border-slate-900 shadow-2xl space-y-3.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              Chỉnh Sửa Sự Kiện
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên Sự Kiện</label>
              <input
                type="text"
                required
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Diễn Ra (dd/MM/yyyy)</label>
                <DateInput
                  value={editingEvent.date}
                  onChange={(val) => setEditingEvent({ ...editingEvent, date: val })}
                  placeholder="dd/MM/yyyy"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thời Gian</label>
                <input
                  type="text"
                  value={editingEvent.time}
                  onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Địa Điểm</label>
              <input
                type="text"
                value={editingEvent.location}
                onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái Đăng Ký</label>
              <select
                value={editingEvent.status}
                onChange={(e: any) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="Registration Open">Registration Open (Đang Mở Đăng Ký)</option>
                <option value="Opening Soon">Opening Soon (Sắp Mở Đăng Ký)</option>
                <option value="Upcoming">Upcoming (Sắp Diễn Ra)</option>
                <option value="Completed">Completed (Đã Kết Thúc)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Link Sự Kiện Bevy / Đăng Ký Ngoài (URL)</label>
              <input
                type="url"
                placeholder="https://gdg.community.dev/events/details/..."
                value={editingEvent.registrationUrl || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, registrationUrl: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Khách bấm "Xem Chi Tiết & Đăng Ký" trên Landing Page sẽ được forward trực tiếp qua link này.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingEvent.showOnLanding !== false}
                  onChange={(e) => setEditingEvent({ ...editingEvent, showOnLanding: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Hiển thị sự kiện này ngoài Landing Page
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Cập Nhật
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
