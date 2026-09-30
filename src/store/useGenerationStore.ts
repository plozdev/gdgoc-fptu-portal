/**
 * @file useGenerationStore.ts
 * @description Zustand store quản lý cấu hình kỳ hoạt động (Generation/Semester) kết nối Backend API.
 */

import { create } from 'zustand';
import { generationApi } from '../api';

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
  currentTenureId: string | null;
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

  fetchConfig: () => Promise<void>;
  updateConfig: (updates: Partial<Omit<GenerationConfig, 'archivedSemesters' | 'updateConfig' | 'performTransition' | 'fetchConfig'>>) => Promise<void>;
  performTransition: (newTerm: {
    targetType: 'semester' | 'generation';
    newGen: string;
    newSemester: string;
    startMonthYear: string;
    endMonthYear: string;
    carryOverCoreTeam: boolean;
    notifyAllMembers: boolean;
  }) => Promise<void>;
}

function formatDateMMYYYY(isoStr?: string | Date): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = d.getFullYear();
  return `${m}/${y}`;
}

export const useGenerationStore = create<GenerationConfig>((set, get) => ({
  currentGen: 'Gen 4.0',
  currentSemester: 'Fall 2026',
  currentTenureId: null,
  startMonthYear: '09/2026',
  endMonthYear: '01/2027',
  status: 'ACTIVE',
  allowTaskSubmission: true,
  allowRsvp: true,
  freezeLeaderboard: false,
  chapterLead: 'Đặng Mai Phương',
  coChapterLead: '',
  archivedSemesters: [],
  isLoading: false,
  error: null,

  fetchConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await generationApi.getGenerationConfig();
      const current = res?.currentTenure;
      const archives = res?.archivedTenures || [];

      const mappedArchives: ArchivedSemester[] = archives.map((a: any) => ({
        id: a.id,
        gen: a.genLabel || a.name,
        semesterName: a.name,
        startMonthYear: formatDateMMYYYY(a.startDate),
        endMonthYear: formatDateMMYYYY(a.endDate),
        totalTasks: a.totalTasks ?? 0,
        totalGems: a.totalGems ?? 0,
        membersCount: a.membersCount ?? 0,
        eventsCount: a.eventsCount ?? 0,
        archivedAt: a.archivedAt ? new Date(a.archivedAt).toLocaleDateString('vi-VN') : '',
        chapterLead: a.chapterLead || 'Ban Chủ Nhiệm',
      }));

      set({
        currentGen: current?.genLabel || 'Gen 4.0',
        currentSemester: current?.name || 'Fall 2026',
        currentTenureId: current?.id || null,
        startMonthYear: formatDateMMYYYY(current?.startDate) || '09/2026',
        endMonthYear: formatDateMMYYYY(current?.endDate) || '01/2027',
        status: current?.isFrozen ? 'ARCHIVED' : 'ACTIVE',
        allowTaskSubmission: res?.allowTaskSubmission ?? !current?.isFrozen,
        allowRsvp: res?.allowRsvp ?? true,
        freezeLeaderboard: res?.freezeLeaderboard ?? Boolean(current?.isFrozen),
        chapterLead: current?.chapterLead || '',
        archivedSemesters: mappedArchives,
        isLoading: false,
      });
    } catch (err: any) {
      if (err?.status !== 401) {
        console.error('[GenerationStore] Failed to fetch config:', err);
      }
      set({ error: err.message || 'Lỗi tải cấu hình nhiệm kỳ', isLoading: false });
    }
  },

  updateConfig: async (updates) => {
    try {
      await generationApi.updateGenerationConfig({
        isFrozen: updates.freezeLeaderboard !== undefined ? updates.freezeLeaderboard : undefined,
        allowTaskSubmission: updates.allowTaskSubmission,
        allowRsvp: updates.allowRsvp,
        freezeLeaderboard: updates.freezeLeaderboard,
        chapterLead: updates.chapterLead,
        coChapterLead: updates.coChapterLead,
      });
      await get().fetchConfig();
    } catch (err: any) {
      console.error('[GenerationStore] Failed to update config:', err);
      throw err;
    }
  },

  performTransition: async (newTerm) => {
    try {
      // Convert MM/yyyy to ISO string
      const [startM, startY] = newTerm.startMonthYear.split('/').map(Number);
      const [endM, endY] = newTerm.endMonthYear.split('/').map(Number);
      const startDate = new Date(Date.UTC(startY || 2026, (startM || 9) - 1, 1)).toISOString();
      const endDate = new Date(Date.UTC(endY || 2027, endM || 1, 0, 23, 59, 59)).toISOString();

      await generationApi.transitionTenure({
        newTenureName: newTerm.newSemester,
        newGenLabel: newTerm.newGen,
        startDate,
        endDate,
        carryOverCoreTeam: newTerm.carryOverCoreTeam,
        notifyAllMembers: newTerm.notifyAllMembers,
      });

      await get().fetchConfig();
    } catch (err: any) {
      console.error('[GenerationStore] Failed to transition tenure:', err);
      throw err;
    }
  },
}));
