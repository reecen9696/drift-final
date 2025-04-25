import { create } from "zustand";
import type { Balance, PerpPosition, AccountSummary } from "@/lib/interfaces";

interface SubaccountState {
  balances: Balance[];
  perpPositions: PerpPosition[];
  accountSummaries: AccountSummary[];
  setBalances: (b: Balance[]) => void;
  setPerpPositions: (p: PerpPosition[]) => void;
  setAccountSummaries: (a: AccountSummary[]) => void;
}

export const useSubaccountStore = create<SubaccountState>((set) => ({
  balances: [],
  perpPositions: [],
  accountSummaries: [],
  setBalances: (balances) => set({ balances }),
  setPerpPositions: (perpPositions) => set({ perpPositions }),
  setAccountSummaries: (accountSummaries) => set({ accountSummaries }),
}));
