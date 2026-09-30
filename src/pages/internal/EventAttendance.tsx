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
  Loader2,
  X,
  Award
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useMemberStore } from '../../store/useMemberStore';
import { useGenerationStore } from '../../store/useGenerationStore';
import { eventsApi, generationApi } from '../../api';
import { DateInput } from '../../components/common/DateInput';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

interface BackendAttendee {
  id: string;
  userId?: string;
  fullName?: string;
  mssv?: string;
  email?: string;
  departmentName?: string;
  checkedIn?: boolean;
  isVerified: boolean;
  checkinMethod: string;
  checkinTime?: string;
  evidenceImageUrl?: string;
  notes?: string;
  user?: {
    id: string;
    fullName: string;
    mssv: string;
    email: string;
    department?: {
      name: string;
    };
  };
  guestName?: string;
  guestMssv?: string;
  guestEmail?: string;
  guestDepartment?: string;
}

interface BackendEvent {
  id: string;
  title: string;
  description?: string;
  type: string;
  location: string;
  startTime: string;
  endTime: string;
  attendeeGems: number;
  organizerGems: number;
  isPublic: boolean;
  bannerImageUrl?: string;
  registrationUrl?: string;
  tenureId?: string;
  attendeeCount?: number;
  checkedInCount?: number;
  attendances?: any[];
  _count?: {
    attendances: number;
  };
}

export const EventAttendance: React.FC = () => {
  const { user } = useAuthStore();
  const { activeTenureId, availableTenures, fetchMembers } = useMemberStore();
  const { currentTenureId, fetchConfig } = useGenerationStore();

  const isOrgAdmin = user?.tier === 'ORG_ADMIN';
  const isHr = user?.banId === 'hr-event';
  const canManage = isOrgAdmin || isHr;

  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<BackendEvent | null>(null);
  const [attendees, setAttendees] = useState<BackendAttendee[]>([]);
  const [isAttendeesLoading, setIsAttendeesLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BackendEvent | null>(null);

  // Manual Check-in attendee filters
  const [searchAttendee, setSearchAttendee] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked' | 'unchecked'>('all');

  // New Attendee Form in Attendance Modal
  const [showAddAttendeeForm, setShowAddAttendeeForm] = useState(false);
  const [attName, setAttName] = useState('');
  const [attStudentId, setAttStudentId] = useState('');
  const [attEmail, setAttEmail] = useState('');
  const [attBan, setAttBan] = useState('Sinh viên FPTU');
  const [isAddingAttendee, setIsAddingAttendee] = useState(false);

  // Event Add/Edit Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<string>('WORKSHOP');
  const [selectedTenureId, setSelectedTenureId] = useState<string>('');
  const [date, setDate] = useState('20/10/2026');
  const [location, setLocation] = useState('Hội trường Innovation, ĐH FPT TP.HCM');
  const [summary, setSummary] = useState('');
  const [attendeeGems, setAttendeeGems] = useState(30);
  const [organizerGems, setOrganizerGems] = useState(60);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res: any = await eventsApi.getEvents();
      const list = res?.items || (Array.isArray(res) ? res : []);
      setEvents(list);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchMembers();
    fetchConfig();
  }, [fetchMembers, fetchConfig]);

  const fetchAttendees = async (eventId: string) => {
    setIsAttendeesLoading(true);
    try {
      const res: any = await eventsApi.getAttendees(eventId);
      const list = res?.attendees || (Array.isArray(res) ? res : []);
      setAttendees(list);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
    } finally {
      setIsAttendeesLoading(false);
    }
  };

  const handleOpenAttendanceModal = (ev: BackendEvent) => {
    setSelectedEvent(ev);
    fetchAttendees(ev.id);
  };

  const resetEventForm = () => {
    setTitle('');
    setEventType('WORKSHOP');
    setSelectedTenureId(activeTenureId || currentTenureId || availableTenures[0]?.id || '');
    setDate('20/10/2026');
    setLocation('Hội trường Innovation, ĐH FPT TP.HCM');
    setSummary('');
    setAttendeeGems(30);
    setOrganizerGems(60);
    setIsPublic(true);
    setEditingEvent(null);
  };

  const openCreateEventModal = () => {
    resetEventForm();
    setSelectedTenureId(activeTenureId || currentTenureId || availableTenures[0]?.id || '');
    setShowEventModal(true);
  };

  const openEditEventModal = (ev: BackendEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setEventType((ev.type as any) || 'WORKSHOP');
    setSelectedTenureId(ev.tenureId || activeTenureId || currentTenureId || availableTenures[0]?.id || '');
    setDate(ev.startTime ? formatDateToDDMMYYYY(new Date(ev.startTime)) : '20/10/2026');
    setLocation(ev.location || 'ĐH FPT TP.HCM');
    setSummary(ev.description || '');
    setAttendeeGems(ev.attendeeGems ?? 30);
    setOrganizerGems(ev.organizerGems ?? 60);
    setIsPublic(ev.isPublic !== false);
    setShowEventModal(true);
  };

  const handleSubmitEventForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmittingEvent(true);
    try {
      // Parse date DD/MM/YYYY
      const parts = date.split('/');
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const startTime = new Date(Date.UTC(y, m, d, 8, 30, 0)).toISOString();
      const endTime = new Date(Date.UTC(y, m, d, 12, 0, 0)).toISOString();

      if (editingEvent) {
        await eventsApi.updateEvent(editingEvent.id, {
          title: title.trim(),
          description: summary.trim(),
          type: eventType,
          location: location.trim(),
          startTime,
          endTime,
          attendeeGems: Number(attendeeGems) || 0,
          organizerGems: Number(organizerGems) || 0,
          isPublic,
        });
        showToast(`Cập nhật sự kiện "${title}" thành công!`);
      } else {
        // Resolve valid tenure UUID dynamically
        let targetTenureId = selectedTenureId || activeTenureId || currentTenureId || availableTenures[0]?.id;

        if (!targetTenureId) {
          try {
            const configRes: any = await generationApi.getGenerationConfig();
            targetTenureId = configRes?.currentTenure?.id;
          } catch (cfgErr) {
            console.error('Failed to get tenure UUID from API:', cfgErr);
          }
        }

        if (!targetTenureId) {
          alert('Không tìm thấy thông tin nhiệm kỳ hoạt động (Tenure). Vui lòng thử lại sau giây lát!');
          return;
        }

        await eventsApi.createEvent({
          title: title.trim(),
          description: summary.trim(),
          type: eventType,
          location: location.trim(),
          startTime,
          endTime,
          attendeeGems: Number(attendeeGems) || 0,
          organizerGems: Number(organizerGems) || 0,
          isPublic,
          tenureId: targetTenureId,
        });
        showToast(`Tạo sự kiện mới "${title}" thành công!`);
      }

      setShowEventModal(false);
      await fetchEvents();
    } catch (err: any) {
      console.error('Failed to submit event:', err);
      alert(err.message || 'Lỗi khi lưu sự kiện');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string, eventTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sự kiện "${eventTitle}"?`)) return;
    try {
      await eventsApi.deleteEvent(id);
      showToast(`Đã xóa sự kiện "${eventTitle}" thành công!`);
      await fetchEvents();
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      alert(err.message || 'Lỗi khi xóa sự kiện');
    }
  };

  const handleToggleCheckin = async (attendeeId: string, currentStatus: boolean) => {
    if (!selectedEvent) return;
    try {
      await eventsApi.toggleCheckin(selectedEvent.id, attendeeId, {
        isVerified: !currentStatus,
      });
      await fetchAttendees(selectedEvent.id);
      await fetchEvents();
    } catch (err: any) {
      console.error('Failed to toggle check-in:', err);
      alert(err.message || 'Lỗi khi cập nhật điểm danh');
    }
  };

  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !attName.trim()) return;

    setIsAddingAttendee(true);
    try {
      await eventsApi.addAttendee(selectedEvent.id, {
        guestName: attName.trim(),
        guestMssv: attStudentId.trim().toUpperCase() || undefined,
        guestEmail: attEmail.trim() || undefined,
        guestDepartment: attBan.trim() || 'Sinh viên FPTU',
        checkinMethod: 'MANUAL_EVIDENCE',
        isVerified: true,
      });

      setAttName('');
      setAttStudentId('');
      setAttEmail('');
      setShowAddAttendeeForm(false);
      showToast('Thêm và điểm danh thành công!');
      await fetchAttendees(selectedEvent.id);
      await fetchEvents();
    } catch (err: any) {
      console.error('Failed to add attendee:', err);
      alert(err.message || 'Lỗi khi thêm người tham dự');
    } finally {
      setIsAddingAttendee(false);
    }
  };

  const handleDeleteAttendee = async (attendeeId: string) => {
    if (!selectedEvent) return;
    if (!confirm('Bạn có chắc muốn xóa người tham gia này khỏi sự kiện?')) return;
    try {
      await eventsApi.deleteAttendee(selectedEvent.id, attendeeId);
      await fetchAttendees(selectedEvent.id);
      await fetchEvents();
    } catch (err: any) {
      console.error('Failed to delete attendee:', err);
    }
  };

  // Filter attendees list
  const filteredAttendees = attendees.filter((a) => {
    const name = a.user?.fullName || a.guestName || '';
    const mssv = a.user?.mssv || a.guestMssv || '';
    const email = a.user?.email || a.guestEmail || '';

    const matchesSearch =
      !searchAttendee ||
      name.toLowerCase().includes(searchAttendee.toLowerCase()) ||
      mssv.toLowerCase().includes(searchAttendee.toLowerCase()) ||
      email.toLowerCase().includes(searchAttendee.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'checked' && a.isVerified) ||
      (statusFilter === 'unchecked' && !a.isVerified);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono-code">
              EVENT OPERATIONS & ATTENDANCE
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Hệ thống điều phối sự kiện & điểm danh tại bàn</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Quản Lý Sự Kiện & Điểm Danh Người Tham Dự
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dành riêng cho Ban Chủ Nhiệm và Ban Nhân Sự & Sự Kiện (HR-Event). Tự động quyết toán Gems cho người tham gia và BTC.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openCreateEventModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Sự Kiện Mới</span>
          </button>
        )}
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-bold">Đang tải danh sách sự kiện...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">Chưa có sự kiện nào</h3>
          <p className="text-xs text-slate-500">
            Tạo sự kiện mới để bắt đầu tiếp nhận đăng ký tham dự và tổ chức điểm danh.
          </p>
          {canManage && (
            <button
              onClick={openCreateEventModal}
              className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tạo sự kiện đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => {
            const attCount = ev.attendeeCount ?? ev._count?.attendances ?? ev.attendances?.length ?? 0;
            const checkedInCount = ev.checkedInCount ?? (ev.attendances ? ev.attendances.filter((a: any) => a.isVerified).length : 0);
            const eventDateStr = ev.startTime
              ? new Date(ev.startTime).toLocaleDateString('vi-VN')
              : 'Sắp diễn ra';

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {ev.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ev.isPublic !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ev.isPublic !== false ? 'Hiển thị Landing' : 'Ẩn'}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 mb-2 line-clamp-1">
                    {ev.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{eventDateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ev.location || 'FPTU HCMC'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-amber-700 font-bold">
                        +{ev.attendeeGems} Gems (Tham dự) • +{ev.organizerGems} Gems (BTC)
                      </span>
                    </div>
                  </div>

                  {ev.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    {attCount} người đăng ký {checkedInCount > 0 ? `(${checkedInCount} check-in)` : ''}
                  </span>

                  <div className="flex items-center gap-2">
                    {canManage && (
                      <>
                        <button
                          onClick={() => openEditEventModal(ev)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title="Chỉnh sửa sự kiện"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {isOrgAdmin && (
                          <button
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Xóa sự kiện"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => handleOpenAttendanceModal(ev)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Điểm Danh</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance & Check-in Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedEvent.type}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Bàn Điểm Danh: {selectedEvent.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng số: {attendees.length} người • Đã check-in: {attendees.filter((a) => a.isVerified).length} người
                </p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar & Quick Add */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên, MSSV, Email..."
                  value={searchAttendee}
                  onChange={(e) => setSearchAttendee(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="checked">Đã điểm danh</option>
                  <option value="unchecked">Chưa điểm danh</option>
                </select>

                {canManage && (
                  <button
                    onClick={() => setShowAddAttendeeForm(!showAddAttendeeForm)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Check-in Tại Bàn</span>
                  </button>
                )}
              </div>
            </div>

            {/* Add Attendee Form Drawer */}
            {showAddAttendeeForm && (
              <form
                onSubmit={handleAddAttendee}
                className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs shrink-0"
              >
                <input
                  type="text"
                  required
                  placeholder="Họ và tên *"
                  value={attName}
                  onChange={(e) => setAttName(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-emerald-200 rounded-xl font-medium focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="MSSV (ví dụ: SE180123)"
                  value={attStudentId}
                  onChange={(e) => setAttStudentId(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-emerald-200 rounded-xl font-medium focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email FPT"
                  value={attEmail}
                  onChange={(e) => setAttEmail(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-emerald-200 rounded-xl font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingAttendee}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isAddingAttendee ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Xác Nhận Điểm Danh</span>
                </button>
              </form>
            )}

            {/* Attendees Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl">
              {isAttendeesLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs font-bold">Đang tải danh sách người tham gia...</span>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy người tham dự nào phù hợp bộ lọc.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Họ Và Tên</th>
                      <th className="p-3">MSSV / Email</th>
                      <th className="p-3">Đơn Vị / Ban</th>
                      <th className="p-3">Trạng Thái</th>
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredAttendees.map((att) => {
                      const name = att.user?.fullName || att.guestName || 'Người tham dự';
                      const mssv = att.user?.mssv || att.guestMssv || '-';
                      const email = att.user?.email || att.guestEmail || '-';
                      const dept = att.user?.department?.name || att.guestDepartment || 'Khách mời';

                      return (
                        <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{name}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">
                            <div>{mssv}</div>
                            <div className="text-[10px] text-slate-400">{email}</div>
                          </td>
                          <td className="p-3 text-slate-600">{dept}</td>
                          <td className="p-3">
                            <button
                              disabled={!canManage}
                              onClick={() => handleToggleCheckin(att.id, att.isVerified)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                att.isVerified
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {att.isVerified ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Đã Check-in</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Chưa Điểm Danh</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            {canManage && (
                              <button
                                onClick={() => handleDeleteAttendee(att.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Event */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border-2 border-slate-900 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingEvent ? 'Chỉnh Sửa Sự Kiện' : 'Tạo Sự Kiện Mới'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEventForm} className="space-y-3.5 text-xs">
              {availableTenures.length > 0 && !editingEvent && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nhiệm kỳ tổ chức
                  </label>
                  <select
                    value={selectedTenureId}
                    onChange={(e) => setSelectedTenureId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {availableTenures.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.genLabel} {t.id === activeTenureId ? '(Đang hoạt động)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề sự kiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Google I/O Extended FPTU 2026, GenAI Workshop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Loại sự kiện
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="WORKSHOP">Workshop</option>
                    <option value="SHOWCASE">Showcase</option>
                    <option value="HACKATHON">Hackathon</option>
                    <option value="FLAGSHIP">Flagship Event</option>
                    <option value="CAMPUS_CHALLENGE">Campus Challenge</option>
                    <option value="MEETING">Meeting Ban / CLB</option>
                    <option value="TEAMBUILDING">Teambuilding</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngày diễn ra
                  </label>
                  <DateInput
                    value={date}
                    onChange={setDate}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Địa điểm tổ chức
                </label>
                <input
                  type="text"
                  required
                  placeholder="Hội trường Innovation, ĐH FPT TP.HCM"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Gems thưởng tham dự
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={attendeeGems}
                    onChange={(e) => setAttendeeGems(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Gems thưởng BTC
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={organizerGems}
                    onChange={(e) => setOrganizerGems(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mô tả / Tóm tắt sự kiện
                </label>
                <textarea
                  rows={3}
                  placeholder="Nội dung chính, mục tiêu của sự kiện..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublicCheck"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isPublicCheck" className="font-bold text-slate-700 cursor-pointer">
                  Hiển thị công khai ngoài Landing Page
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSubmittingEvent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingEvent ? 'Lưu Thay Đổi' : 'Tạo Sự Kiện'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
