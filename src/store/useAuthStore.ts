import { create } from 'zustand';
import { UserSession, mapBackendUserToSession } from '../types/auth.types';
import { authApi, LoginDto, ChangePasswordDto } from '../api';

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  setUser: (user: UserSession | null) => void;
  setLoading: (isLoading: boolean) => void;
  fetchSession: () => Promise<UserSession | null>;
  login: (dto: LoginDto) => Promise<any>;
  logout: () => Promise<void>;
  changePassword: (dto: ChangePasswordDto) => Promise<any>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchSession: async () => {
    set({ isLoading: true });
    try {
      const user = await authApi.getMe();
      const mapped = mapBackendUserToSession(user);
      set({ user: mapped, isLoading: false });
      return mapped;
    } catch {
      set({ user: null, isLoading: false });
      return null;
    }
  },

  login: async (dto: LoginDto) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(dto);
      // Fetch profile sau khi login
      const user = await authApi.getMe();
      const mapped = mapBackendUserToSession(user);
      set({ user: mapped, isLoading: false });
      return res;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
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

  changePassword: async (dto: ChangePasswordDto) => {
    return authApi.changePassword(dto);
  },
}));
