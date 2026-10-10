import React, { useState, useEffect } from 'react';
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
  Users,
  ExternalLink,
  Filter,
  Layers,
} from 'lucide-react';
import { useLandingContentStore } from '../../store/useLandingContentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useMemberStore, Member } from '../../store/useMemberStore';
import { useGenerationStore } from '../../store/useGenerationStore';
import { eventsApi } from '../../api/events.api';
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

  const { members, fetchMembers } = useMemberStore();
  const { 
    currentSemester, 
    currentGen, 
    archivedSemesters, 
    fetchGenerationConfig 
  } = useGenerationStore();

  // Load members and tenure config on mount
  useEffect(() => {
    fetchMembers();
    fetchGenerationConfig();
  }, [fetchMembers, fetchGenerationConfig]);

  // Permissions: BCN (ORG_ADMIN) or HR Ban has event ops management rights
  const isOrgAdmin = user?.tier === 'ORG_ADMIN';
  const isHr = user?.banId === 'hr-event';
  const canManage = isOrgAdmin || isHr;

  // Tenure & Filter state
  const [selectedTenureFilter, setSelectedTenureFilter] = useState<string>('ALL');

  // Modals state
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState<EventItem | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Manual Check-in attendee filters
  const [searchAttendee, setSearchAttendee] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked' | 'unchecked'>('all');

  // Assign Member to Event Modal
  const [showAssignMemberModal, setShowAssignMemberModal] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignBanFilter, setAssignBanFilter] = useState<string>('ALL');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Manual Guest Attendee Form in Attendance Modal
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
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [eventTenureName, setEventTenureName] = useState(currentSemester || 'Fall 2026');
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
    setRegistrationUrl('');
    setEventTenureName(currentSemester || 'Fall 2026');
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
    setRegistrationUrl(ev.registrationUrl || '');
    setEventTenureName(ev.tenureName || currentSemester || 'Fall 2026');
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
        registrationUrl: registrationUrl.trim() || undefined,
        tenureName: eventTenureName,
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
        highlights: ['Giao lưu công nghệ', 'Codelab thực hành', 'Quà tặng độc quyền CLB'],
        registrationUrl: registrationUrl.trim() || undefined,
        tenureName: eventTenureName,
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

  // Find active event with real-time attendees from store
  const activeEvent = selectedEventForAttendance 
    ? events.find(e => e.id === selectedEventForAttendance.id) || selectedEventForAttendance
    : null;

  // Handle Assign Club Member To Event (Also Check-in them directly)
  const handleAssignSingleMember = async (member: Member) => {
    if (!activeEvent) return;

    // Add to local store
    addAttendee(activeEvent.id, {
      name: member.name,
      studentId: member.studentId,
      email: member.email,
      ban: member.banName,
      checkedIn: true,
      checkedInAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
    });

    // Sync with backend API if event exists in DB
    try {
      await eventsApi.addAttendee(activeEvent.id, {
        userId: member.id,
        isVerified: true,
        checkinMethod: 'MANUAL_EVIDENCE',
        notes: 'Gán tham gia trực tiếp từ danh sách thành viên CLB',
      });
    } catch {
      // Handled silently
    }
  };

  const handleAssignSelectedMembers = async () => {
    if (!activeEvent || selectedMemberIds.length === 0) return;

    for (const memId of selectedMemberIds) {
      const member = members.find(m => m.id === memId);
      if (member) {
        await handleAssignSingleMember(member);
      }
    }

    setSelectedMemberIds([]);
    setShowAssignMemberModal(false);
  };

  // Handle Add External Guest Attendee
  const handleAddManualGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !attName.trim() || !attStudentId.trim()) return;

    addAttendee(activeEvent.id, {
      name: attName.trim(),
      studentId: attStudentId.trim().toUpperCase(),
      email: attEmail.trim() || `${attStudentId.trim().toLowerCase()}@fpt.edu.vn`,
      ban: attBan.trim(),
      checkedIn: true,
      checkedInAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN')
    });

    // Try backend sync for guest
    try {
      eventsApi.addAttendee(activeEvent.id, {
        guestName: attName.trim(),
        guestMssv: attStudentId.trim().toUpperCase(),
        guestEmail: attEmail.trim() || `${attStudentId.trim().toLowerCase()}@fpt.edu.vn`,
        isVerified: true,
      }).catch(() => {});
    } catch {
      // Ignored
    }

    setAttName('');
    setAttStudentId('');
    setAttEmail('');
    setAttBan('Sinh viên FPTU');
    setShowAddAttendeeForm(false);
  };

  // Toggle Checkin with backend sync
  const handleToggleCheckin = (attendeeId: string, currentStatus: boolean) => {
    if (!activeEvent) return;
    toggleAttendeeCheckIn(activeEvent.id, attendeeId);
    try {
      eventsApi.toggleCheckin(activeEvent.id, attendeeId, {
        checkedIn: !currentStatus,
      }).catch(() => {});
    } catch {
      // Ignored
    }
  };

  // Remove attendee with backend sync
  const handleRemoveAttendee = (attendeeId: string, attendeeName: string) => {
    if (!activeEvent) return;
    if (confirm(`Bạn có chắc muốn xóa "${attendeeName}" khỏi danh sách tham dự?`)) {
      removeAttendee(activeEvent.id, attendeeId);
      try {
        eventsApi.deleteAttendee(activeEvent.id, attendeeId).catch(() => {});
      } catch {
        // Ignored
      }
    }
  };

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

  // Sắp xếp sự kiện theo MỚI NHẤT
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeB - timeA;
  });

  // Chia theo kỳ (Tenure Filter)
  const filteredEventsByTenure = sortedEvents.filter((ev) => {
    if (selectedTenureFilter === 'ALL') return true;
    if (selectedTenureFilter === 'CURRENT') {
      return !ev.tenureName || ev.tenureName === currentSemester;
    }
    return ev.tenureName === selectedTenureFilter || ev.tenureId === selectedTenureFilter;
  });

  // Unique Tenures for Filter Bar
  const availableTenures = [
    { id: 'ALL', label: 'Tất Cả Các Kỳ' },
    { id: 'CURRENT', label: `Kỳ Hiện Tại (${currentSemester || 'Fall 2026'})` },
    ...archivedSemesters.map(s => ({ id: s.semesterName, label: `${s.semesterName} (${s.gen})` }))
  ];

  // Helper avatar
  const getAvatar = (name: string, avt?: string) =>
    avt || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4285F4,34A853,FBBC04,EA4335&textColor=ffffff`;

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
            <span className="text-xs text-slate-500 font-medium">Hệ thống quản lý sự kiện & Điểm danh thành viên</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Quản Lý Sự Kiện & Điểm Danh Trực Tiếp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sắp xếp theo thứ tự mới nhất, phân loại theo kỳ và gán thành viên tham gia để điểm danh nhanh chóng.
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

      {/* Bộ Lọc Theo Kỳ (Tenure Filter Bar) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 shrink-0">
            <Filter className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Lọc theo kỳ:</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {availableTenures.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTenureFilter(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedTenureFilter === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Attendance List Cards (Sorted newest first) */}
      {filteredEventsByTenure.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          Không có sự kiện nào trong kỳ này. Bấm "Thêm Sự Kiện Mới" để tạo sự kiện.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEventsByTenure.map((ev) => {
            const evAttendees = ev.attendees || [];
            const evChecked = evAttendees.filter(a => a.checkedIn).length;
            const evTotal = evAttendees.length;
            const evRate = evTotal > 0 ? Math.round((evChecked / evTotal) * 100) : 0;

            return (
              <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                        {ev.category}
                      </span>
                      {ev.tenureName && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono-code">
                          {ev.tenureName}
                        </span>
                      )}
                      {ev.showOnLanding && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" />
                          <span>Hiện Landing</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
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

                  {ev.registrationUrl && (
                    <div className="pt-1">
                      <a
                        href={ev.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-xs">{ev.registrationUrl}</span>
                      </a>
                    </div>
                  )}

                  {ev.summary && (
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {ev.summary}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedEventForAttendance(ev)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Điểm Danh & Gán Thành Viên ({evChecked}/{evTotal})</span>
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
      )}

      {/* MODAL 1: MANUAL ATTENDANCE CHECK-IN & ASSIGN DRAWER / MODAL */}
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
                  {activeEvent.tenureName && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {activeEvent.tenureName}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Điểm Danh Trực Tiếp: {activeEvent.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  setSelectedEventForAttendance(null);
                  setShowAddAttendeeForm(false);
                  setShowAssignMemberModal(false);
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

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
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
                  <div className="flex items-center gap-1.5">
                    {/* NÚT GÁN THÀNH VIÊN CLB */}
                    <button
                      onClick={() => setShowAssignMemberModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>+ Gán Thành Viên CLB</span>
                    </button>

                    {/* NÚT THÊM KHÁCH NGOÀI */}
                    <button
                      onClick={() => setShowAddAttendeeForm(!showAddAttendeeForm)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Khách Ngoài</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add Guest Form */}
            {showAddAttendeeForm && (
              <form onSubmit={handleAddManualGuest} className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                    Thêm trực tiếp khách ngoài / sinh viên chưa có tài khoản (Ghi nhận Đã Điểm Danh)
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
                  Chưa có thành viên nào trong danh sách. Bấm <strong>"+ Gán Thành Viên CLB"</strong> ở trên để thêm và điểm danh.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-bold z-10">
                    <tr>
                      <th className="p-2.5 pl-4">Họ và Tên</th>
                      <th className="p-2.5">MSSV</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Ban / Đơn Vị</th>
                      <th className="p-2.5">Trạng Thái Điểm Danh</th>
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
                            {canManage ? (
                              <button
                                onClick={() => handleToggleCheckin(att.id, att.checkedIn)}
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
                                onClick={() => handleRemoveAttendee(att.id, att.name)}
                                title="Xóa người này khỏi sự kiện"
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

      {/* MODAL 2: GÁN THÀNH VIÊN CLB VÀO SỰ KIỆN (ĐIỂM DANH TRỰC TIẾP) */}
      {showAssignMemberModal && activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Gán Thành Viên CLB Vào Sự Kiện (Điểm Danh Trực Tiếp)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn thành viên chính thức từ CLB. Khi gán vào sự kiện, thành viên sẽ tự động được ghi nhận trạng thái <strong>Đã Điểm Danh</strong>.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignMemberModal(false);
                  setSelectedMemberIds([]);
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Search & Ban Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm thành viên theo Họ tên, MSSV hoặc Chức danh..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Ban Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['ALL', 'Ban Điều Hành', 'Ban Trí Tuệ Nhân Tạo', 'Ban Phát Triển Web', 'Ban Điện Toán Đám Mây', 'Ban Nghiên Cứu', 'Ban Truyền Thông', 'Ban Nhân Sự'].map((ban) => (
                  <button
                    key={ban}
                    onClick={() => setAssignBanFilter(ban)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      assignBanFilter === ban
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {ban}
                  </button>
                ))}
              </div>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 border border-slate-200 rounded-xl p-2 max-h-[50vh]">
              {(() => {
                const existingStudentIds = new Set((activeEvent.attendees || []).map(a => a.studentId.toUpperCase()));
                const existingNames = new Set((activeEvent.attendees || []).map(a => a.name.toLowerCase()));

                const filtered = members.filter((m) => {
                  const matchSearch =
                    assignSearch.trim() === '' ||
                    m.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                    m.studentId.toLowerCase().includes(assignSearch.toLowerCase()) ||
                    m.position.toLowerCase().includes(assignSearch.toLowerCase());
                  const matchBan =
                    assignBanFilter === 'ALL' ||
                    (m.banName && m.banName.toLowerCase().includes(assignBanFilter.toLowerCase()));
                  return matchSearch && matchBan;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Không tìm thấy thành viên nào phù hợp bộ lọc.
                    </div>
                  );
                }

                return filtered.map((m) => {
                  const isAlreadyAdded = existingStudentIds.has(m.studentId.toUpperCase()) || existingNames.has(m.name.toLowerCase());
                  const isChecked = selectedMemberIds.includes(m.id);

                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isAlreadyAdded
                          ? 'bg-slate-50/70 border-slate-200 opacity-75'
                          : isChecked
                          ? 'bg-indigo-50/50 border-indigo-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {!isAlreadyAdded && (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMemberIds([...selectedMemberIds, m.id]);
                              } else {
                                setSelectedMemberIds(selectedMemberIds.filter(id => id !== m.id));
                              }
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        )}

                        <img
                          src={getAvatar(m.name, m.avatar)}
                          alt={m.name}
                          className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0"
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {m.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {m.studentId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {m.position} • {m.banName}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isAlreadyAdded ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã Điểm Danh</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAssignSingleMember(m)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>+ Gán & Điểm Danh</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Đã chọn: <span className="text-indigo-600 font-extrabold">{selectedMemberIds.length}</span> thành viên
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignMemberModal(false);
                    setSelectedMemberIds([]);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                {selectedMemberIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAssignSelectedMembers}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Gán {selectedMemberIds.length} Thành Viên & Điểm Danh</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT EVENT MODAL */}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Kỳ Hoạt Động (Nhiệm Kỳ)</label>
                <select
                  value={eventTenureName}
                  onChange={(e) => setEventTenureName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value={currentSemester || 'Fall 2026'}>
                    {currentSemester || 'Fall 2026'} ({currentGen || 'Gen 4.0'} - Hiện tại)
                  </option>
                  {archivedSemesters.map((s) => (
                    <option key={s.id} value={s.semesterName}>
                      {s.semesterName} ({s.gen})
                    </option>
                  ))}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái Đăng Ký</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Registration Open">Đang Mở Đăng Ký (Registration Open)</option>
                <option value="Opening Soon">Sắp Mở Đăng Ký (Opening Soon)</option>
                <option value="Upcoming">Sắp Diễn Ra (Upcoming)</option>
                <option value="Completed">Đã Hoàn Thành (Completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Link Sự Kiện Bevy / Đăng Ký Ngoài (URL)</label>
              <input
                type="url"
                placeholder="https://gdg.community.dev/events/details/..."
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Link forward trực tiếp qua Bevy hoặc form ngoài khi người dùng bấm xem chi tiết trên Landing Page.
              </p>
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
