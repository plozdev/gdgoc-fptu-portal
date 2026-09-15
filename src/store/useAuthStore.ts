import { create } from 'zustand';
import { UserSession } from '../mocks/fixtures/users';

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  setUser: (user: UserSession | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}));
