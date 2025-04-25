"use client";

import { PageLayout } from "@/components/PageLayout";
import ReusableTable from "@/components/ReusableTable";
import { useSubaccountStore } from "@/store/subaccountStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  
  // Always call hooks at the top level, even if we don't use the result immediately
  const pubkeyStr = publicKey ? publicKey.toBase58() : "";
  const { balances, perpPositions, accountSummaries } = useDashboardData(pubkeyStr);

  // Only display data if wallet is connected
  if (!connected || !publicKey) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-center text-[var(--color-subtext)] text-lg">
          Please connect your wallet to view your Drift data.
        </div>
      </div>
    );
  }

  return (
    <PageLayout title="Dashboard" subtitle="Overview of your account">
      <div className="mb-8">
        <div className="mb-12">
          <h2 className="mb-4">Balances</h2>
          <ReusableTable
            headers={["Token", "Amount"]}
            rows={balances.map((b) => [b.token, b.amount])}
          />
        </div>
        <div>
          <h2 className="mb-4">Sub Accounts</h2>
          <ReusableTable
            headers={["Subaccount ID", "Name", "Perp Positions"]}
            rows={accountSummaries.map((a) => [
              a.subAccountId,
              a.name,
              a.perpPositionsCount,
            ])}
            onRowClick={(_, rowIdx) => {
              const subId = accountSummaries[rowIdx].subAccountId;
              window.location.href = `/subaccount/${subId}`;
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
