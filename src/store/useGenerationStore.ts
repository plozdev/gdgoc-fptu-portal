import { create } from 'zustand';
import { useNotificationStore } from './useNotificationStore';

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
    startMonthYear: string; // MM/yyyy
    endMonthYear: string;   // MM/yyyy
    carryOverCoreTeam: boolean;
    notifyAllMembers: boolean;
  }) => void;
}

const INITIAL_ARCHIVES: ArchivedSemester[] = [
  {
    id: 'arch-gen3-summer26',
    gen: 'Gen 3 (2024 - 2025)',
    semesterName: 'Summer 2026',
    startMonthYear: '05/2026',
    endMonthYear: '08/2026',
    totalTasks: 86,
    totalGems: 24500,
    membersCount: 48,
    eventsCount: 3,
    archivedAt: '31/08/2026',
    chapterLead: 'Hoàng Quốc Bảo (Gen 3 Lead)',
  },
  {
    id: 'arch-gen3-spring26',
    gen: 'Gen 3 (2024 - 2025)',
    semesterName: 'Spring 2026',
    startMonthYear: '01/2026',
    endMonthYear: '04/2026',
    totalTasks: 92,
    totalGems: 28000,
    membersCount: 45,
    eventsCount: 4,
    archivedAt: '30/04/2026',
    chapterLead: 'Hoàng Quốc Bảo (Gen 3 Lead)',
  },
];

export const useGenerationStore = create<GenerationConfig>((set, get) => ({
  currentGen: 'Gen 4 (2025 - 2026)',
  currentSemester: 'Fall 2026',
  startMonthYear: '09/2026',
  endMonthYear: '01/2027',
  status: 'ACTIVE',
  allowTaskSubmission: true,
  allowRsvp: true,
  freezeLeaderboard: false,
  chapterLead: 'Đặng Mai Phương',
  coChapterLead: 'Nguyễn Văn An',
  archivedSemesters: INITIAL_ARCHIVES,

  updateConfig: (updates) => {
    set((state) => ({ ...state, ...updates }));
  },

  performTransition: (newTerm) => {
    const state = get();
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const archivedDate = `${d}/${m}/${y}`;

    // 1. Tạo bản lưu trữ snapshot kỳ cũ
    const archivedRecord: ArchivedSemester = {
      id: `arch-${Date.now()}`,
      gen: state.currentGen,
      semesterName: state.currentSemester,
      startMonthYear: state.startMonthYear,
      endMonthYear: state.endMonthYear,
      totalTasks: 18,
      totalGems: 15200,
      membersCount: 52,
      eventsCount: 4,
      archivedAt: archivedDate,
      chapterLead: state.chapterLead,
    };

    // 2. Cập nhật state sang kỳ mới
    set((s) => ({
      currentGen: newTerm.newGen,
      currentSemester: newTerm.newSemester,
      startMonthYear: newTerm.startMonthYear,
      endMonthYear: newTerm.endMonthYear,
      status: 'ACTIVE',
      allowTaskSubmission: true,
      allowRsvp: true,
      freezeLeaderboard: false,
      archivedSemesters: [archivedRecord, ...s.archivedSemesters],
    }));

    // 3. Tự động gửi thông báo Broadcast nếu được chọn
    if (newTerm.notifyAllMembers) {
      useNotificationStore.getState().addNotification({
        title: `🚀 Khởi động nhiệm kỳ mới: ${newTerm.newSemester} - ${newTerm.newGen}`,
        message: `Ban Chủ Nhiệm chính thức kích hoạt kỳ hoạt động mới (${newTerm.startMonthYear} - ${newTerm.endMonthYear}). Dữ liệu kỳ cũ đã được kết toán và lưu trữ thành công.`,
        type: 'broadcast',
        priority: 'urgent',
        targetScope: 'all',
        senderName: state.chapterLead,
        senderRole: 'Chapter Lead',
      });
    }
  },
}));
