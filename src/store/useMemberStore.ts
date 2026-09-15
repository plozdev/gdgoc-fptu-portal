/**
 * @file useMemberStore.ts
 * @description Zustand store quản lý danh sách thành viên CLB.
 * 
 * ⚠️  MOCK DATA ĐÃ BỊ XÓA — Store bắt đầu với danh sách rỗng.
 * Khi backend được tích hợp, data sẽ được fetch từ GET /api/members.
 * localStorage chỉ dùng để cache local, không phải nguồn dữ liệu chính.
 */

import { create } from 'zustand';
import { Tier, BanId, BAN_NAMES } from '../mocks/fixtures/users';

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
  academicYear: string;      // Khóa đại học: K19, K20, K21, K22
  email: string;             // Email FPT
  phone: string;             // Số điện thoại
  position: string;          // Chức danh (ví dụ: 'Chapter Lead', 'AI Lead', 'Cloud Member')
  tier: Tier;                // Cấp bậc: ADVISOR | ORG_ADMIN | BAN_LEAD | BAN_MEMBER
  banId: BanId | null;       // Ban trực thuộc
  banName: string;           // Tên ban đầy đủ
  gen: string;               // Kỳ hoạt động: 'Gen 4.0', 'Gen 3.5', v.v.
  status: 'ACTIVE' | 'ALUMNI' | 'ON_LEAVE';
  joinedDate: string;        // dd/MM/yyyy

  // Dữ liệu cá nhân (thành viên tự cập nhật)
  bio?: string;
  avatar?: string;
  socials?: MemberSocials;
  skills?: string[];
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
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  updateSelfProfile: (id: string, profile: {
    bio?: string;
    phone?: string;
    socials?: MemberSocials;
    skills?: string[];
    avatar?: string;
  }) => void;
  importFromExcel: (rows: ExcelImportRow[], defaultGen: string) => { added: number; errors: string[] };
  getMemberById: (id: string) => Member | undefined;
  getMemberByEmail: (email: string) => Member | undefined;
  getAvailableGens: () => string[];
}

// ==========================================
// STORAGE
// ==========================================

const STORAGE_KEY = 'gdgoc_members_directory_v1';

const loadMembersFromStorage = (): Member[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: unknown = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Member[];
      }
    }
  } catch (error) {
    console.error('[MemberStore] Failed to load members from localStorage:', error);
  }
  return [];
};

const saveToStorage = (members: Member[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (error) {
    console.error('[MemberStore] Failed to save members to localStorage:', error);
  }
};

// ==========================================
// HELPERS — Derive tier/ban from position string
// ==========================================

function deriveTierAndBan(position: string): { tier: Tier; banId: BanId | null; banName: string } {
  const posLower = position.toLowerCase();

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
  return { tier: 'BAN_MEMBER', banId: null, banName: 'Ban Thành Viên' };
}

// ==========================================
// STORE
// ==========================================

export const useMemberStore = create<MemberState>((set, get) => ({
  members: loadMembersFromStorage(),

  addMember: (memberData) => {
    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now()}`,
    };
    set((state) => {
      const updated = [newMember, ...state.members];
      saveToStorage(updated);
      return { members: updated };
    });
  },

  updateMember: (id, updates) => {
    set((state) => {
      const updated = state.members.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      saveToStorage(updated);
      return { members: updated };
    });
  },

  deleteMember: (id) => {
    set((state) => {
      const updated = state.members.filter((m) => m.id !== id);
      saveToStorage(updated);
      return { members: updated };
    });
  },

  updateSelfProfile: (id, profile) => {
    set((state) => {
      const updated = state.members.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          ...(profile.bio !== undefined && { bio: profile.bio }),
          ...(profile.phone !== undefined && { phone: profile.phone }),
          ...(profile.socials !== undefined && { socials: { ...m.socials, ...profile.socials } }),
          ...(profile.skills !== undefined && { skills: profile.skills }),
          ...(profile.avatar !== undefined && { avatar: profile.avatar }),
        };
      });
      saveToStorage(updated);
      return { members: updated };
    });
  },

  importFromExcel: (rows, defaultGen) => {
    const errors: string[] = [];
    const newMembers: Member[] = [];
    const currentMembers = get().members;

    rows.forEach((row, index) => {
      const rowNum = index + 2; // 1-indexed, row 1 = header
      const name = (row['Họ và tên'] ?? '').trim();
      const studentId = (row['MSSV'] ?? '').trim().toUpperCase();
      const email = (row['Email'] ?? '').trim().toLowerCase();
      const academicYear = (row['Khóa'] ?? 'K20').trim().toUpperCase();
      const phone = (row['Số điện thoại'] ?? '').trim();
      const position = (row['Position'] ?? 'Thành Viên').trim();

      if (!name) {
        errors.push(`Dòng ${rowNum}: Thiếu Họ và tên`);
        return;
      }
      if (!studentId) {
        errors.push(`Dòng ${rowNum} (${name}): Thiếu MSSV`);
        return;
      }
      if (!email) {
        errors.push(`Dòng ${rowNum} (${name}): Thiếu Email FPT`);
        return;
      }

      const emailExists =
        currentMembers.some((m) => m.email.toLowerCase() === email) ||
        newMembers.some((m) => m.email.toLowerCase() === email);

      if (emailExists) {
        errors.push(`Dòng ${rowNum}: Email ${email} đã tồn tại trong hệ thống`);
        return;
      }

      const { tier, banId, banName } = deriveTierAndBan(position);

      newMembers.push({
        id: `mem-import-${Date.now()}-${index}`,
        name,
        studentId,
        academicYear,
        email,
        phone: phone || 'Chưa cập nhật',
        position,
        tier,
        banId,
        banName,
        gen: defaultGen || 'Gen 4.0',
        status: 'ACTIVE',
        joinedDate: new Date().toLocaleDateString('vi-VN'),
        bio: `${position} tại GDG on Campus FPT University HCMC.`,
        skills: [],
      });
    });

    if (newMembers.length > 0) {
      set((state) => {
        const updated = [...newMembers, ...state.members];
        saveToStorage(updated);
        return { members: updated };
      });
    }

    return { added: newMembers.length, errors };
  },

  getMemberById: (id) => get().members.find((m) => m.id === id),

  getMemberByEmail: (email) => {
    if (!email) return undefined;
    return get().members.find((m) => m.email.toLowerCase() === email.toLowerCase());
  },

  getAvailableGens: () => {
    const genSet = new Set(get().members.map((m) => m.gen));
    const standardGens = ['Gen 4.0', 'Gen 3.5', 'Gen 3.0', 'Gen 2.5', 'Gen 2.0', 'Gen 1.0'];
    standardGens.forEach((g) => genSet.add(g));

    return Array.from(genSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^\d.]/g, '')) || 0;
      return numB - numA;
    });
  },
}));
