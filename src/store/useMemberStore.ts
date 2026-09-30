/**
 * @file useMemberStore.ts
 * @description Zustand store quản lý danh sách thành viên CLB kết nối API Backend thật.
 */

import { create } from 'zustand';
import { Tier, BanId, BAN_NAMES, BAN_ID_TO_DEPT_CODE, DEPT_CODE_TO_BAN_ID } from '../types/auth.types';
import { membersApi, generationApi } from '../api';

// ==========================================
// TYPES
// ==========================================

export interface MemberSocials {
  facebook?: string;
  github?: string;
  linkedin?: string;
  discord?: string;
}

export interface Member {
  id: string;
  name: string;              // Họ và tên
  studentId: string;         // MSSV (ví dụ: SE180123)
  academicYear: string;      // Khóa đại học tự động tính từ MSSV: K18, K19, K20, K21, K22
  email: string;             // Email FPT
  phone: string;             // Số điện thoại
  position: string;          // Chức danh (ví dụ: 'Chapter Lead', 'AI Lead', 'Cloud Member')
  tier: Tier;                // Cấp bậc: ADVISOR | ORG_ADMIN | BAN_LEAD | BAN_MEMBER | COLLABORATOR
  banId: BanId | null;       // Ban trực thuộc
  banName: string;           // Tên ban đầy đủ
  gen: string;               // Kỳ hoạt động: 'Gen 4.0', 'Gen 3.5', v.v.
  tenureId?: string;         // ID nhiệm kỳ (UUID từ BE)
  status: 'ACTIVE' | 'ALUMNI' | 'ON_LEAVE' | 'PROBATION';
  joinedDate: string;        // dd/MM/yyyy

  // Dữ liệu cá nhân (thành viên tự cập nhật)
  bio?: string;
  avatar?: string;
  socials?: MemberSocials;
  skills?: string[];
}

export interface ExcelImportRow {
  'Họ và tên'?: string;
  'MSSV'?: string;
  'Email'?: string;
  'Số điện thoại'?: string;
  'Ban'?: string;
  'Ban Chuyên Môn'?: string;
  'Vai Trò'?: string;
  'Position'?: string;
}

// ==========================================
// MAPPERS
// ==========================================

export function mapBackendMemberToUi(item: any): Member {
  // Lấy tenure active hoặc tenure đầu tiên
  const tenureRecord =
    item.tenure ||
    (Array.isArray(item.tenures) ? item.tenures.find((t: any) => t.status === 'ACTIVE') || item.tenures[0] : null);

  const role = tenureRecord?.role || item.role || 'MEMBER';
  let tier: Tier = 'BAN_MEMBER';
  if (role === 'LEAD') tier = 'ORG_ADMIN';
  else if (role === 'ADVISOR') tier = 'ADVISOR';
  else if (role === 'DEPARTMENT_LEAD') tier = 'BAN_LEAD';
  else if (role === 'COLLABORATOR') tier = 'COLLABORATOR';

  const deptCode = tenureRecord?.department?.code || tenureRecord?.departmentCode || item.departmentCode;
  let banId: BanId | null = null;
  if (deptCode && DEPT_CODE_TO_BAN_ID[deptCode]) {
    banId = DEPT_CODE_TO_BAN_ID[deptCode];
  }

  // Tự động suy luận Khóa sinh viên từ MSSV (vd: SE180123 -> K18, SE200456 -> K20)
  const mssvMatch = (item.mssv || '').match(/^(?:SE|SS|IA|IB|GD|CS|IT|HE)?(\d{2})/i);
  const academicYear = mssvMatch ? `K${mssvMatch[1]}` : 'K20';

  const genLabel =
    tenureRecord?.tenure?.genLabel ||
    tenureRecord?.genLabel ||
    tenureRecord?.tenure?.name ||
    tenureRecord?.tenureName ||
    tenureRecord?.name ||
    '';

  const deptName =
    tenureRecord?.department?.name ||
    tenureRecord?.departmentName ||
    (banId ? BAN_NAMES[banId] : tier === 'ORG_ADMIN' ? 'Ban Chủ Nhiệm' : tier === 'ADVISOR' ? 'Ban Cố Vấn' : 'Thành Viên GDG');

  return {
    id: item.id,
    name: item.fullName || item.name || item.email,
    studentId: item.mssv || 'CHƯA CẬP NHẬT',
    academicYear,
    email: item.email,
    phone: item.phoneNumber || '',
    position: tenureRecord?.position || item.position || (tier === 'ORG_ADMIN' ? 'Chapter Lead' : tier === 'ADVISOR' ? 'Cố Vấn CLB' : tier === 'BAN_LEAD' ? 'Trưởng Ban' : tier === 'COLLABORATOR' ? 'Cộng Tác Viên' : 'Thành Viên'),
    tier,
    banId,
    banName: deptName,
    gen: genLabel,
    tenureId: tenureRecord?.tenureId || tenureRecord?.id,
    status: tenureRecord?.status || 'ACTIVE',
    joinedDate: tenureRecord?.joinedAt
      ? new Date(tenureRecord.joinedAt).toLocaleDateString('vi-VN')
      : new Date().toLocaleDateString('vi-VN'),
    bio: item.bio || '',
    avatar: item.avatarUrl || '',
    skills: item.skills || [],
    socials: {
      github: item.githubUrl,
      facebook: item.facebookUrl,
      linkedin: item.linkedinUrl,
      discord: item.discordUsername,
    },
  };
}

export function mapUiToDepartmentCode(banId: BanId | null, tier: Tier): string {
  if (tier === 'ORG_ADMIN' || !banId) return 'EXECUTIVE';
  return BAN_ID_TO_DEPT_CODE[banId] || 'TECH_WEB';
}

export function mapUiToBackendRole(tier: Tier): string {
  if (tier === 'ORG_ADMIN') return 'LEAD';
  if (tier === 'ADVISOR') return 'ADVISOR';
  if (tier === 'BAN_LEAD') return 'DEPARTMENT_LEAD';
  if (tier === 'COLLABORATOR') return 'COLLABORATOR';
  return 'MEMBER';
}

// ==========================================
// STATE INTERFACE
// ==========================================

export interface TenureOption {
  id: string;
  name: string;
  genLabel: string;
}

interface MemberState {
  members: Member[];
  activeTenureId: string | null;
  activeGenLabel: string;
  availableTenures: TenureOption[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
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
  importFromExcelFile: (file: File) => Promise<{ added: number; errors: string[] }>;
  getMemberById: (id: string) => Member | undefined;
  getMemberByEmail: (email: string) => Member | undefined;
  getAvailableGens: () => string[];
}

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  activeTenureId: null,
  activeGenLabel: '',
  availableTenures: [],
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const [membersRes, genConfigRes] = await Promise.allSettled([
        membersApi.getMembers({ limit: 100 }),
        generationApi.getGenerationConfig(),
      ]);

      let mappedMembers: Member[] = [];
      if (membersRes.status === 'fulfilled') {
        const items = (membersRes.value as any)?.items || (Array.isArray(membersRes.value) ? membersRes.value : []);
        mappedMembers = items.map(mapBackendMemberToUi);
      }

      let activeTenureId: string | null = null;
      let activeGenLabel = '';
      const availableTenures: TenureOption[] = [];

      if (genConfigRes.status === 'fulfilled') {
        const genData: any = genConfigRes.value;
        const current = genData?.currentTenure;
        if (current) {
          activeTenureId = current.id;
          activeGenLabel = current.genLabel || current.name || '';
          availableTenures.push({
            id: current.id,
            name: current.name,
            genLabel: current.genLabel || current.name,
          });
        }
        const archives = genData?.archivedTenures || [];
        archives.forEach((a: any) => {
          availableTenures.push({
            id: a.id,
            name: a.name,
            genLabel: a.genLabel || a.name,
          });
        });
      }

      set({
        members: mappedMembers,
        activeTenureId,
        activeGenLabel: activeGenLabel || (mappedMembers[0]?.gen || ''),
        availableTenures,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('[MemberStore] Failed to fetch members:', err);
      set({ error: err.message || 'Không thể tải danh sách thành viên', isLoading: false });
    }
  },

  addMember: async (memberData) => {
    try {
      const deptCode = mapUiToDepartmentCode(memberData.banId, memberData.tier);
      const role = mapUiToBackendRole(memberData.tier);

      let targetTenureId = memberData.tenureId;
      if (!targetTenureId) {
        const matchingTenure = get().availableTenures.find(
          (t) => t.genLabel === memberData.gen || t.name === memberData.gen
        );
        targetTenureId = matchingTenure?.id || get().activeTenureId || undefined;
      }

      await membersApi.createMember({
        mssv: memberData.studentId,
        fullName: memberData.name,
        email: memberData.email,
        phoneNumber: memberData.phone,
        departmentCode: deptCode,
        role,
        position: memberData.position,
        tenureId: targetTenureId,
      });

      await get().fetchMembers();
    } catch (err: any) {
      console.error('[MemberStore] Failed to create member:', err);
      throw err;
    }
  },

  updateMember: async (id, updates) => {
    try {
      const dto: any = {};
      if (updates.name !== undefined) dto.fullName = updates.name;
      if (updates.studentId !== undefined) dto.mssv = updates.studentId;
      if (updates.email !== undefined) dto.email = updates.email;
      if (updates.phone !== undefined) dto.phoneNumber = updates.phone;
      if (updates.position !== undefined) dto.position = updates.position;
      if (updates.status !== undefined) dto.status = updates.status;
      if (updates.tier !== undefined) dto.role = mapUiToBackendRole(updates.tier);
      if (updates.banId !== undefined || updates.tier !== undefined) {
        dto.departmentCode = mapUiToDepartmentCode(updates.banId ?? null, updates.tier ?? 'BAN_MEMBER');
      }

      if (updates.tenureId) {
        dto.tenureId = updates.tenureId;
      } else if (updates.gen) {
        const matchingTenure = get().availableTenures.find(
          (t) => t.genLabel === updates.gen || t.name === updates.gen
        );
        if (matchingTenure) {
          dto.tenureId = matchingTenure.id;
        }
      }

      await membersApi.updateMember(id, dto);
      await get().fetchMembers();
    } catch (err: any) {
      console.error('[MemberStore] Failed to update member:', err);
      throw err;
    }
  },

  deleteMember: async (id) => {
    try {
      await membersApi.deleteMember(id);
      await get().fetchMembers();
    } catch (err: any) {
      console.error('[MemberStore] Failed to delete member:', err);
      throw err;
    }
  },

  updateSelfProfile: async (id, profile) => {
    try {
      const sanitize = (val?: string) => (val && val.trim().length > 0 ? val.trim() : undefined);

      await membersApi.updateProfile(id, {
        bio: sanitize(profile.bio),
        phoneNumber: sanitize(profile.phone),
        avatarUrl: sanitize(profile.avatar),
        skills: profile.skills && profile.skills.length > 0 ? profile.skills : undefined,
        githubUrl: sanitize(profile.socials?.github),
        facebookUrl: sanitize(profile.socials?.facebook),
        linkedinUrl: sanitize(profile.socials?.linkedin),
        discordUsername: sanitize(profile.socials?.discord),
      });
      await get().fetchMembers();
    } catch (err: any) {
      console.error('[MemberStore] Failed to update profile:', err);
      throw err;
    }
  },

  importFromExcelFile: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (get().activeTenureId) {
        formData.append('tenureId', get().activeTenureId!);
      }
      const res: any = await membersApi.importMembers(formData);
      await get().fetchMembers();
      return {
        added: res.added ?? res.successCount ?? res.importedCount ?? res.totalImported ?? 0,
        errors: res.errors || [],
      };
    } catch (err: any) {
      console.error('[MemberStore] Failed to import excel:', err);
      throw err;
    }
  },

  getMemberById: (id) => get().members.find((m) => m.id === id),

  getMemberByEmail: (email) => {
    if (!email) return undefined;
    return get().members.find((m) => m.email.toLowerCase() === email.toLowerCase());
  },

  getAvailableGens: () => {
    const genSet = new Set<string>();
    get().availableTenures.forEach((t) => {
      if (t.genLabel) genSet.add(t.genLabel);
      if (t.name) genSet.add(t.name);
    });
    get().members.forEach((m) => {
      if (m.gen) genSet.add(m.gen);
    });
    if (get().activeGenLabel) {
      genSet.add(get().activeGenLabel);
    }

    return Array.from(genSet).filter(Boolean).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^\d.]/g, '')) || 0;
      return numB - numA;
    });
  },
}));
