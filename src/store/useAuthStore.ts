import { create } from 'zustand';
import { UserSession } from '../mocks/fixtures/users';
import { authApi, LoginDto } from '../api';

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
      const user = await authApi.getMe();
      set({ user: user as any, isLoading: false });
      return user as any;
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
      set({ user: user as any, isLoading: false });
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
}));
