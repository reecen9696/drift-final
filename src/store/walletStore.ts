import { create } from "zustand";
import type { DriftClient } from "@drift-labs/sdk";

interface WalletState {
  publicKey: string | null;
  connected: boolean;
  driftClient: DriftClient | null;
  setWallet: (publicKey: string | null, connected: boolean) => void;
  setDriftClient: (client: DriftClient | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey: null,
  connected: false,
  driftClient: null,
  setWallet: (publicKey: string | null, connected: boolean) =>
    set({ publicKey, connected }),
  setDriftClient: (driftClient: DriftClient | null) => set({ driftClient }),
}));
