import { create } from "zustand";
import { generationApi } from "../api/generation.api";
interface GenerationState {
  currentGen: string;
  currentSemester: string;
  currentSemesterId: string;
  isLoading: boolean;
  error: string | null;
  fetchGenerationConfig: () => Promise<void>;
}
export const useGenerationStore = create<GenerationState>((set) => ({
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
        isLoading: false,
        error: null,
      });
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },
}));
