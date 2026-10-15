import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useMemberStore, Member, MemberSocials } from '../../store/useMemberStore';
import { membersApi } from '../../api/members.api';
import { MyRoleHistory } from '../../components/members/RoleHistory';
import { tasksApi } from '../../api/tasks.api';
import { eventsApi } from '../../api/events.api';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
  Lock,
  Sparkles,
  Globe,
  Github,
  Linkedin,
  Facebook,
  MessageSquare,
  CheckCircle2,
  Edit3,
  Award,
  Tag,
  Plus,
  X,
  Calendar,
  Layers,
  Flame,
  Check,
  Camera,
  RefreshCw,
  KeyRound,
  AlertCircle,
  Loader2
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React', 'TypeScript', 'Google Cloud', 'Python', 'PyTorch',
  'Figma', 'Prompt Engineering', 'Docker', 'Event Organizing',
  'MC & Hosting', 'Video Production', 'Content Writing'
];

export const MyProfile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { members, fetchMembers, updateSelfProfile, isLoading: isMembersLoading } = useMemberStore();

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Find member matching current user session
  const currentMember: Member = members.find(
    m => (user?.id && m.id === user.id) || (user?.email && m.email.toLowerCase() === user.email.toLowerCase())
  ) || {
    id: user?.id || 'current',
    name: user?.name || 'Thành Viên GDG',
    studentId: user?.mssv || '',
    academicYear: '',
    email: user?.email || '',
    phone: user?.phoneNumber || user?.phone || '',
    position: user?.tier === 'ORG_ADMIN' ? 'Ban Chủ Nhiệm' : user?.tier === 'BAN_LEAD' ? 'Trưởng Ban' : 'Thành Viên',
    tier: user?.tier || 'BAN_MEMBER',
    banId: user?.banId || null,
    banName: user?.banName || 'Ban Thành Viên',
    gen: '',
    status: 'ACTIVE',
    joinedDate: '',
    bio: '',
    skills: [],
    socials: {} as MemberSocials,
    gemsBalance: user?.gemsBalance ?? 0
  };

  // Helper functions for validation & data cleaning
  const cleanSkills = (list: string[] = []) =>
    list.filter((s) => !/^GEN/i.test(s.trim()) && !/^K\d+$/i.test(s.trim()));

  const isValidVietnamesePhone = (p: string) => {
    const cleaned = p.replace(/[\s.-]/g, '');
    return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(cleaned);
  };

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Editable Form State
  const [bio, setBio] = useState(currentMember.bio || '');
  const [phone, setPhone] = useState(currentMember.phone === 'Chưa cập nhật' ? '' : (currentMember.phone || ''));
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentMember.avatar || user?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(currentMember.coverUrl || '');
  const [uploadingImage, setUploadingImage] = useState<'avatar' | 'cover' | null>(null);
  const [imageError, setImageError] = useState('');
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const [facebook, setFacebook] = useState(currentMember.socials?.facebook || '');
  const [github, setGithub] = useState(currentMember.socials?.github || '');
  const [linkedin, setLinkedin] = useState(currentMember.socials?.linkedin || '');

  const [skills, setSkills] = useState<string[]>(cleanSkills(currentMember.skills));
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Stats from backend
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [eventsCount, setEventsCount] = useState<number>(0);

  const fetchUserStats = useCallback(async () => {
    try {
      const [tasksRes, eventsRes] = await Promise.allSettled([
        tasksApi.getTasks({ limit: 100, assigneeId: user?.id, semesterId: 'all' }),
        eventsApi.getMyContributionCount(),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value) {
        const raw = tasksRes.value;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        setUserTasks(list);
      } else { setUserTasks([]); }

      if (eventsRes.status === 'fulfilled' && eventsRes.value) {
        setEventsCount(eventsRes.value.count);
      }
    } catch (err) {
      console.warn('[MyProfile] Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  useEffect(() => {
    if (currentMember) {
      setBio(currentMember.bio || '');
      const rawPhone = currentMember.phone === 'Chưa cập nhật' ? '' : (currentMember.phone || '');
      setPhone(rawPhone);
      setAvatarUrl(currentMember.avatar || user?.avatarUrl || '');
      setCoverUrl(currentMember.coverUrl || '');
      setFacebook(currentMember.socials?.facebook || '');
      setGithub(currentMember.socials?.github || '');
      setLinkedin(currentMember.socials?.linkedin || '');
      setSkills(cleanSkills(currentMember.skills));
    }
  }, [currentMember.id, members.length]);

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (/^GEN/i.test(trimmed) || /^K\d+$/i.test(trimmed)) {
      alert('Khóa sinh viên (K) và Thế hệ (Gen) đã được hệ thống quản lý riêng ở phần Thông Tin Định Danh, không cần thêm vào kỹ năng.');
      setNewSkillInput('');
      return;
    }
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleImageChange = async (kind: 'avatar' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || user?.readOnly || uploadingImage || isSaving) return;
    setImageError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setImageError('Chọn ảnh JPG, PNG hoặc WebP, tối đa 5 MB.');
      return;
    }
    setUploadingImage(kind);
    try {
      const { url } = await membersApi.uploadProfileImage(kind, file);
      if (kind === 'avatar') {
        setAvatarUrl(url);
        if (user) setUser({ ...user, avatarUrl: url });
      } else setCoverUrl(url);
      useMemberStore.setState(state => ({ members: state.members.map(member => member.id === user?.id
        ? { ...member, ...(kind === 'avatar' ? { avatar: url } : { coverUrl: url }) } : member) }));
      const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(nowTime);
      setIsSaveSuccess(true);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 4500);
      setTimeout(() => setIsSaveSuccess(false), 3500);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Không thể tải ảnh lên.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setFormError('');

    const phoneTrimmed = phone.trim().replace(/[\s.-]/g, '');
    if (phoneTrimmed && !isValidVietnamesePhone(phoneTrimmed)) {
      setPhoneError('Số điện thoại không hợp lệ (cần đúng 10 số di động Việt Nam, ví dụ: 0901234567 hoặc +84901234567)');
      return;
    }

    const fbTrimmed = facebook.trim();
    const ghTrimmed = github.trim();
    const liTrimmed = linkedin.trim();

    if (fbTrimmed && !isValidUrl(fbTrimmed)) {
      setFormError('Link Facebook không hợp lệ (cần bắt đầu bằng http:// hoặc https://)');
      return;
    }

    if (ghTrimmed && !isValidUrl(ghTrimmed)) {
      setFormError('Link GitHub không hợp lệ (cần bắt đầu bằng http:// hoặc https://)');
      return;
    }

    if (liTrimmed && !isValidUrl(liTrimmed)) {
      setFormError('Link LinkedIn không hợp lệ (cần bắt đầu bằng http:// hoặc https://)');
      return;
    }

    setIsSaving(true);
    setIsSaveSuccess(false);

    const socialsData: MemberSocials = {
      facebook: fbTrimmed,
      github: ghTrimmed,
      linkedin: liTrimmed
    };

    const targetUserId = currentMember.id !== 'current' ? currentMember.id : (user?.id || '');

    try {
      await updateSelfProfile(targetUserId, {
        bio: bio.trim(),
        phone: phoneTrimmed,
        socials: socialsData,
        skills: cleanSkills(skills),
      });

      if (user) {
        setUser({
          ...user,
          phone: phoneTrimmed,
          phoneNumber: phoneTrimmed,
        });
      }

      const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(nowTime);
      setIsSaveSuccess(true);
      setIsSavedToast(true);
      setTimeout(() => {
        setIsSavedToast(false);
      }, 4500);
      setTimeout(() => {
        setIsSaveSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Lỗi khi lưu profile:', err);
      setFormError(err instanceof Error ? err.message : 'Không thể lưu hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const isLead = currentMember.tier === 'BAN_LEAD';
  const isAdmin = currentMember.tier === 'ORG_ADMIN';

  // Calculate completed tasks
  const completedTasksCount = userTasks.filter((t: any) => {
    const isDone = t.status === 'DONE' || t.status === 'done';
    const isAssigned =
      t.assignees?.some((a: any) => a.userId === user?.id || a.user?.id === user?.id) ||
      t.assigneeId === user?.id ||
      t.assigneeIds?.includes(user?.id);
    return isDone && (isAssigned || isAdmin);
  }).length;

  const currentGems = currentMember.gemsBalance ?? user?.gemsBalance ?? 0;
  const currentAvatar = avatarUrl || currentMember.avatar || user?.avatarUrl;

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      {/* Toast Notification */}
      {isSavedToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-950/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3.5 max-w-sm animate-fadeIn">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-white flex items-center gap-1.5">
              <span>Đã Cập Nhật Thành Công!</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60 font-mono-code">
                {lastSavedTime || 'Vừa xong'}
              </span>
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Thông tin cá nhân & bio của bạn đã được cập nhật trực tiếp vào hệ thống.
            </p>
          </div>
        </div>
      )}

      {imageError && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{imageError}</p>}
      <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={Boolean(user?.readOnly) || Boolean(uploadingImage) || isSaving} onChange={e => void handleImageChange('avatar', e)} />
      <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={Boolean(user?.readOnly) || Boolean(uploadingImage) || isSaving} onChange={e => void handleImageChange('cover', e)} />

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        {/* Google 4-color accent strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853]" />

        {/* Cover Gradient or Image with Google Colors Accent */}
        <div
          className="h-44 sm:h-56 relative overflow-hidden bg-cover bg-center transition-all"
          style={{
            backgroundImage: coverUrl
              ? `url(${coverUrl})`
              : 'linear-gradient(to right, #1d4ed8, #4338ca, #6d28d9)',
          }}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          <div className="absolute top-4 right-6 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono-code text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{currentMember.gen || 'GEN 4.0'}</span>
            </span>
          </div>

          {!user?.readOnly && <button
            type="button"
            aria-label="Đổi ảnh bìa"
            title="Bấm để đổi ảnh bìa (JPG, PNG, WebP; tối đa 5 MB)"
            disabled={Boolean(uploadingImage) || isSaving}
            onClick={() => coverInput.current?.click()}
            className="absolute inset-0 z-10 group cursor-pointer focus-visible:outline-4 focus-visible:outline-blue-300 disabled:cursor-wait"
          >
            <span className="absolute bottom-3 right-6 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/30 flex items-center gap-1.5 transition-all shadow-md">
              <Camera className="w-3.5 h-3.5" />
              {uploadingImage === 'cover' ? 'Đang tải ảnh...' : 'Đổi ảnh bìa'}
            </span>
          </button>}

        </div>

        {/* Profile Lockup Row */}
        <div className="px-6 sm:px-8 pb-6 pt-3 relative z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Avatar with Ring & Upload Overlay */}
            <div className="relative group shrink-0 -mt-16 sm:-mt-20">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shrink-0 select-none overflow-hidden">
                {currentAvatar ? (
                  <img src={currentAvatar} alt={currentMember.name} className="w-full h-full object-cover" />
                ) : (
                  currentMember.name.charAt(0)
                )}
              </div>

              {!user?.readOnly && (
                <button
                  type="button"
                  aria-label="Đổi ảnh đại diện"
                  title="Bấm để đổi ảnh đại diện (JPG, PNG, WebP; tối đa 5 MB)"
                  disabled={Boolean(uploadingImage) || isSaving}
                  onClick={() => avatarInput.current?.click()}
                  className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                  <Camera className="w-6 h-6 mb-0.5" />
                  <span className="text-[10px] font-bold">{uploadingImage === 'avatar' ? 'Đang tải...' : 'Đổi avatar'}</span>
                </button>
              )}
            </div>

            <div className="pb-1 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentMember.name}
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  isAdmin
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isLead
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {isAdmin ? '👑 Ban Chủ Nhiệm' : isLead ? '⚡ Trưởng Ban' : 'Thành Viên'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold flex items-center gap-1.5 flex-wrap">
                <span>{currentMember.position || 'Thành Viên'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-bold">
                  {currentMember.banName?.startsWith('Ban')
                    ? currentMember.banName
                    : (currentMember.banName ? `Ban ${currentMember.banName}` : 'Ban Thành Viên')}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 pb-1">
            <button
              type="button"
              onClick={() => {
                fetchMembers();
                fetchUserStats();
              }}
              disabled={isMembersLoading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Đồng bộ lại thông tin hồ sơ và nhiệm vụ từ server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isMembersLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Đồng bộ</span>
            </button>
            <span className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Đang Hoạt Động</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Locked Info & Right Editable Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: LOCKED IDENTITY DETAILS (🔒 BẢO MẬT BỞI BCN) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Thông Tin Định Danh
                </h2>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              ℹ️ Dữ liệu này được xác thực chính thức bởi <strong>Ban Chủ Nhiệm & Ban Nhân Sự</strong> và không thể tự chỉnh sửa. Vui lòng liên hệ BCN nếu có thay đổi.
            </p>

            <div className="space-y-3.5 text-xs">
              {/* MSSV */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Mã Số Sinh Viên (MSSV)</span>
                <span className="font-mono-code font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {currentMember.studentId}
                </span>
              </div>

              {/* Khóa */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Khóa Sinh Viên FPT</span>
                <span className="font-mono-code font-bold text-slate-800">
                  {currentMember.academicYear || 'K20'}
                </span>
              </div>

              {/* Email FPT */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Email FPT Edu</span>
                <span className="font-mono-code text-slate-800 truncate max-w-[200px]" title={currentMember.email}>
                  {currentMember.email}
                </span>
              </div>

              {/* Ban Trực Thuộc */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Ban Trực Thuộc</span>
                <span className="font-bold text-blue-700">
                  {currentMember.banName}
                </span>
              </div>

              {/* Khóa Gen */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Khóa Gen Tham Gia</span>
                <span className="font-bold text-purple-700 font-mono-code">
                  {currentMember.gen}
                </span>
              </div>

              {/* Ngày gia nhập */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Ngày Gia Nhập CLB</span>
                <span className="font-mono-code text-slate-700">
                  {currentMember.joinedDate || '15/09/2024'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-md space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>Thành Tích & Đóng Góp</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
                <p className="text-lg font-extrabold text-yellow-400">{currentGems}</p>
                <p className="text-[10px] text-slate-300 uppercase font-mono-code mt-0.5">Gems 💎</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
                <p className="text-lg font-extrabold text-emerald-400">{completedTasksCount}</p>
                <p className="text-[10px] text-slate-300 uppercase font-mono-code mt-0.5">Tasks Xong</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
                <p className="text-lg font-extrabold text-blue-400">{eventsCount}</p>
                <p className="text-[10px] text-slate-300 uppercase font-mono-code mt-0.5">Events CLB</p>
              </div>
            </div>
          </div>

          {/* Security & Password Action */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bảo Mật & Mật Khẩu
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có thể cập nhật mật khẩu đăng nhập định kỳ hoặc khi cần thiết để bảo vệ tài khoản cá nhân trong GDGoC FPTU OS.
            </p>
            <Link
              to="/app/change-password"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-200 font-bold text-xs transition-all duration-200 group"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
              <span>Đổi Mật Khẩu Tài Khoản</span>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: EDITABLE PERSONAL DETAILS (✏️ THÀNH VIÊN TỰ SỬA) */}
        <div className="lg:col-span-7">
          <fieldset disabled={Boolean(user?.readOnly)}><form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Thông Tin Cá Nhân & Liên Hệ
                </h2>
              </div>
            </div>

            {/* Form Error Banner */}
            {formError && (
              <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <span className="font-bold shrink-0">⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            {/* 1. BIO / GIỚI THIỆU BẢN THÂN */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800">
                  Tiểu Sử & Châm Ngôn (Bio)
                </label>
                <span className="text-[11px] font-mono-code text-slate-400">
                  {bio.length} / 300 ký tự
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Giới thiệu đôi nét về bản thân, sở thích công nghệ, mục tiêu học tập hoặc đóng góp của bạn cho GDG on Campus..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none transition-all resize-none leading-relaxed font-normal"
              />
            </div>

            {/* 2. SỐ ĐIỆN THOẠI & UPLOAD AVATAR / ẢNH BÌA */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800">
                  Số Điện Thoại Liên Hệ (Zalo / Call)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0901234567 (có thể để trống)"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                      if (formError) setFormError('');
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border ${
                      phoneError ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-500'
                    } rounded-xl text-xs sm:text-sm font-mono-code text-slate-900 focus:outline-none transition-all`}
                  />
                </div>
                {phoneError ? (
                  <p className="text-[11px] text-red-600 font-medium">
                    ⚠️ {phoneError}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Định dạng: 10 chữ số di động Việt Nam (đầu số 03, 05, 07, 08, 09 hoặc +84). Có thể để trống nếu chưa muốn chia sẻ.
                  </p>
                )}
              </div>
            </div>

            {/* 3. MẠNG XÃ HỘI & GITHUB */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800">
                  Mạng Xã Hội & Hồ Sơ Lập Trình
                </label>
                <span className="text-[11px] text-slate-400 font-medium">(Tất cả đường dẫn đều tùy chọn, có thể để trống)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Facebook */}
                <div className="relative">
                  <Facebook className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={facebook}
                    onChange={(e) => {
                      setFacebook(e.target.value);
                      if (formError) setFormError('');
                    }}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                {/* GitHub */}
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={github}
                    onChange={(e) => {
                      setGithub(e.target.value);
                      if (formError) setFormError('');
                    }}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                {/* LinkedIn */}
                <div className="relative">
                  <Linkedin className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedin}
                    onChange={(e) => {
                      setLinkedin(e.target.value);
                      if (formError) setFormError('');
                    }}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. KỸ NĂNG & THẾ MẠNH (INTERACTIVE CHIPS) */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-extrabold text-slate-800">
                Kỹ Năng & Thế Mạnh (Skills / Specialties)
              </label>

              {/* Existing Chips */}
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 rounded-xl bg-slate-50 border border-slate-200">
                {skills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic py-1 px-1">
                    Chưa có kỹ năng nào. Thêm các kỹ năng bên dưới để đồng đội dễ tìm kiếm bạn!
                  </span>
                ) : (
                  skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-fadeIn"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-red-600 transition-colors p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Custom Skill Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Gõ kỹ năng mới (ví dụ: Next.js, PyTorch, Figma, MC)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(newSkillInput);
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkillInput)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Gợi ý nhanh:</span>
                {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 6).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-h-[36px] w-full sm:w-auto">
                {isSaving && (
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span>Đang cập nhật hồ sơ vào hệ thống...</span>
                  </div>
                )}
                {isSaveSuccess && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl shadow-2xs animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đã cập nhật hồ sơ thành công lúc {lastSavedTime}!</span>
                  </div>
                )}
                {formError && !isSaving && (
                  <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                {!isSaving && !isSaveSuccess && !formError && (
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    Lưu các thông tin trên để cập nhật vào hệ thống GDGoC.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving || Boolean(uploadingImage) || user?.readOnly}
                className={`w-full sm:w-auto px-6 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md ${
                  isSaveSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50 scale-[1.02]'
                    : isSaving
                    ? 'bg-blue-700 text-white shadow-blue-700/30 cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:scale-[1.01]'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : isSaveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Đã Lưu Thay Đổi!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Lưu Thay Đổi Hồ Sơ</span>
                  </>
                )}
              </button>
            </div>
          </form></fieldset>
        </div>
      </div>
      {user?.id && <MyRoleHistory id={user.id} />}
    </div>
  );
};
