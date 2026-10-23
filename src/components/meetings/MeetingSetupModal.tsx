import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Users, 
  Search, 
  Check, 
  Send, 
  Sparkles, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  Copy,
  Building,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useMemberStore, Member } from '../../store/useMemberStore';
import { meetingsApi } from '../../api/meetings.api';
import { BanId, BAN_NAMES } from '../../types/auth';

interface MeetingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BAN_OPTIONS: { id: BanId; name: string; short: string; color: string; badge: string; deptCode: string }[] = [
  { id: 'ai', name: 'Ban AI (Trí Tuệ Nhân Tạo)', short: 'Ban AI', color: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', deptCode: 'TECH_AI' },
  { id: 'web', name: 'Ban Web Frontend & Backend', short: 'Ban Web', color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', deptCode: 'TECH_WEB' },
  { id: 'cloud', name: 'Ban Cloud & DevOps', short: 'Ban Cloud', color: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', deptCode: 'TECH_CLOUD' },
  { id: 'media', name: 'Ban Truyền Thông & Media', short: 'Ban Media', color: 'bg-pink-500', badge: 'bg-pink-50 text-pink-700 border-pink-200', deptCode: 'MEDIA' },
  { id: 'hr-event', name: 'Ban Nhân Sự & Sự Kiện', short: 'Ban HR-Event', color: 'bg-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200', deptCode: 'HR_EVENT' },
  { id: 'research', name: 'Ban Nghiên Cứu (Research)', short: 'Ban Research', color: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200', deptCode: 'TECH_RESEARCH' },
];

export const MeetingSetupModal: React.FC<MeetingSetupModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { members, fetchMembers } = useMemberStore();

  // Load members if empty
  useEffect(() => {
    if (isOpen && members.length === 0) {
      fetchMembers({ limit: 150 });
    }
  }, [isOpen, members.length, fetchMembers]);

  // Form states
  const [title, setTitle] = useState('');
  
  // Calculate default date & time (tomorrow at 19:30)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('19:30');
  const [endTime, setEndTime] = useState('21:00');
  const [format, setFormat] = useState<'ONLINE' | 'OFFLINE' | 'HYBRID'>('ONLINE');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [location, setLocation] = useState('Google Meet');
  const [description, setDescription] = useState('');

  // Attendee selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBanFilter, setActiveBanFilter] = useState<string>('ALL');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    recipientCount: number;
    title: string;
    time: string;
    meetUrl?: string;
  } | null>(null);

  // Active / probation members list (excludes alumni unless explicitly picked)
  const availableMembers = useMemo(() => {
    return members.filter((m) => m.status !== 'ALUMNI');
  }, [members]);

  // Quick duration helper
  const addDurationMinutes = (minutes: number) => {
    try {
      const [h, m] = startTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + minutes;
      const newH = Math.floor(totalMinutes / 60) % 24;
      const newM = totalMinutes % 60;
      const newEndTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
      setEndTime(newEndTime);
    } catch {
      // Fallback
    }
  };

  // Preset attendees selectors
  const selectAll = () => {
    const allIds = new Set(availableMembers.map((m) => m.id));
    setSelectedIds(allIds);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const toggleSelectBan = (banId: BanId) => {
    const banMemberIds = availableMembers
      .filter((m) => m.banId === banId)
      .map((m) => m.id);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = banMemberIds.length > 0 && banMemberIds.every((id) => next.has(id));
      if (allSelected) {
        banMemberIds.forEach((id) => next.delete(id));
      } else {
        banMemberIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectBcn = () => {
    const bcnMemberIds = availableMembers
      .filter((m) => m.tier === 'ORG_ADMIN' || m.tier === 'ADVISOR')
      .map((m) => m.id);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = bcnMemberIds.length > 0 && bcnMemberIds.every((id) => next.has(id));
      if (allSelected) {
        bcnMemberIds.forEach((id) => next.delete(id));
      } else {
        bcnMemberIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectLeads = () => {
    const leadIds = availableMembers
      .filter((m) => m.tier === 'ORG_ADMIN' || m.tier === 'BAN_LEAD')
      .map((m) => m.id);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = leadIds.length > 0 && leadIds.every((id) => next.has(id));
      if (allSelected) {
        leadIds.forEach((id) => next.delete(id));
      } else {
        leadIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filtered members by search query and ban filter
  const filteredMembers = useMemo(() => {
    return availableMembers.filter((m) => {
      // Ban filter
      if (activeBanFilter === 'BCN') {
        if (m.tier !== 'ORG_ADMIN' && m.tier !== 'ADVISOR') return false;
      } else if (activeBanFilter !== 'ALL') {
        if (m.banId !== activeBanFilter) return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchEmail = m.email?.toLowerCase().includes(q);
      const matchStudentId = m.studentId?.toLowerCase().includes(q);
      const matchBan = m.banName?.toLowerCase().includes(q);
      return matchName || matchEmail || matchStudentId || matchBan;
    });
  }, [availableMembers, activeBanFilter, searchQuery]);

  // Submit Handler
  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề cuộc họp.');
      return;
    }

    if (selectedIds.size === 0) {
      setError('Vui lòng chọn ít nhất 1 thành viên tham dự cuộc họp.');
      return;
    }

    // Combine date + time into ISO strings
    const startIso = new Date(`${date}T${startTime}:00`).toISOString();
    const endIso = new Date(`${date}T${endTime}:00`).toISOString();

    if (new Date(endIso) <= new Date(startIso)) {
      setError('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.');
      return;
    }

    setIsSubmitting(true);

    try {
      const targetUserIds: string[] = Array.from(selectedIds);
      const isAllHands = selectedIds.size >= availableMembers.length;

      const res = await meetingsApi.dispatchMeeting({
        title: title.trim(),
        startTime: startIso,
        endTime: endIso,
        location: location.trim() || (format === 'ONLINE' ? 'Google Meet' : 'Chưa xác định'),
        meetingUrl: format !== 'OFFLINE' ? meetingUrl.trim() || undefined : undefined,
        description: description.trim() || undefined,
        targetType: isAllHands ? 'ALL' : 'CUSTOM',
        targetUserIds,
      });

      setSuccessData({
        recipientCount: res.recipientCount || targetUserIds.length,
        title: title.trim(),
        time: `${startTime} - ${endTime}, ngày ${date.split('-').reverse().join('/')}`,
        meetUrl: format !== 'OFFLINE' ? meetingUrl.trim() : undefined,
      });
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi thiết lập lịch họp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setMeetingUrl('');
    setSelectedIds(new Set());
    setError(null);
    setSuccessData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google 4-Color Accent Line */}
        <div className="h-1.5 w-full grid grid-cols-4 shrink-0">
          <div className="bg-[#4285F4]"></div>
          <div className="bg-[#EA4335]"></div>
          <div className="bg-[#FBBC04]"></div>
          <div className="bg-[#34A853]"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-xs">
              <Calendar className="w-5 h-5 text-[#4285F4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                  Thiết Lập Lịch Họp (Meeting Dispatcher)
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100/70 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Leader Tool
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập nhanh, chọn người tham gia và tự động gửi thông báo in-app + Email Google Calendar (.ics)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        {successData ? (
          /* SUCCESS SCREEN */
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 animate-scaleUp overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-100">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="max-w-md">
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Đã Thiết Lập & Phát Lịch Họp Thành Công!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                Hệ thống đã gửi thông báo in-app và email thư mời có đính kèm file Google Calendar (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono-code text-[11px]">invite.ics</code>) đến{' '}
                <strong className="text-blue-600 font-bold">{successData.recipientCount} thành viên</strong>.
              </p>
            </div>

            {/* Meeting Summary Card */}
            <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2.5 text-xs text-slate-700 shadow-xs">
              <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
                <span>{successData.title}</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Đã phát
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{successData.time}</span>
              </div>
              {successData.meetUrl && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2 truncate">
                    <Video className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate text-blue-600 font-mono-code">{successData.meetUrl}</span>
                  </div>
                  <a
                    href={successData.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Mở link Meet"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Tạo lịch họp khác
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          /* FORM BODY */
          <form onSubmit={handleDispatch} className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Left Panel: Meeting Details */}
            <div className="p-5 sm:p-6 space-y-4 md:w-1/2 flex flex-col shrink-0">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>1. Thông Tin Buổi Họp</span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề cuộc họp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="vd: Họp Ban Web & AI tuần 4 - Review MVP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              {/* Date & Time Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày họp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick duration presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-bold mr-1">Thời lượng nhanh:</span>
                {[
                  { label: '+30p', mins: 30 },
                  { label: '+45p', mins: 45 },
                  { label: '+1h', mins: 60 },
                  { label: '+1.5h', mins: 90 },
                  { label: '+2h', mins: 120 },
                ].map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => addDurationMinutes(d.mins)}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200/80 transition-colors"
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Format selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hình thức tổ chức
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ONLINE', label: 'Online (Meet)', icon: Video },
                    { id: 'OFFLINE', label: 'Offline (Trực tiếp)', icon: Building },
                    { id: 'HYBRID', label: 'Hybrid (Cả hai)', icon: Users },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = format === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setFormat(item.id as any);
                          if (item.id === 'ONLINE') setLocation('Google Meet');
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Online: Google Meet link */}
              {format !== 'OFFLINE' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Link Google Meet
                    </label>
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Tạo nhanh link Meet mới</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <Video className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono-code"
                    />
                  </div>
                </div>
              )}

              {/* Offline: Location & Presets */}
              {format !== 'ONLINE' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa điểm / Phòng họp
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="vd: Phòng 204 ĐH FPT"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {['Phòng 204', 'Phòng 301', 'Hội trường Innovation', 'Sảnh Beta'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLocation(preset)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description / Agenda */}
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung / Agenda tóm tắt
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="vd: 1. Review tiến độ các tính năng tuần qua&#10;2. Q&A và giải đáp thắc mắc&#10;3. Phân công task tuần tới"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Right Panel: Attendees Selection */}
            <div className="p-5 sm:p-6 md:w-1/2 flex flex-col space-y-3.5 bg-slate-50/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>2. Chọn Người Tham Gia ({selectedIds.size})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-[11px] font-bold text-slate-500 hover:underline"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Quick Select Presets (Click to toggle whole department) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500">Chọn nhanh theo nhóm:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    Toàn CLB (All-Hands)
                  </button>
                  <button
                    type="button"
                    onClick={toggleSelectBcn}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200 transition-colors"
                  >
                    + BCN
                  </button>
                  <button
                    type="button"
                    onClick={toggleSelectLeads}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                  >
                    + Tất cả Leads
                  </button>
                  {BAN_OPTIONS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleSelectBan(b.id)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-colors ${b.badge} hover:brightness-95`}
                    >
                      + {b.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar & Filter tabs */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên, MSSV, ban..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setActiveBanFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                      activeBanFilter === 'ALL'
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                    }`}
                  >
                    Tất cả ({availableMembers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBanFilter('BCN')}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                      activeBanFilter === 'BCN'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                    }`}
                  >
                    BCN
                  </button>
                  {BAN_OPTIONS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActiveBanFilter(b.id)}
                      className={`px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                        activeBanFilter === b.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                      }`}
                    >
                      {b.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Members Scroll List */}
              <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl bg-white p-1 space-y-1 divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    Không tìm thấy thành viên phù hợp
                  </div>
                ) : (
                  filteredMembers.map((m) => {
                    const isChecked = selectedIds.has(m.id);
                    const banOption = BAN_OPTIONS.find((b) => b.id === m.banId);

                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleMember(m.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors select-none ${
                          isChecked ? 'bg-blue-50/70 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Checkbox */}
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                              isChecked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          {/* Avatar */}
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                            {m.avatar ? (
                              <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-600 uppercase">
                                {m.name ? m.name.charAt(0) : 'U'}
                              </div>
                            )}
                          </div>

                          {/* Name and MSSV */}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                              <span>{m.name}</span>
                              {m.tier === 'ORG_ADMIN' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  BCN
                                </span>
                              )}
                              {m.tier === 'BAN_LEAD' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                  Lead
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono-code truncate">
                              {m.studentId} • {m.email}
                            </div>
                          </div>
                        </div>

                        {/* Ban badge */}
                        <div className="shrink-0 ml-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              banOption ? banOption.badge : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {m.banName ? m.banName.replace('Ban ', '') : 'Chung'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Pills Summary */}
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>
                  Đã chọn: <strong className="text-blue-600 font-bold">{selectedIds.size}</strong> / {availableMembers.length} thành viên
                </span>
                {selectedIds.size > 0 && (
                  <span className="text-[10px] text-slate-400">
                    Sẽ gửi thông báo & Email Calendar
                  </span>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Footer with Error & Actions */}
        {!successData && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {error ? (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>🔔 Tự động đồng bộ lịch Google Calendar qua Email và In-App Notification.</span>
              </div>
            )}

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDispatch}
                disabled={isSubmitting || selectedIds.size === 0}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang gửi thư mời...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Lời Mời Họp ({selectedIds.size})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
