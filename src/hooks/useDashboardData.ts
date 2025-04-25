import { useEffect, useState, useCallback } from "react";
import type { Balance, PerpPosition, AccountSummary } from "@/lib/interfaces";
import {
  fetchSubaccounts,
  fetchSubaccountDetails,
  fetchSubaccountTokenBalances,
  formatPerpPositions,
  getSubaccountSummary,
} from "@/lib/driftClient";
import { createDriftClient, getReadOnlyWallet } from "@/lib/driftClient";
import { create } from "zustand";

interface RefreshStore {
  triggerRefresh: number;
  refresh: () => void;
}

export const useRefreshStore = create<RefreshStore>((set) => ({
  triggerRefresh: 0,
  refresh: () => set((state) => ({ triggerRefresh: state.triggerRefresh + 1 })),
}));

export function useDashboardData(publicKey: string) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [perpPositions, setPerpPositions] = useState<PerpPosition[]>([]);
  const [accountSummaries, setAccountSummaries] = useState<AccountSummary[]>(
    []
  );
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);

  const fetchData = useCallback(async () => {
    if (!publicKey) {
      console.warn("⚠️ Missing publicKey");
      return;
    }

    const wallet = getReadOnlyWallet(publicKey);
    const driftClient = createDriftClient(wallet);

    try {
      await driftClient.subscribe();

      const subaccounts = await fetchSubaccounts(driftClient, publicKey);

      if (!subaccounts.length) {
        console.warn("⚠️ No subaccounts found");
        setBalances([]);
        setPerpPositions([]);
        setAccountSummaries([]);
        return;
      }

      try {
        const summary = await getSubaccountSummary(driftClient, publicKey);
        setAccountSummaries(summary);
      } catch (err) {
        console.error("Failed to fetch subaccount summary", err);
        setAccountSummaries([]);
      }

      const subAccountId = subaccounts[0].subAccountId ?? 0;

      let details = null;
      try {
        details = await fetchSubaccountDetails(driftClient, subAccountId);
      } catch (err) {
        console.error(
          `Failed to fetch details for subaccount ${subAccountId}`,
          err
        );
        setBalances([]);
        setPerpPositions([]);
      }

      if (details) {
        try {
          const formattedPerps = formatPerpPositions(
            driftClient,
            details.perpPositions
          );
          setPerpPositions(formattedPerps);
        } catch (err) {
          console.error("Failed to format perp positions", err);
          setPerpPositions([]);
        }

        try {
          const balancesData = await fetchSubaccountTokenBalances(
            driftClient,
            subAccountId
          );
          setBalances(balancesData);
        } catch (err) {
          console.error("Failed to fetch token balances", err);
          setBalances([]);
        }
      }
    } finally {
      try {
        await driftClient.unsubscribe();
      } catch {
        console.warn("Failed to unsubscribe");
      }
    }
  }, [publicKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData, publicKey]);

  useEffect(() => {
    if (triggerRefresh > 0) {
      fetchData();
    }
  }, [triggerRefresh, fetchData]);

  return { balances, perpPositions, accountSummaries };
}
