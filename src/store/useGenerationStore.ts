import { create } from "zustand";
import { generationApi } from "../api/generation.api";
interface GenerationState {
  semesters: { id: string; name: string; isClosed: boolean }[];
  currentGen: string;
  currentSemester: string;
  currentSemesterId: string;
  isLoading: boolean;
  error: string | null;
  fetchGenerationConfig: () => Promise<boolean>;
}
export const useGenerationStore = create<GenerationState>((set) => ({
  semesters: [],
  currentGen: "",
  currentSemester: "",
  currentSemesterId: "",
  isLoading: false,
  error: null,
  fetchGenerationConfig: async () => {
    set({ isLoading: true });
    try {
      const c: any = await generationApi.getGenerationConfig();
      set({
        currentGen: c.currentTenure?.genLabel || "",
        currentSemester: c.currentSemester?.name || "",
        currentSemesterId: c.currentSemester?.id || "",
        semesters: [c.currentSemester, ...(c.archivedTenures || [])].filter(Boolean),
        isLoading: false,
        error: null,
      });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      return false;
    }
  },
}));
