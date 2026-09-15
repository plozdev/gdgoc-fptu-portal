import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLandingContentStore } from '../../store/useLandingContentStore';
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
  Eye
} from 'lucide-react';
import { EventItem, OrganizerMember } from '../../types';
import { DateInput } from '../../components/common/DateInput';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

export const LandingCMS: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    chapterInfo, 
    events, 
    organizers, 
    stats, 
    updateChapterInfo, 
    updateEvent, 
    addEvent, 
    deleteEvent, 
    toggleShowOnLanding,
    updateOrganizer, 
    addOrganizer, 
    deleteOrganizer, 
    updateStats,
    resetToDefaults 
  } = useLandingContentStore();

  const [activeTab, setActiveTab] = useState<'events' | 'organizers' | 'stats' | 'info'>('events');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit Event state
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editingOrganizer, setEditingOrganizer] = useState<OrganizerMember | null>(null);
  const [showEventPickerModal, setShowEventPickerModal] = useState(false);

  // 🚨 Chỉ BCN (ORG_ADMIN - Chapter Lead & Co-Chapter Lead) mới có quyền truy cập Landing CMS
  if (user?.tier !== 'ORG_ADMIN') {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdateEditingEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    updateEvent(editingEvent.id, editingEvent);
    setEditingEvent(null);
    handleSave();
  };

  const handleUpdateEditingOrganizer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrganizer) return;
    updateOrganizer(editingOrganizer.id, editingOrganizer);
    setEditingOrganizer(null);
    handleSave();
  };

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
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu & Xuất Bản</span>
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
          <span>3. Số Liệu Summer 2026 (4 Thẻ)</span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>4. Thông Tin Đợt Tuyển & Slogan</span>
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Đang hiển thị ngoài Landing
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
          <p className="text-xs text-slate-500">Danh sách các thành viên Ban tổ chức hiển thị trên section "Core Team" ngoài Landing Page:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {organizers.map((org) => (
              <div key={org.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-3">
                  <img src={org.avatarUrl} alt={org.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{org.name}</p>
                    <p className="text-[11px] text-blue-600 font-semibold truncate">{org.role}</p>
                    <p className="text-[10px] text-slate-400 font-mono-code">{org.cohort} • {org.major}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
                  <button
                    onClick={() => setEditingOrganizer(org)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-blue-600" />
                    <span>Sửa Thông Tin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white p-6 rounded-b-2xl border border-slate-200 border-t-0 shadow-xs space-y-4">
          <p className="text-xs text-slate-500">4 Con số ấn tượng hiển thị trong section "Số Liệu Kỳ Summer 2026":</p>
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

      {/* TAB 4: INFO */}
      {activeTab === 'info' && (
        <div className="bg-white p-6 rounded-b-2xl border border-slate-200 border-t-0 shadow-xs space-y-4 max-w-2xl">
          <p className="text-xs text-slate-500">Thông tin nhận diện và tuyển dụng ngoài trang chủ:</p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Đợt Tuyển Dụng Hiện Tại</label>
            <input
              type="text"
              value={chapterInfo.recruitmentBatch}
              onChange={(e) => updateChapterInfo({ recruitmentBatch: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kỳ Hoạt Động (Term)</label>
            <input
              type="text"
              value={chapterInfo.term}
              onChange={(e) => updateChapterInfo({ term: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Slogan CLB</label>
            <input
              type="text"
              value={chapterInfo.slogan}
              onChange={(e) => updateChapterInfo({ slogan: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hashtag Chính Thức</label>
            <input
              type="text"
              value={chapterInfo.hashtag}
              onChange={(e) => updateChapterInfo({ hashtag: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Liên Hệ</label>
            <input
              type="email"
              value={chapterInfo.email}
              onChange={(e) => updateChapterInfo({ email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>
        </div>
      )}

      {/* MODAL: SELECT EVENTS FROM INTERNAL LIST TO DISPLAY ON LANDING */}
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

      {/* Edit Organizer Modal */}
      {editingOrganizer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateEditingOrganizer} className="bg-white rounded-2xl max-w-md w-full p-6 border-2 border-slate-900 shadow-2xl space-y-3.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              Sửa Thông Tin Core Team
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và Tên</label>
              <input
                type="text"
                required
                value={editingOrganizer.name}
                onChange={(e) => setEditingOrganizer({ ...editingOrganizer, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vai Trò Hiển Thị</label>
              <input
                type="text"
                required
                value={editingOrganizer.role}
                onChange={(e) => setEditingOrganizer({ ...editingOrganizer, role: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Khóa (Cohort)</label>
                <input
                  type="text"
                  value={editingOrganizer.cohort}
                  onChange={(e) => setEditingOrganizer({ ...editingOrganizer, cohort: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên Ngành (Major)</label>
                <input
                  type="text"
                  value={editingOrganizer.major}
                  onChange={(e) => setEditingOrganizer({ ...editingOrganizer, major: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL Ảnh Avatar</label>
              <input
                type="url"
                value={editingOrganizer.avatarUrl}
                onChange={(e) => setEditingOrganizer({ ...editingOrganizer, avatarUrl: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingOrganizer(null)}
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
