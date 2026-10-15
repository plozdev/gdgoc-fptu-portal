import React, { useCallback, useEffect, useState, useMemo } from "react";
import { subscribeSync } from '../../sync/subscriptions';
import { MemberProfileLink } from '../../components/members/MemberProfileLink';
import {
  eventsApi,
  EventContributor,
  CreateEventDto,
} from "../../api/events.api";
import { useAuthStore } from "../../store/useAuthStore";
import { useMemberStore } from "../../store/useMemberStore";
import { canManageEvents } from "../../types/auth";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Globe,
  Lock,
  UserPlus,
  Award,
  ChevronRight,
} from "lucide-react";

const toLocalInput = (value: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const blank: CreateEventDto = {
  title: "",
  type: "WORKSHOP",
  location: "",
  startTime: "",
  endTime: "",
  contributionGems: 20,
  isPublic: false,
  registrationUrl: "",
  description: "",
};

const EVENT_TYPES = [
  { value: "WORKSHOP", label: "Workshop", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "HACKATHON", label: "Hackathon", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "FLAGSHIP", label: "Flagship Event", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "MEETING", label: "Internal Meeting", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "TEAMBUILDING", label: "Teambuilding", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { value: "SHOWCASE", label: "Showcase & Demo", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "CAMPUS_CHALLENGE", label: "Campus Challenge", color: "bg-rose-50 text-rose-700 border-rose-200" },
];

export const EventManagement: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { members, fetchMembers } = useMemberStore();

  const [events, setEvents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [contributors, setContributors] = useState<EventContributor[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberBan, setMemberBan] = useState('all');
  const [addedMessage, setAddedMessage] = useState('');
  const eligibleMembers = members.filter(m => ['ACTIVE', 'PROBATION'].includes(m.status) && !contributors.some(c => c.userId === m.id));
  const visibleMembers = eligibleMembers.filter(m => (memberBan === 'all' || (m.banId || 'bcn') === memberBan) &&
    (m.name + ' ' + m.studentId).toLocaleLowerCase('vi').includes(memberSearch.toLocaleLowerCase('vi').trim()));
  const [role, setRole] = useState("");
  const [form, setForm] = useState<CreateEventDto | null>(null);
  const [editId, setEditId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const manager = canManageEvents(user);

  const load = useCallback(async () => {
    try {
      const data = await eventsApi.getEvents();
      setEvents(Array.isArray(data) ? data : []);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, []);

  useEffect(() => {
    return subscribeSync(['events', 'scope'], load);
  }, [load]);

  const openContributors = async (event: any) => {
    setSelected(event);
    setContributors([]);
    setSelectedMemberIds([]);
    setMemberSearch('');
    setMemberBan('all');
    setRole('');
    setAddedMessage('');
    if (manager) await fetchMembers({ tenureId: event.tenureId });
    setError("");
    try {
      const res = await eventsApi.getContributors(event.id);
      setContributors(Array.isArray(res) ? res : []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const run = async (action: () => Promise<any>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
      await load();
      if (selected) {
        const res = await eventsApi.getContributors(selected.id);
        setContributors(Array.isArray(res) ? res : []);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    void run(async () => {
      const dto = {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };
      if (!dto.registrationUrl) delete dto.registrationUrl;
      if (editId) await eventsApi.updateEvent(editId, dto);
      else await eventsApi.createEvent(dto);
      setForm(null);
    });
  };

  // Format date helper
  const formatEventDate = (start: string, end?: string) => {
    try {
      const s = new Date(start);
      const day = s.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const timeS = s.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      if (!end) return `${timeS} · ${day}`;
      const e = new Date(end);
      const timeE = e.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      return `${timeS} - ${timeE} · ${day}`;
    } catch {
      return start;
    }
  };

  const getStatusBadge = (startTime: string, endTime: string) => {
    const now = new Date().getTime();
    const s = new Date(startTime).getTime();
    const e = new Date(endTime).getTime();

    if (now < s) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3" /> Sắp diễn ra
        </span>
      );
    }
    if (now >= s && now <= e) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Đang diễn ra
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Đã kết thúc
      </span>
    );
  };

  const getTypeInfo = (type: string) => {
    return EVENT_TYPES.find((t) => t.value === type) || {
      value: type,
      label: type,
      color: "bg-slate-100 text-slate-700 border-slate-200",
    };
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchType = typeFilter === "ALL" || ev.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        (ev.location && ev.location.toLowerCase().includes(q)) ||
        (ev.description && ev.description.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [events, typeFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12 animate-fadeIn">
      {/* Google 4-Color Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] rounded-full shadow-xs mb-2" />

      {/* Top Banner: Thống kê & Phân quyền */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-mono-code uppercase tracking-wider">
              Event Management
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Chào {user?.fullName || user?.name || "bạn"}, chúc bạn ngày làm việc hiệu quả!
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Sự Kiện & Đóng Góp Ban Tổ Chức</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono-code">
              {events.length} sự kiện
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showcase sự kiện lên Landing Page, link đăng ký qua Bevy và phân bổ điểm Gems cố định cho ban tổ chức.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={() => void load()}
            disabled={busy}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Đồng bộ lại dữ liệu"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
            <span>Làm Mới</span>
          </button>

          {manager && (
            <button
              onClick={() => {
                setEditId("");
                setForm({ ...blank });
              }}
              className="px-4 py-2 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Sự Kiện Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Type Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên sự kiện, hội trường, địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium transition-all"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setTypeFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              typeFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Tất Cả ({events.length})
          </button>
          {EVENT_TYPES.map((t) => {
            const count = events.filter((e) => e.type === t.value).length;
            if (count === 0 && typeFilter !== t.value) return null;
            return (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  typeFilter === t.value
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{t.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono-code bg-slate-200 text-slate-700">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 space-y-2">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 opacity-60" />
          <p className="text-sm font-medium text-slate-600">
            Không tìm thấy sự kiện nào phù hợp.
          </p>
          <p className="text-xs text-slate-400">
            Hãy thử tìm với từ khóa khác hoặc bấm "Tạo Sự Kiện Mới" để bắt đầu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((event) => {
            const typeInfo = getTypeInfo(event.type);

            return (
              <article
                key={event.id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-blue-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group space-y-4"
              >
                {/* Header: Badges & Semester */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {getStatusBadge(event.startTime, event.endTime)}
                      {event.isPublic ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Globe className="w-3 h-3" /> Landing Page
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <Lock className="w-3 h-3" /> Nội bộ
                        </span>
                      )}
                    </div>
                    {event.semester?.name && (
                      <span className="text-[11px] font-mono-code font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {event.semester.name}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.title}
                    </h2>
                    {event.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-700">
                        {formatEventDate(event.startTime, event.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate text-slate-600">{event.location}</span>
                    </div>
                  </div>

                  {/* Gems & Contributors Stats Pill */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-800 text-xs font-bold shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{event.contributionGems ?? 20} Gems/người</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.contributorCount || 0} người trong BTC</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void openContributors(event)}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Xem & Quản Lý Đóng Góp</span>
                    </button>

                    {event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mở Bevy</span>
                      </a>
                    )}
                  </div>

                  {manager && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (event.semester?.isClosed) return;
                          setEditId(event.id);
                          setForm({
                            title: event.title,
                            description: event.description || "",
                            type: event.type,
                            location: event.location,
                            startTime: toLocalInput(event.startTime),
                            endTime: toLocalInput(event.endTime),
                            contributionGems: event.contributionGems,
                            registrationUrl: event.registrationUrl || "",
                            isPublic: event.isPublic,
                          });
                        }}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                        disabled={busy || event.semester?.isClosed}
                        title="Sửa sự kiện"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        disabled={busy || event.semester?.isClosed}
                        onClick={() => {
                          if (event.semester?.isClosed) return;
                          if (window.confirm(`Xóa sự kiện "${event.title}"?\n\nGems đã cộng từ sự kiện này cho ${event.rewardedCount || 0} người sẽ bị thu hồi. Task và tài nguyên liên quan được giữ lại, bỏ liên kết event. Thao tác này không thể hoàn tác.`))
                            void run(() => eventsApi.deleteEvent(event.id));
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title={event.semester?.isClosed ? 'Kỳ đã lưu trữ, không thể xóa hoặc thay đổi Gems lịch sử.' : 'Xóa sự kiện và thu hồi Gems liên quan'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Quản Lý Đóng Góp & Thưởng Gems */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <section className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl border border-slate-200 custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono-code uppercase">
                    Ban Tổ Chức Sự Kiện
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {selected.contributionGems} Gems / người
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {selected.title}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>}
            {manager && !selected.semester?.isClosed && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <p className="flex gap-2 items-center text-sm font-bold"><UserPlus className="w-4 h-4" />Chọn người đã tham gia đóng góp</p>
                <p className="text-xs text-slate-500">Tick thành viên để ghi nhận và cộng Gems ngay. Bỏ thành viên sẽ thu hồi Gems đã nhận từ sự kiện này.</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input aria-label="Tìm thành viên" placeholder="Tìm tên hoặc MSSV…" className="border rounded-xl p-2 text-sm" value={memberSearch} onChange={e=>setMemberSearch(e.target.value)} />
                  <select aria-label="Lọc ban" className="border rounded-xl p-2 text-sm" value={memberBan} onChange={e=>setMemberBan(e.target.value)}>
                    <option value="all">Tất cả các ban</option>
                    {[...new Map(eligibleMembers.map(m=>[m.banId || 'bcn', m.banName || 'Chưa phân ban'])).entries()].map(([id,name])=><option key={id} value={id}>{name}</option>)}
                  </select>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <button type="button" disabled={busy || !visibleMembers.length} className="text-blue-600 font-bold" onClick={() => void run(async () => {
                    const ids = visibleMembers.map(member => member.id);
                    setSelectedMemberIds(ids);
                    try { const result = await eventsApi.addContributors(selected.id, { userIds: ids, roleInEvent: role }); setAddedMessage('Đã ghi nhận và cộng Gems cho ' + result.rewardedCount + ' người.'); }
                    finally { setSelectedMemberIds([]); }
                  })}>Chọn tất cả và cộng Gems ({visibleMembers.length})</button>
                  <span>{busy ? 'Đang lưu và cập nhật Gems…' : 'Tự động lưu'}</span>
                </div>
                <div className="max-h-52 overflow-y-auto bg-white border rounded-xl divide-y">
                  {visibleMembers.map(m=><label key={m.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-blue-50">
                    <input type="checkbox" disabled={busy} checked={selectedMemberIds.includes(m.id)} onChange={e => { if (!e.target.checked) return; void run(async () => {
                      setSelectedMemberIds([m.id]);
                      try { const result = await eventsApi.addContributors(selected.id, { userIds: [m.id], roleInEvent: role }); setAddedMessage(result.rewardedCount ? 'Đã ghi nhận và cộng Gems cho ' + m.name + '.' : m.name + ' đã được ghi nhận trước đó.'); }
                      finally { setSelectedMemberIds([]); }
                    }); }} />
                    <span className="text-sm"><strong>{m.name}</strong><span className="block text-xs text-slate-500">{m.studentId} · {m.banName || 'Chưa phân ban'}</span></span>
                  </label>)}
                  {!visibleMembers.length && <p className="p-4 text-sm text-slate-500">Không có thành viên phù hợp chưa được thêm.</p>}
                </div>
                <input className="w-full border rounded-xl p-2 text-sm" placeholder="Vai trò chung (không bắt buộc): Media, Logistics…" value={role} onChange={e=>setRole(e.target.value)} maxLength={200} />
                <div className="flex justify-between items-center gap-3">
                  <span role="status" className="text-xs text-emerald-700">{addedMessage}</span>

                </div>
              </div>
            )}

            {/* Contributors List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>Danh sách thành viên BTC ({contributors.length})</span>
                <span className="font-mono-code">
                  Đã thưởng: {contributors.filter((c) => c.isGemsGranted).length} / {contributors.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {contributors.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Chưa có thành viên nào được gán vào sự kiện này.
                  </div>
                ) : (
                  contributors.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MemberProfileLink id={c.userId} className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {c.user?.fullName?.charAt(0) || "U"}
                        </MemberProfileLink>
                        <div>
                          <p className="font-bold text-xs text-slate-900"><MemberProfileLink id={c.userId}>{c.user?.fullName}</MemberProfileLink></p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-blue-600 font-medium">
                              {c.roleInEvent || "Thành viên ban tổ chức"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono-code">
                              {c.user?.mssv}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {manager && !selected.semester?.isClosed && <input type="checkbox" aria-label={'Ghi nhận đóng góp của ' + c.user.fullName} checked={c.isGemsGranted} disabled={busy} onChange={e => {
                          if (e.target.checked) void run(() => eventsApi.addContributors(selected.id, { userIds: [c.userId] }));
                          else if (window.confirm('Bỏ ' + c.user.fullName + ' khỏi sự kiện và thu hồi Gems đã nhận?')) void run(() => eventsApi.deleteContributor(selected.id, c.userId));
                        }} />}
                        {c.isGemsGranted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đã nhận Gems 💎</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Chưa nhận Gems (dữ liệu cũ)</span>
                          </span>
                        )}

                        {manager && !selected.semester?.isClosed && (
                          <button
                            disabled={busy}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            onClick={() =>
                              window.confirm('Bỏ ' + c.user.fullName + ' khỏi sự kiện? Gems đã nhận từ sự kiện này sẽ bị thu hồi.') && void run(() => eventsApi.deleteContributor(selected.id, c.userId))
                            }
                            title="Bỏ gán thành viên"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </section>
        </div>
      )}

      {/* MODAL 2: Tạo / Chỉnh Sửa Sự Kiện */}
      {form && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={save}
            className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200 custom-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>{editId ? "Chỉnh Sửa Sự Kiện" : "Tạo Sự Kiện Mới"}</span>
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Sự Kiện *</label>
                <input
                  required
                  placeholder="Ví dụ: Google I/O Extended FPTU HCMC 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại Sự Kiện *</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Gems / Người Đóng Góp *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 font-mono-code"
                    value={form.contributionGems}
                    onChange={(e) =>
                      setForm({ ...form, contributionGems: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa Điểm Tổ Chức *</label>
                <input
                  required
                  placeholder="Ví dụ: Hội trường Edison, ĐH FPT TP.HCM hoặc Google Meet"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời Gian Bắt Đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 font-mono-code"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời Gian Kết Thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 font-mono-code"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Đăng Ký Bevy</label>
                <input
                  type="url"
                  placeholder="https://gdg.community.dev/events/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 font-mono-code"
                  value={form.registrationUrl}
                  onChange={(e) =>
                    setForm({ ...form, registrationUrl: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Tóm Tắt</label>
                <textarea
                  rows={3}
                  placeholder="Mục đích, nội dung chính hoặc diễn giả tham gia sự kiện..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={form.isPublic}
                    onChange={(e) =>
                      setForm({ ...form, isPublic: e.target.checked })
                    }
                  />
                  <span className="font-bold text-slate-800">
                    Hiển thị công khai trên Landing Page
                  </span>
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                disabled={busy}
              >
                {editId ? "Lưu Thay Đổi" : "Tạo Sự Kiện"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
