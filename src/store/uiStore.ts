import { create } from "zustand";

interface UIState {
  showWalletModal: boolean;
  loading: boolean;
  error: string | null;
  setShowWalletModal: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showWalletModal: false,
  loading: false,
  error: null,
  setShowWalletModal: (show) => set({ showWalletModal: show }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
