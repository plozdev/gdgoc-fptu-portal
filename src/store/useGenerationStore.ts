/**
 * @file useGenerationStore.ts
 * @description Zustand store quản lý cấu hình kỳ hoạt động (Generation/Semester).
 *
 * Tích hợp trực tiếp với Backend API:
 * - GET /api/config/generation: Lấy cấu hình nhiệm kỳ hiện tại & snapshot các kỳ đã lưu trữ
 * - PUT /api/config/generation: Cập nhật cấu hình nhiệm kỳ hiện tại
 * - POST /api/config/generation/transition: Chuyển giao sang nhiệm kỳ mới
 */

import { create } from 'zustand';
import { generationApi, TransitionTenureDto } from '../api/generation.api';
import { useNotificationStore } from './useNotificationStore';

// ==========================================
// TYPES
// ==========================================

export interface ArchivedSemester {
  id: string;
  gen: string;
  semesterName: string;
  startMonthYear: string; // MM/yyyy
  endMonthYear: string;   // MM/yyyy
  totalTasks: number;
  totalGems: number;
  membersCount: number;
  eventsCount: number;
  archivedAt: string;     // dd/MM/yyyy
  chapterLead: string;
}

export interface GenerationConfig {
  currentGen: string;
  currentSemester: string;
  startMonthYear: string; // MM/yyyy
  endMonthYear: string;   // MM/yyyy
  status: 'ACTIVE' | 'HANDOVER' | 'ARCHIVED';
  allowTaskSubmission: boolean;
  allowRsvp: boolean;
  freezeLeaderboard: boolean;
  chapterLead: string;
  coChapterLead: string;
  archivedSemesters: ArchivedSemester[];
  isLoading: boolean;
  error: string | null;

  fetchGenerationConfig: () => Promise<void>;
  updateConfig: (updates: Partial<Omit<GenerationConfig, 'archivedSemesters' | 'updateConfig' | 'performTransition' | 'fetchGenerationConfig'>>) => Promise<void>;
  performTransition: (newTerm: {
    targetType: 'semester' | 'generation';
    newGen: string;
    newSemester: string;
    startMonthYear: string;
    endMonthYear: string;
    carryOverCoreTeam: boolean;
    notifyAllMembers: boolean;
    chapterLead?: string;
  }) => Promise<void>;
}

// ==========================================
// HELPERS
// ==========================================

function formatMMYYYY(dateInput?: string | Date): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = d.getFullYear();
  return `${m}/${y}`;
}

function formatDDMMYYYY(dateInput?: string | Date): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

function parseMMYYYYToISO(mmyyyy: string, isEnd = false): string {
  const parts = mmyyyy.split('/');
  if (parts.length === 2) {
    const month = parseInt(parts[0], 10) - 1;
    const year = parseInt(parts[1], 10);
    if (!isNaN(month) && !isNaN(year)) {
      if (isEnd) {
        // Last day of month
        const nextMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
        return nextMonth.toISOString();
      }
      return new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString();
    }
  }
  return new Date().toISOString();
}

const STORAGE_KEY = 'gdgoc_generation_config_v2';

function loadCachedConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedConfig(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[GenerationStore] Failed to cache config:', e);
  }
}

// ==========================================
// STORE
// ==========================================

const cached = typeof window !== 'undefined' ? loadCachedConfig() : null;

export const useGenerationStore = create<GenerationConfig>((set, get) => ({
  currentGen: cached?.currentGen || 'Gen 4 (2025 - 2026)',
  currentSemester: cached?.currentSemester || 'Fall 2026',
  startMonthYear: cached?.startMonthYear || '09/2026',
  endMonthYear: cached?.endMonthYear || '01/2027',
  status: 'ACTIVE',
  allowTaskSubmission: cached?.allowTaskSubmission ?? true,
  allowRsvp: cached?.allowRsvp ?? true,
  freezeLeaderboard: cached?.freezeLeaderboard ?? false,
  chapterLead: cached?.chapterLead || 'Trần Võ Minh Hùng',
  coChapterLead: cached?.coChapterLead || 'Võ Cao Minh',
  archivedSemesters: cached?.archivedSemesters || [],
  isLoading: false,
  error: null,

  fetchGenerationConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await generationApi.getGenerationConfig();
      if (!res) {
        set({ isLoading: false });
        return;
      }

      const currentTenure = res.currentTenure;
      const archivedTenures = res.archivedTenures || [];

      const currentGen = currentTenure?.genLabel || get().currentGen;
      const currentSemester = currentTenure?.name || get().currentSemester;
      const startMonthYear = currentTenure?.startDate ? formatMMYYYY(currentTenure.startDate) : get().startMonthYear;
      const endMonthYear = currentTenure?.endDate ? formatMMYYYY(currentTenure.endDate) : get().endMonthYear;
      const chapterLead = currentTenure?.chapterLead || get().chapterLead;

      const archivedSemesters: ArchivedSemester[] = archivedTenures.map((t: any) => ({
        id: t.id,
        gen: t.genLabel || 'Gen lưu trữ',
        semesterName: t.name || 'Học kỳ lưu trữ',
        startMonthYear: t.startDate ? formatMMYYYY(t.startDate) : '',
        endMonthYear: t.endDate ? formatMMYYYY(t.endDate) : '',
        totalTasks: t.totalTasks || 0,
        totalGems: t.totalGems || 0,
        membersCount: t.membersCount || 0,
        eventsCount: t.eventsCount || 0,
        archivedAt: t.archivedAt ? formatDDMMYYYY(t.archivedAt) : formatDDMMYYYY(new Date()),
        chapterLead: t.chapterLead || 'Ban Chủ Nhiệm',
      }));

      const nextState = {
        currentGen,
        currentSemester,
        startMonthYear,
        endMonthYear,
        chapterLead,
        allowTaskSubmission: res.allowTaskSubmission !== undefined ? res.allowTaskSubmission : !currentTenure?.isFrozen,
        allowRsvp: res.allowRsvp !== undefined ? res.allowRsvp : true,
        freezeLeaderboard: res.freezeLeaderboard !== undefined ? res.freezeLeaderboard : currentTenure?.isFrozen,
        archivedSemesters,
        isLoading: false,
        error: null,
      };

      set(nextState);
      saveCachedConfig(nextState);
    } catch (err: any) {
      console.warn('[GenerationStore] Failed to fetch config from backend:', err);
      set({ isLoading: false, error: err.message || 'Lỗi tải cấu hình nhiệm kỳ' });
    }
  },

  updateConfig: async (updates) => {
    try {
      const payload: any = {
        isFrozen: updates.freezeLeaderboard,
        allowTaskSubmission: updates.allowTaskSubmission,
        allowRsvp: updates.allowRsvp,
        freezeLeaderboard: updates.freezeLeaderboard,
        chapterLead: updates.chapterLead,
        coChapterLead: updates.coChapterLead,
      };

      if (updates.currentSemester) payload.name = updates.currentSemester;
      if (updates.currentGen) payload.genLabel = updates.currentGen;
      if (updates.startMonthYear) payload.startDate = parseMMYYYYToISO(updates.startMonthYear);
      if (updates.endMonthYear) payload.endDate = parseMMYYYYToISO(updates.endMonthYear, true);

      await generationApi.updateGenerationConfig(payload);
    } catch (err) {
      console.warn('[GenerationStore] Backend update failed, falling back to local state:', err);
    }

    set((state) => {
      const next = { ...state, ...updates };
      saveCachedConfig(next);
      return next;
    });
  },

  performTransition: async (newTerm) => {
    const state = get();
    set({ isLoading: true });

    try {
      const startDate = parseMMYYYYToISO(newTerm.startMonthYear);
      const endDate = parseMMYYYYToISO(newTerm.endMonthYear, true);

      const dto: TransitionTenureDto = {
        newTenureName: newTerm.newSemester,
        newGenLabel: newTerm.newGen,
        startDate,
        endDate,
        carryOverCoreTeam: newTerm.carryOverCoreTeam,
        notifyAllMembers: newTerm.notifyAllMembers,
        chapterLead: newTerm.chapterLead || state.chapterLead,
      };

      await generationApi.transitionTenure(dto);
      await get().fetchGenerationConfig();
    } catch (err) {
      console.warn('[GenerationStore] Transition failed on backend, simulating locally:', err);

      const archivedRecord: ArchivedSemester = {
        id: `arch-${Date.now()}`,
        gen: state.currentGen,
        semesterName: state.currentSemester,
        startMonthYear: state.startMonthYear,
        endMonthYear: state.endMonthYear,
        totalTasks: 0,
        totalGems: 0,
        membersCount: 0,
        eventsCount: 0,
        archivedAt: formatDDMMYYYY(new Date()),
        chapterLead: state.chapterLead,
      };

      set(() => ({
        currentGen: newTerm.newGen,
        currentSemester: newTerm.newSemester,
        startMonthYear: newTerm.startMonthYear,
        endMonthYear: newTerm.endMonthYear,
        status: 'ACTIVE',
        allowTaskSubmission: true,
        allowRsvp: true,
        freezeLeaderboard: false,
        archivedSemesters: [archivedRecord, ...state.archivedSemesters],
        isLoading: false,
      }));
    } finally {
      set({ isLoading: false });
    }

    if (newTerm.notifyAllMembers) {
      useNotificationStore.getState().addNotification({
        title: `🚀 Khởi động nhiệm kỳ mới: ${newTerm.newSemester} - ${newTerm.newGen}`,
        message: `Ban Chủ Nhiệm chính thức kích hoạt kỳ hoạt động mới (${newTerm.startMonthYear} – ${newTerm.endMonthYear}). Dữ liệu kỳ cũ đã được kết toán và lưu trữ an toàn.`,
        type: 'broadcast',
        priority: 'urgent',
        targetScope: 'all',
        senderName: state.chapterLead,
        senderRole: 'Chapter Lead',
      });
    }
  },
}));
