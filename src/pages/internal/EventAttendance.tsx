import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Search,
  UserCheck,
  UserX,
  Globe,
  Check,
  UserPlus,
} from 'lucide-react';
import { useLandingContentStore } from '../../store/useLandingContentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { EventItem, EventAttendee } from '../../types';
import { DateInput } from '../../components/common/DateInput';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

export const EventAttendance: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    toggleShowOnLanding,
    toggleAttendeeCheckIn, 
    addAttendee, 
    removeAttendee 
  } = useLandingContentStore();

  // Permissions: BCN (ORG_ADMIN) or HR Ban has event ops management rights
  const isOrgAdmin = user?.tier === 'ORG_ADMIN';
  const isHr = user?.banId === 'hr-event';
  const canManage = isOrgAdmin || isHr;

  // Modals state
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState<EventItem | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Manual Check-in attendee filters
  const [searchAttendee, setSearchAttendee] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked' | 'unchecked'>('all');

  // New Attendee Form in Attendance Modal
  const [showAddAttendeeForm, setShowAddAttendeeForm] = useState(false);
  const [attName, setAttName] = useState('');
  const [attStudentId, setAttStudentId] = useState('');
  const [attEmail, setAttEmail] = useState('');
  const [attBan, setAttBan] = useState('Sinh viên FPTU');

  // Event Add/Edit Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Showcase' | 'Flagship Event' | 'Workshop Series' | 'Campus Challenge'>('Workshop Series');
  const [date, setDate] = useState('20/10/2026');
  const [time, setTime] = useState('08:30 AM - 12:00 PM');
  const [location, setLocation] = useState('Hội trường Edison, ĐH FPT TP.HCM');
  const [isHybrid, setIsHybrid] = useState(true);
  const [status, setStatus] = useState<'Upcoming' | 'Registration Open' | 'Opening Soon' | 'Completed'>('Registration Open');
  const [summary, setSummary] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerRole, setSpeakerRole] = useState('');
  const [showOnLanding, setShowOnLanding] = useState(true);

  // Reset event form
  const resetEventForm = () => {
    setTitle('');
    setCategory('Workshop Series');
    setDate('20/10/2026');
    setTime('08:30 AM - 12:00 PM');
    setLocation('Hội trường Edison, ĐH FPT TP.HCM');
    setIsHybrid(true);
    setStatus('Registration Open');
    setSummary('');
    setSpeakerName('');
    setSpeakerRole('');
    setShowOnLanding(true);
    setEditingEvent(null);
  };

  const openCreateEventModal = () => {
    resetEventForm();
    setShowEventModal(true);
  };

  const openEditEventModal = (ev: EventItem) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setCategory(ev.category);
    setDate(ev.date);
    setTime(ev.time);
    setLocation(ev.location);
    setIsHybrid(ev.isHybrid ?? true);
    setStatus(ev.status);
    setSummary(ev.summary || '');
    setSpeakerName(ev.speaker?.name || '');
    setSpeakerRole(ev.speaker?.role || '');
    setShowOnLanding(ev.showOnLanding ?? true);
    setShowEventModal(true);
  };

  const handleSubmitEventForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title: title.trim(),
        category,
        date,
        time,
        location,
        isHybrid,
        status,
        summary,
        speaker: speakerName ? {
          name: speakerName,
          role: speakerRole || 'Diễn Giả Khách Mời',
          company: 'GDG on Campus FPTU HCMC'
        } : undefined,
        showOnLanding
      });
    } else {
      const newEv: EventItem = {
        id: `ev-${Date.now()}`,
        title: title.trim(),
        category,
        date,
        time,
        location,
        isHybrid,
        status,
        accentColor: category === 'Showcase' ? '#EA4335' : category === 'Flagship Event' ? '#4285F4' : category === 'Workshop Series' ? '#34A853' : '#FBBC04',
        pastelColor: category === 'Showcase' ? '#F8D8D8' : category === 'Flagship Event' ? '#C3ECF6' : category === 'Workshop Series' ? '#CCF6C5' : '#FFE7A5',
        summary: summary || 'Sự kiện do GDG on Campus FPT University HCMC tổ chức.',
        highlights: ['Giao lưu cùng diễn giả', 'Codelab thực hành công nghệ', 'Quà tặng độc quyền CLB'],
        speaker: speakerName ? {
          name: speakerName,
          role: speakerRole || 'Diễn Giả Khách Mời',
          company: 'GDG on Campus FPTU HCMC'
        } : undefined,
        showOnLanding,
        attendees: []
      };
      addEvent(newEv);
    }

    setShowEventModal(false);
    resetEventForm();
  };

  const handleDeleteEvent = (ev: EventItem) => {
    if (confirm(`Bạn có chắc muốn xóa sự kiện "${ev.title}"? Dữ liệu điểm danh của sự kiện này sẽ bị xóa vĩnh viễn.`)) {
      deleteEvent(ev.id);
      if (selectedEventForAttendance?.id === ev.id) {
        setSelectedEventForAttendance(null);
      }
    }
  };

  // Handle Add Attendee
  const handleAddAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForAttendance || !attName.trim() || !attStudentId.trim()) return;

    addAttendee(selectedEventForAttendance.id, {
      name: attName.trim(),
      studentId: attStudentId.trim().toUpperCase(),
      email: attEmail.trim() || `${attStudentId.trim().toLowerCase()}@fpt.edu.vn`,
      ban: attBan.trim(),
      checkedIn: true, // Thêm trực tiếp tại bàn điểm danh thì mặc định đã check-in
      checkedInAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN')
    });

    setAttName('');
    setAttStudentId('');
    setAttEmail('');
    setAttBan('Sinh viên FPTU');
    setShowAddAttendeeForm(false);
  };

  // Find active event with real-time attendees from store
  const activeEvent = selectedEventForAttendance 
    ? events.find(e => e.id === selectedEventForAttendance.id) || selectedEventForAttendance
    : null;

  // Filter attendees for attendance modal
  const attendeesList = activeEvent?.attendees || [];
  const filteredAttendees = attendeesList.filter(att => {
    const matchSearch = att.name.toLowerCase().includes(searchAttendee.toLowerCase()) ||
                        att.studentId.toLowerCase().includes(searchAttendee.toLowerCase()) ||
                        att.email.toLowerCase().includes(searchAttendee.toLowerCase()) ||
                        (att.ban && att.ban.toLowerCase().includes(searchAttendee.toLowerCase()));
    if (!matchSearch) return false;
    if (statusFilter === 'checked') return att.checkedIn;
    if (statusFilter === 'unchecked') return !att.checkedIn;
    return true;
  });

  const checkedCount = attendeesList.filter(a => a.checkedIn).length;
  const totalCount = attendeesList.length;
  const attendanceRate = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono-code">
              EVENT & ATTENDANCE MANAGEMENT
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Hệ thống quản lý sự kiện & Điểm danh thủ công</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Quản Lý Sự Kiện & Điểm Danh Trực Tiếp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổ chức sự kiện, kiểm soát danh sách người tham dự và điểm danh bằng tay ngay tại bàn check-in.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openCreateEventModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sự Kiện Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Events Attendance List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((ev) => {
          const evAttendees = ev.attendees || [];
          const evChecked = evAttendees.filter(a => a.checkedIn).length;
          const evTotal = evAttendees.length;
          const evRate = evTotal > 0 ? Math.round((evChecked / evTotal) * 100) : 0;

          return (
            <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                    {ev.category}
                  </span>
                  {ev.showOnLanding && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      <span>Hiện Landing</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    evRate >= 80 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : evRate > 0 
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    Có mặt: {evChecked}/{evTotal} ({evRate}%)
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{ev.title}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatDateToDDMMYYYY(ev.date)} • {ev.time}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{ev.location}</span>
                </p>
              </div>

              {ev.summary && (
                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {ev.summary}
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedEventForAttendance(ev)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Điểm Danh Bằng Tay ({evChecked}/{evTotal})</span>
                </button>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditEventModal(ev)}
                      title="Sửa sự kiện"
                      className="p-1.5 bg-slate-50 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev)}
                      title="Xóa sự kiện"
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: MANUAL ATTENDANCE CHECK-IN DRAWER / MODAL */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                    {activeEvent.category}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-500">
                    {formatDateToDDMMYYYY(activeEvent.date)} ({activeEvent.time})
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Điểm Danh Trực Tiếp: {activeEvent.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  setSelectedEventForAttendance(null);
                  setShowAddAttendeeForm(false);
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Attendance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">Tổng Đăng Ký</span>
                <span className="text-lg font-extrabold text-slate-900">{totalCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-700 block">Đã Có Mặt</span>
                <span className="text-lg font-extrabold text-emerald-700">{checkedCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-700 block">Chưa Check-in</span>
                <span className="text-lg font-extrabold text-amber-700">{totalCount - checkedCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-bold text-indigo-700 block">Tỷ Lệ Check-in</span>
                <span className="text-lg font-extrabold text-indigo-700">{attendanceRate}%</span>
              </div>
            </div>

            {/* Action Bar & Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo Tên, MSSV, Email..."
                  value={searchAttendee}
                  onChange={(e) => setSearchAttendee(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Tất cả ({totalCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('checked')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === 'checked' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Đã đến ({checkedCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('unchecked')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === 'unchecked' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Chưa đến ({totalCount - checkedCount})
                  </button>
                </div>

                {canManage && (
                  <button
                    onClick={() => setShowAddAttendeeForm(!showAddAttendeeForm)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Thêm Tham Gia</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Add Attendee Form */}
            {showAddAttendeeForm && (
              <form onSubmit={handleAddAttendee} className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                    Thêm trực tiếp người tham gia tại bàn điểm danh (Tự động ghi nhận Đã Check-in)
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowAddAttendeeForm(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên *"
                    value={attName}
                    onChange={(e) => setAttName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    required
                    placeholder="MSSV (VD: SE180123) *"
                    value={attStudentId}
                    onChange={(e) => setAttStudentId(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 uppercase"
                  />
                  <input
                    type="email"
                    placeholder="Email FPTU"
                    value={attEmail}
                    onChange={(e) => setAttEmail(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Ban / Lớp / Đơn vị"
                    value={attBan}
                    onChange={(e) => setAttBan(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Ghi Nhận Điểm Danh Ngay</span>
                  </button>
                </div>
              </form>
            )}

            {/* Attendees Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              {filteredAttendees.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không tìm thấy người tham gia nào phù hợp bộ lọc.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-bold z-10">
                    <tr>
                      <th className="p-2.5 pl-4">Họ và Tên</th>
                      <th className="p-2.5">MSSV</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Ban / Đơn Vị</th>
                      <th className="p-2.5">Trạng Thái</th>
                      <th className="p-2.5 text-right pr-4">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendees.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 pl-4 font-bold text-slate-900">
                          {att.name}
                        </td>
                        <td className="p-2.5 font-mono text-slate-700 font-semibold">
                          {att.studentId}
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {att.email}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium">
                            {att.ban || 'Thành viên'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {att.checkedIn ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Đã điểm danh ({att.checkedInAt || 'Hôm nay'})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Chưa có mặt</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Chỉ BCN (ORG_ADMIN) và HR-Event mới được toggle check-in */}
                            {canManage ? (
                              <button
                                onClick={() => toggleAttendeeCheckIn(activeEvent.id, att.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                                  att.checkedIn
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                }`}
                              >
                                {att.checkedIn ? (
                                  <>
                                    <UserX className="w-3 h-3" />
                                    <span>Hủy Check-in</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Điểm Danh</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              /* Read-only badge cho thành viên không có quyền */
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                att.checkedIn
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {att.checkedIn ? (
                                  <><CheckCircle2 className="w-3 h-3" /><span>Đã điểm danh</span></>
                                ) : (
                                  <><XCircle className="w-3 h-3" /><span>Chưa có mặt</span></>
                                )}
                              </span>
                            )}

                            {canManage && (
                              <button
                                onClick={() => {
                                  if (confirm(`Xóa ${att.name} khỏi danh sách sự kiện?`)) {
                                    removeAttendee(activeEvent.id, att.id);
                                  }
                                }}
                                title="Xóa người này"
                                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmitEventForm} className="bg-white rounded-2xl max-w-lg w-full p-6 border-2 border-slate-900 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{editingEvent ? 'Chỉnh Sửa Thông Tin Sự Kiện' : 'Tạo Sự Kiện Mới'}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên Sự Kiện *</label>
              <input
                type="text"
                required
                placeholder="VD: Google I/O Extended FPT University 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phân Loại Sự Kiện</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Showcase">Showcase</option>
                  <option value="Flagship Event">Flagship Event</option>
                  <option value="Workshop Series">Workshop Series</option>
                  <option value="Campus Challenge">Campus Challenge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Registration Open">Đang Mở Đăng Ký</option>
                  <option value="Opening Soon">Sắp Mở Đăng Ký</option>
                  <option value="Upcoming">Sắp Diễn Ra</option>
                  <option value="Completed">Đã Hoàn Thành</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Diễn Ra (dd/MM/yyyy) *</label>
                <DateInput
                  value={date}
                  onChange={setDate}
                  placeholder="dd/MM/yyyy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thời Gian</label>
                <input
                  type="text"
                  placeholder="08:30 AM - 12:00 PM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Địa Điểm Tổ Chức</label>
              <input
                type="text"
                placeholder="Hội trường Edison, ĐH FPT TP.HCM"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả / Tóm Tắt Sự Kiện</label>
              <textarea
                rows={2}
                placeholder="Nội dung tóm tắt buổi workshop hoặc sự kiện..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Diễn Giả / Host</label>
                <input
                  type="text"
                  placeholder="VD: Google Developer Experts"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chức Danh Diễn Giả</label>
                <input
                  type="text"
                  placeholder="VD: Keynote Speaker"
                  value={speakerRole}
                  onChange={(e) => setSpeakerRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Toggle Show on Landing Page */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnLanding}
                  onChange={(e) => setShowOnLanding(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Hiển thị sự kiện này ra ngoài Landing Page của CLB
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowEventModal(false);
                  resetEventForm();
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {editingEvent ? 'Lưu Thay Đổi' : 'Tạo Sự Kiện'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
