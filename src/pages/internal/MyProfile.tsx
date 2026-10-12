import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useMemberStore, Member, MemberSocials } from '../../store/useMemberStore';
import { membersApi } from '../../api/members.api';
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
  KeyRound
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

  // Editable Form State
  const [bio, setBio] = useState(currentMember.bio || '');
  const [phone, setPhone] = useState(currentMember.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentMember.avatar || user?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(currentMember.coverUrl || '');
  const [uploadingImage, setUploadingImage] = useState<'avatar' | 'cover' | null>(null);
  const [imageError, setImageError] = useState('');
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const [facebook, setFacebook] = useState(currentMember.socials?.facebook || '');
  const [github, setGithub] = useState(currentMember.socials?.github || '');
  const [linkedin, setLinkedin] = useState(currentMember.socials?.linkedin || '');

  const [skills, setSkills] = useState<string[]>(currentMember.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      setPhone(currentMember.phone || '');
      setAvatarUrl(currentMember.avatar || user?.avatarUrl || '');
      setCoverUrl(currentMember.coverUrl || '');
      setFacebook(currentMember.socials?.facebook || '');
      setGithub(currentMember.socials?.github || '');
      setLinkedin(currentMember.socials?.linkedin || '');
      setSkills(currentMember.skills || []);
    }
  }, [currentMember.id, members.length]);

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
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
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 4000);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Không thể tải ảnh lên.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const socialsData: MemberSocials = {
      facebook: facebook.trim(),
      github: github.trim(),
      linkedin: linkedin.trim()
    };

    const targetUserId = currentMember.id !== 'current' ? currentMember.id : (user?.id || '');

    try {
      await updateSelfProfile(targetUserId, {
        bio: bio.trim(),
        phone: phone.trim(),
        socials: socialsData,
        skills,
      });

      if (user) {
        setUser({
          ...user,
          phone: phone.trim(),
          phoneNumber: phone.trim(),
        });
      }

      setIsSavedToast(true);
      setTimeout(() => {
        setIsSavedToast(false);
      }, 4000);
    } catch (err) {
      console.error('Lỗi khi lưu profile:', err);
      alert(err instanceof Error ? err.message : 'Không thể lưu hồ sơ');
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
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold">Lưu Thành Công!</p>
            <p className="text-[11px] text-slate-300">Thông tin cá nhân và Bio của bạn đã được cập nhật trực tiếp vào hệ thống.</p>
          </div>
        </div>
      )}

      {imageError && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{imageError}</p>}
      <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={Boolean(user?.readOnly) || Boolean(uploadingImage) || isSaving} onChange={e => void handleImageChange('avatar', e)} />
      <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={Boolean(user?.readOnly) || Boolean(uploadingImage) || isSaving} onChange={e => void handleImageChange('cover', e)} />

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden relative">
        {/* Cover Gradient or Image with Google Colors Accent */}
        <div
          className="h-36 sm:h-48 relative overflow-hidden bg-cover bg-center transition-all"
          style={{
            backgroundImage: coverUrl
              ? `url(${coverUrl})`
              : 'linear-gradient(to right, #2563eb, #4f46e5, #9333ea)',
          }}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          <div className="absolute top-4 right-6 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono-code text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{currentMember.gen}</span>
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
            <span className="absolute bottom-3 right-6 px-3 py-1.5 bg-black/60 text-white text-xs font-bold rounded-xl border border-white/30 flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
              <Camera className="w-3.5 h-3.5" />
              {uploadingImage === 'cover' ? 'Đang tải ảnh...' : 'Đổi ảnh bìa'}
            </span>
          </button>}

        </div>

        {/* Profile Lockup Row */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative z-20 pointer-events-none flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-14">
          <div className="flex items-end gap-4 sm:gap-6 pointer-events-auto">
            {/* Avatar with Ring & Upload Overlay */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shrink-0 select-none overflow-hidden">
                {currentAvatar ? (
                  <img src={currentAvatar} alt={currentMember.name} className="w-full h-full object-cover" />
                ) : (
                  currentMember.name.charAt(0)
                )}
              </div>

              {!user?.readOnly && <button
                type="button"
                aria-label="Đổi ảnh đại diện"
                title="Bấm để đổi ảnh đại diện (JPG, PNG, WebP; tối đa 5 MB)"
                disabled={Boolean(uploadingImage) || isSaving}
                onClick={() => avatarInput.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <Camera className="w-6 h-6 mb-0.5" />
                <span className="text-[10px] font-bold">{uploadingImage === 'avatar' ? 'Đang tải...' : 'Đổi avatar'}</span>
              </button>}

            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {currentMember.name}
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : isLead
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {isAdmin ? '👑 Ban Chủ Nhiệm' : isLead ? '⚡ Trưởng Ban' : 'Thành Viên'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                {currentMember.position} • {currentMember.banName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
            <button
              onClick={() => {
                fetchMembers();
                fetchUserStats();
              }}
              disabled={isMembersLoading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Đồng bộ lại thông tin hồ sơ và nhiệm vụ từ server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isMembersLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Đồng bộ</span>
            </button>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
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
              Bạn có thể cập nhật mật khẩu đăng nhập định kỳ hoặc khi cần thiết để bảo vệ tài khoản cá nhân trong GDGoC-OS.
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
                    placeholder="Ví dụ: 0901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-mono-code text-slate-900 focus:outline-none transition-all"
                  />
                </div>
              </div>

            </div>

            {/* 3. MẠNG XÃ HỘI & GITHUB */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-extrabold text-slate-800">
                Mạng Xã Hội & Hồ Sơ Lập Trình
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Facebook */}
                <div className="relative">
                  <Facebook className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="Link Facebook profile"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                {/* GitHub */}
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="Link GitHub profile"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                {/* LinkedIn */}
                <div className="relative">
                  <Linkedin className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="Link LinkedIn profile"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
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
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving || Boolean(uploadingImage) || user?.readOnly}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
              </button>
            </div>
          </form></fieldset>
        </div>
      </div>
    </div>
  );
};
