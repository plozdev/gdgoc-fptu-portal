/**
 * @file useMemberStore.ts
 * @description Zustand store quản lý danh sách thành viên CLB.
 * 
 * Dữ liệu được fetch trực tiếp từ API backend (GET /api/members).
 * Chỉ cập nhật trạng thái sau khi backend lưu thành công.
 */

import { create } from 'zustand';
import { Tier, BanId, BAN_NAMES } from '../types/auth';
import { membersApi, QueryMembersParams } from '../api/members.api';

// ==========================================
// TYPES
// ==========================================

export interface MemberSocials {
  facebook?: string;
  github?: string;
  linkedin?: string;
}

export interface Member {
  id: string;
  name: string;              // Họ và tên
  studentId: string;         // MSSV (ví dụ: SE180123)
  academicYear: string;      // Khóa đại học: K19, K20, K21, K22
  email: string;             // Email FPT
  phone: string;             // Số điện thoại
  position: string;          // Chức danh (ví dụ: 'Chapter Lead', 'AI Lead', 'Cloud Member')
  tier: Tier;                // Cấp bậc: ADVISOR | ORG_ADMIN | BAN_LEAD | BAN_MEMBER
  banId: BanId | null;       // Ban trực thuộc
  banName: string;           // Tên ban đầy đủ
  gen: string;               // Kỳ hoạt động: 'GEN 2.0', 'GEN 2.1', 'GEN 3.0', 'Gen 4.0'
  status: 'ACTIVE' | 'PROBATION' | 'ALUMNI' | 'ON_LEAVE';
  joinedDate: string;        // dd/MM/yyyy

  // Dữ liệu cá nhân
  bio?: string;
  avatar?: string;
  coverUrl?: string;
  socials?: MemberSocials;
  skills?: string[];
  gemsBalance?: number;
}

export interface ExcelImportRow {
  'Họ và tên'?: string;
  'Khóa'?: string;
  'MSSV'?: string;
  'Email'?: string;
  'Số điện thoại'?: string;
  'Position'?: string;
}

// ==========================================
// STATE INTERFACE
// ==========================================

interface MemberState {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: (params?: QueryMembersParams) => Promise<void>;
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  updateSelfProfile: (id: string, profile: {
    bio?: string;
    phone?: string;
    socials?: MemberSocials;
    skills?: string[];
    avatar?: string;
  }) => Promise<void>;
  getMemberById: (id: string) => Member | undefined;
  getMemberByEmail: (email: string) => Member | undefined;
  getAvailableGens: () => string[];
}

// ==========================================
// STORAGE
// ==========================================



// ==========================================
// HELPERS — Derive tier/ban from position string
// ==========================================

export function deriveTierAndBan(position: string): { tier: Tier; banId: BanId | null; banName: string } {
  const posLower = (position || '').toLowerCase();

  if (posLower.includes('advisor') || posLower.includes('cố vấn')) {
    return { tier: 'ADVISOR', banId: null, banName: 'Cố Vấn CLB' };
  }
  if (posLower.includes('chapter lead') || posLower.includes('chủ nhiệm') || posLower.includes('bcn')) {
    return { tier: 'ORG_ADMIN', banId: null, banName: 'Ban Chủ Nhiệm' };
  }
  if (posLower.includes('ai') || posLower.includes('trí tuệ')) {
    return { tier: posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER', banId: 'ai', banName: BAN_NAMES['ai'] };
  }
  if (posLower.includes('cloud') || posLower.includes('đám mây')) {
    return { tier: posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER', banId: 'cloud', banName: BAN_NAMES['cloud'] };
  }
  if (posLower.includes('web') || posLower.includes('frontend') || posLower.includes('backend')) {
    return { tier: posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER', banId: 'web', banName: BAN_NAMES['web'] };
  }
  if (posLower.includes('research') || posLower.includes('nghiên cứu')) {
    return { tier: posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER', banId: 'research', banName: BAN_NAMES['research'] };
  }
  if (posLower.includes('media') || posLower.includes('truyền thông')) {
    return { tier: posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER', banId: 'media', banName: BAN_NAMES['media'] };
  }
  if (posLower.includes('hr') || posLower.includes('nhân sự') || posLower.includes('event')) {
    return { tier: posLower.includes('lead') ? 'BAN_LEAD' : 'BAN_MEMBER', banId: 'hr-event', banName: BAN_NAMES['hr-event'] };
  }

  // Default fallback
  return { tier: 'BAN_MEMBER', banId: null, banName: 'Ban Chủ Nhiệm / Thành Viên' };
}

export function mapBackendMemberToMember(raw: any): Member {
  const role = raw.tenure?.role;
  let tier: Tier = 'BAN_MEMBER';
  if (role === 'ADVISOR') {
    tier = 'ADVISOR';
  } else if (role === 'LEAD' || role === 'ADMIN') {
    tier = 'ORG_ADMIN';
  } else if (role === 'DEPARTMENT_LEAD') {
    tier = 'BAN_LEAD';
  }

  const deptCode = raw.tenure?.departmentCode;
  const deptMap: Record<string, { banId: BanId | null; banName: string }> = {
    TECH_AI: { banId: 'ai', banName: BAN_NAMES['ai'] },
    TECH_CLOUD: { banId: 'cloud', banName: BAN_NAMES['cloud'] },
    TECH_WEB: { banId: 'web', banName: BAN_NAMES['web'] },
    TECH_RESEARCH: { banId: 'research', banName: BAN_NAMES['research'] },
    MEDIA: { banId: 'media', banName: BAN_NAMES['media'] },
    HR_EVENT: { banId: 'hr-event', banName: BAN_NAMES['hr-event'] },
    EXECUTIVE: { banId: null, banName: 'Ban Chủ Nhiệm' },
  };

  const derived = deriveTierAndBan(raw.tenure?.position || raw.position || '');
  const banInfo = deptCode && deptMap[deptCode] ? deptMap[deptCode] : derived;

  // Extract academicYear: e.g. K21
  let academicYear = raw.academicYear;
  if (!academicYear) {
    const kSkill = raw.skills?.find((s: string) => /^K\d+$/i.test(s));
    if (kSkill) {
      academicYear = kSkill;
    } else {
      const match = (raw.mssv || '').match(/^[A-Za-z]+(\d{2})/);
      academicYear = match ? `K${match[1]}` : ''; 
    }
  }

  // Extract gen: e.g. GEN 2.1
  let gen = raw.gen;
  if (!gen) {
    const genSkill = raw.skills?.find((s: string) => /^GEN/i.test(s));
    gen = genSkill || raw.tenure?.genLabel || '';
  }

  // Joined date: dd/MM/yyyy
  let joinedDate = 'Chưa cập nhật';
  if (raw.tenure?.joinedAt) {
    const d = new Date(raw.tenure.joinedAt);
    if (!isNaN(d.getTime())) {
      joinedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
  }

  const socials: MemberSocials = raw.socials || {
    facebook: raw.facebookUrl || '',
    github: raw.githubUrl || '',
    linkedin: raw.linkedinUrl || '',
  };

  return {
    id: raw.id,
    name: raw.fullName || raw.name,
    studentId: raw.mssv || raw.studentId,
    academicYear,
    email: raw.email,
    phone: raw.phoneNumber || raw.phone || 'Chưa cập nhật',
    position: raw.tenure?.position || raw.position || 'Thành Viên',
    tier: raw.tier || tier,
    banId: banInfo.banId,
    banName: banInfo.banName,
    gen,
    status: raw.tenure?.status || raw.status || 'ACTIVE',
    joinedDate,
    bio: raw.bio || '',
    avatar: raw.avatarUrl || raw.avatar,
    coverUrl: raw.coverUrl || undefined,
    socials,
    skills: (raw.skills || []).filter(
      (s: string) => !/^GEN/i.test(s.trim()) && !/^K\d+$/i.test(s.trim())
    ),
    gemsBalance: raw.gemsBalance ?? raw.user?.gemsBalance ?? 0,
  };
}

// ==========================================
// STORE
// ==========================================

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async (params?: QueryMembersParams) => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await membersApi.getMembers({ limit: 100, ...params });
      const rawList = res.items || res.data?.items || (Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : []);
      const mapped = rawList.map(mapBackendMemberToMember);
      set({ members: mapped, isLoading: false });
    } catch (err: any) {
      console.error('[MemberStore] Failed to fetch members from API:', err);
      set({ error: err.message || 'Lỗi tải danh sách thành viên', isLoading: false });
    }
  },

  addMember: async (memberData) => {
    try {
      const deptCodeMap: Record<string, string> = {
        ai: 'TECH_AI',
        cloud: 'TECH_CLOUD',
        web: 'TECH_WEB',
        research: 'TECH_RESEARCH',
        media: 'MEDIA',
        'hr-event': 'HR_EVENT',
      };
      const deptCode = memberData.banId ? deptCodeMap[memberData.banId] || 'EXECUTIVE' : 'EXECUTIVE';

      const roleMap: Record<Tier, string> = {
        ORG_ADMIN: 'LEAD',
        ADVISOR: 'ADVISOR',
        BAN_LEAD: 'DEPARTMENT_LEAD',
        BAN_MEMBER: 'MEMBER',
      };

      const res: any = await membersApi.createMember({
        mssv: memberData.studentId,
        fullName: memberData.name,
        email: memberData.email,
        phoneNumber: memberData.phone,
        departmentCode: deptCode,
        role: roleMap[memberData.tier] || 'MEMBER',
        position: memberData.position,
        academicYear: memberData.academicYear,
        gen: memberData.gen,
        status: memberData.status,
      });

      if (!res?.id) throw new Error('Backend không trả về ID thành viên.');
      const newMember = mapBackendMemberToMember(res);

      set((state) => {
        const updated = [newMember, ...state.members.filter((m) => m.id !== newMember.id)];
          return { members: updated };
      });
    } catch (error) {
      console.error('[MemberStore] Failed to create member on backend:', error);
      throw error;
    }
  },

  updateMember: async (id, updates) => {
    try {
      const deptCodeMap: Record<string, string> = {
        ai: 'TECH_AI',
        cloud: 'TECH_CLOUD',
        web: 'TECH_WEB',
        research: 'TECH_RESEARCH',
        media: 'MEDIA',
        'hr-event': 'HR_EVENT',
      };
      const roleMap: Record<Tier, string> = {
        ORG_ADMIN: 'LEAD',
        ADVISOR: 'ADVISOR',
        BAN_LEAD: 'DEPARTMENT_LEAD',
        BAN_MEMBER: 'MEMBER',
      };

      const saved: any = await membersApi.updateMember(id, {
        academicYear: updates.academicYear,
        gen: updates.gen,
        fullName: updates.name, mssv: updates.studentId, email: updates.email,
        position: updates.position,
        status: updates.status,
        departmentCode: updates.banId === null ? 'EXECUTIVE' : updates.banId ? deptCodeMap[updates.banId] : undefined,
        role: updates.tier ? roleMap[updates.tier] : undefined,
      });
      set((state) => ({ members: state.members.map((member) => member.id === id ? mapBackendMemberToMember(saved) : member) }));
    } catch (error) { throw error; }
  },

  deleteMember: async (id) => {
    try {
      await membersApi.deleteMember(id);
    } catch (error) {
      throw error;
    }

    set((state) => {
      const updated = state.members.filter((m) => m.id !== id);
      return { members: updated };
    });
  },

  updateSelfProfile: async (id, profile) => {
    const cleanSkills = profile.skills
      ? profile.skills.filter((s: string) => !/^GEN/i.test(s.trim()) && !/^K\d+$/i.test(s.trim()))
      : undefined;

    try {
      await membersApi.updateProfile(id, {
        bio: profile.bio,
        phoneNumber: profile.phone !== undefined ? (profile.phone.trim() ? profile.phone.trim() : null) : undefined,
        skills: cleanSkills,
        facebookUrl: profile.socials?.facebook !== undefined ? (profile.socials.facebook.trim() ? profile.socials.facebook.trim() : null) : undefined,
        githubUrl: profile.socials?.github !== undefined ? (profile.socials.github.trim() ? profile.socials.github.trim() : null) : undefined,
        linkedinUrl: profile.socials?.linkedin !== undefined ? (profile.socials.linkedin.trim() ? profile.socials.linkedin.trim() : null) : undefined,
        avatarUrl: profile.avatar !== undefined ? (profile.avatar.trim() ? profile.avatar.trim() : null) : undefined,
      });
    } catch (error) {
      throw error;
    }

    set((state) => {
      const updated = state.members.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          ...(profile.bio !== undefined && { bio: profile.bio }),
          ...(profile.phone !== undefined && { phone: profile.phone.trim() }),
          ...(profile.socials !== undefined && { socials: { ...m.socials, ...profile.socials } }),
          ...(profile.skills !== undefined && { skills: cleanSkills || [] }),
          ...(profile.avatar !== undefined && { avatar: profile.avatar }),
        };
      });
      return { members: updated };
    });
  },

  getMemberById: (id) => get().members.find((m) => m.id === id),

  getMemberByEmail: (email) => {
    if (!email) return undefined;
    return get().members.find((m) => m.email.toLowerCase() === email.toLowerCase());
  },

  getAvailableGens: () => {
    const genSet = new Set(get().members.map((m) => m.gen).filter(Boolean));

    return Array.from(genSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^\d.]/g, '')) || 0;
      return numB - numA;
    });
  },
}));
