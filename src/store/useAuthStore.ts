import { create } from 'zustand';
import { UserSession, Tier, BanId, BAN_NAMES } from '../mocks/fixtures/users';
import { authApi, LoginDto } from '../api';

export function mapBackendUserToSession(raw: any): UserSession | null {
  if (!raw) return null;

  const currentTenure = raw.currentTenure || raw.tenures?.[0];
  const role = currentTenure?.role;
  const deptCode = currentTenure?.departmentCode || currentTenure?.department?.code;

  let tier: Tier = 'BAN_MEMBER';
  if (role === 'ADVISOR') {
    tier = 'ADVISOR';
  } else if (role === 'LEAD') {
    tier = 'ORG_ADMIN';
  } else if (role === 'DEPARTMENT_LEAD') {
    tier = 'BAN_LEAD';
  } else {
    tier = 'BAN_MEMBER';
  }

  const deptMap: Record<string, BanId> = {
    TECH_AI: 'ai',
    TECH_CLOUD: 'cloud',
    TECH_WEB: 'web',
    TECH_RESEARCH: 'research',
    MEDIA: 'media',
    HR_EVENT: 'hr-event',
  };

  const banId: BanId | null = (deptCode && deptMap[deptCode]) ? deptMap[deptCode] : null;
  const banName = currentTenure?.departmentName || (banId ? BAN_NAMES[banId] : undefined);

  return {
    id: raw.id,
    email: raw.email,
    name: raw.fullName || raw.name || raw.email,
    tier,
    banId,
    banName,
    ...raw,
  };
}

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  setUser: (user: UserSession | null) => void;
  setLoading: (isLoading: boolean) => void;
  fetchSession: () => Promise<UserSession | null>;
  login: (dto: LoginDto) => Promise<any>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchSession: async () => {
    set({ isLoading: true });
    try {
      const res = await authApi.getMe();
      const mapped = mapBackendUserToSession(res);
      set({ user: mapped, isLoading: false });
      return mapped;
    } catch {
      set({ user: null, isLoading: false });
      return null;
    }
  },

  login: async (dto: LoginDto) => {
    const res = await authApi.login(dto);
    // Fetch profile sau khi login thanh cong
    const profile = await authApi.getMe();
    const mapped = mapBackendUserToSession(profile);
    set({ user: mapped });
    return res;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      set({ user: null });
    }
  },
}));
