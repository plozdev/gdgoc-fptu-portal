/**
 * @file useGenerationStore.ts
 * @description Zustand store quản lý cấu hình kỳ hoạt động (Generation/Semester).
 *
 * ⚠️  MOCK DATA ĐÃ BỊ XÓA — Store bắt đầu với config mặc định và archives rỗng.
 * Khi backend được tích hợp:
 * - Config sẽ được fetch từ GET /api/config/generation
 * - Archives sẽ được fetch từ GET /api/config/generation/archives
 */

import { create } from 'zustand';
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

  updateConfig: (updates: Partial<Omit<GenerationConfig, 'archivedSemesters' | 'updateConfig' | 'performTransition'>>) => void;
  performTransition: (newTerm: {
    targetType: 'semester' | 'generation';
    newGen: string;
    newSemester: string;
    startMonthYear: string;
    endMonthYear: string;
    carryOverCoreTeam: boolean;
    notifyAllMembers: boolean;
  }) => void;
}

// ==========================================
// HELPERS
// ==========================================

function formatDateVN(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

// ==========================================
// STORE
// ==========================================

export const useGenerationStore = create<GenerationConfig>((set, get) => ({
  // Default config — sẽ được override bởi backend khi tích hợp
  currentGen: 'Gen 4 (2025 - 2026)',
  currentSemester: 'Fall 2026',
  startMonthYear: '09/2026',
  endMonthYear: '01/2027',
  status: 'ACTIVE',
  allowTaskSubmission: true,
  allowRsvp: true,
  freezeLeaderboard: false,
  chapterLead: '',
  coChapterLead: '',
  archivedSemesters: [], // Empty — data comes from backend

  updateConfig: (updates) => {
    set((state) => ({ ...state, ...updates }));
  },

  performTransition: (newTerm) => {
    const state = get();

    // 1. Tạo bản lưu trữ snapshot kỳ cũ
    // NOTE: totalTasks, totalGems, membersCount, eventsCount cần được
    // cung cấp từ backend khi perform transition thật.
    const archivedRecord: ArchivedSemester = {
      id: `arch-${Date.now()}`,
      gen: state.currentGen,
      semesterName: state.currentSemester,
      startMonthYear: state.startMonthYear,
      endMonthYear: state.endMonthYear,
      totalTasks: 0,    // TODO: Lấy từ backend snapshot
      totalGems: 0,     // TODO: Lấy từ backend snapshot
      membersCount: 0,  // TODO: Lấy từ backend snapshot
      eventsCount: 0,   // TODO: Lấy từ backend snapshot
      archivedAt: formatDateVN(),
      chapterLead: state.chapterLead,
    };

    // 2. Cập nhật config sang kỳ mới
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
    }));

    // 3. Gửi thông báo broadcast nếu được chọn
    if (newTerm.notifyAllMembers) {
      useNotificationStore.getState().addNotification({
        title: `🚀 Khởi động nhiệm kỳ mới: ${newTerm.newSemester} - ${newTerm.newGen}`,
        message: `Ban Chủ Nhiệm chính thức kích hoạt kỳ hoạt động mới (${newTerm.startMonthYear} – ${newTerm.endMonthYear}). Dữ liệu kỳ cũ đã được kết toán và lưu trữ thành công.`,
        type: 'broadcast',
        priority: 'urgent',
        targetScope: 'all',
        senderName: state.chapterLead,
        senderRole: 'Chapter Lead',
      });
    }
  },
}));
