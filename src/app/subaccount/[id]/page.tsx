"use client";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import ReusableTable from "@/components/ReusableTable";
import { useDashboardData, useRefreshStore } from "@/hooks/useDashboardData";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  depositToSpot,
  withdrawFromSpot,
  openPerpMarketOrder,
  createDriftClient,
} from "@/lib/driftClient";
import { SpotMarkets, PerpMarkets, OrderType } from "@drift-labs/sdk";
import { toast } from "react-hot-toast";

export default function SubaccountPage() {
  const { id } = useParams();
  const subaccountId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const pubkeyStr = connected && publicKey ? publicKey.toBase58() : "";
  const { balances, perpPositions, accountSummaries } =
    useDashboardData(pubkeyStr);

  // Find the subaccount summary for this id
  const subaccount = accountSummaries.find(
    (a) => a.subAccountId === Number(subaccountId)
  );

  const [modalType, setModalType] = useState<
    "deposit" | "withdraw" | "trade" | null
  >(null);
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [selectedMarketIndex, setSelectedMarketIndex] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState(0); // Default to SOL (marketIndex 0)
  const [selectedOrderType, setSelectedOrderType] = useState<string>("market"); // Use string for simplicity
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useRefreshStore((state) => state.refresh);

  const closeModal = () => {
    setModalType(null);
    setAmount("");
    setDirection("long");
    setSelectedMarketIndex(0);
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!publicKey || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!wallet.signTransaction || !wallet.signAllTransactions) {
      toast.error("Your wallet doesn't support the required signing methods");
      return;
    }

    setLoading(true);
    try {
      // Use the wallet instance that was already created at the component level
      const driftClient = createDriftClient(wallet);
      await driftClient.subscribe(); // Important to load user data

      const subAccountId = Number(subaccountId); // Ensure numeric subaccount id

      if (modalType === "deposit") {
        await depositToSpot(
          driftClient,
          selectedCurrency,
          Number(amount),
          subAccountId
        );
        toast.success(`Deposit of ${amount} successful!`);
      } else if (modalType === "withdraw") {
        await withdrawFromSpot(
          driftClient,
          selectedCurrency,
          Number(amount),
          subAccountId
        );
        toast.success(`Withdraw of ${amount} successful!`);
      } else if (modalType === "trade") {
        // Use different order functions based on the selected order type
        if (selectedOrderType === "market") {
          await openPerpMarketOrder(
            driftClient,
            selectedMarketIndex,
            Number(amount),
            direction,
            subAccountId
          );
          toast.success(
            `${direction === "long" ? "Buy" : "Sell"} market order placed!`
          );
        } else {
          // For now, handle other order types as market orders
          // You'll need to implement other order type functions
          toast.error("Only market orders are currently supported.");
          setLoading(false);
          return;
        }
      }
      closeModal();
    } catch (err: any) {
      console.error("Transaction error:", err);
      toast.error("Transaction failed");
      setLoading(false);
    }
  };

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
          Please connect your wallet to view this subaccount.
        </div>
      </div>
    );
  }

  if (!subaccount) {
    return (
      <PageLayout title="Subaccount" subtitle="">
        <div className="text-center text-[var(--color-subtext)] text-lg py-12">
          Subaccount not found.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Subaccount #${subaccountId}`}
      subtitle={subaccount.name}
    >
      <div className="mb-8">
        <div className="flex justify-between items-center gap-2 mb-6">
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition flex items-center gap-2"
            onClick={() => {
              setRefreshing(true);
              refresh();
              setTimeout(() => setRefreshing(false), 1500);
            }}
            disabled={refreshing}
          >
            <span
              className={`inline-block ${refreshing ? "animate-spin" : ""}`}
            >
              ↻
            </span>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <div className="flex gap-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
              onClick={() => setModalType("deposit")}
            >
              Deposit
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
              onClick={() => setModalType("withdraw")}
            >
              Withdraw
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
              onClick={() => setModalType("trade")}
            >
              Trade
            </button>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-4">Balances</h2>
          <ReusableTable
            headers={["Token", "Amount"]}
            rows={balances.map((b) => [b.token, b.amount])}
          />
        </div>
        <div>
          <h2 className="mb-4">Perp Positions</h2>
          <ReusableTable
            headers={[
              "Market",
              "Base",
              "Quote Entry",
              "Quote BE",
              "Settled PnL",
            ]}
            rows={perpPositions.map((p) => [
              p.marketSymbol,
              p.baseAssetAmount,
              p.quoteEntryAmount,
              p.quoteBreakEvenAmount,
              p.settledPnl,
            ])}
          />
        </div>

        {modalType === "deposit" || modalType === "withdraw" ? (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-[var(--color-background)] border border-table-line rounded-lg p-6 min-w-[340px] shadow-xl relative">
              <button
                className="absolute top-2 right-2 text-navbar-alt hover:text-foreground text-xl font-bold"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
              <div className="mb-2 font-semibold text-lg">
                {modalType === "deposit" ? "Deposit" : "Withdraw"}
              </div>
              <div className="mb-4 text-table-header text-sm">
                Enter the amount to {modalType}.
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirm();
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm mb-1">Currency</label>
                  <select
                    className="w-full border border-table-line rounded px-3 py-2 bg-transparent text-[var(--color-foreground)]"
                    value={selectedCurrency}
                    onChange={(e) =>
                      setSelectedCurrency(Number(e.target.value))
                    }
                    required
                  >
                    {SpotMarkets["mainnet-beta"].map((market) => (
                      <option
                        key={market.marketIndex}
                        value={market.marketIndex}
                      >
                        {market.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="w-full border border-table-line rounded px-3 py-2 mb-4 bg-transparent text-[var(--color-foreground)]"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  className={`w-full py-2 rounded font-semibold ${
                    modalType === "deposit"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white transition`}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : modalType === "deposit"
                    ? "Confirm Deposit"
                    : "Confirm Withdraw"}
                </button>
              </form>
            </div>
          </div>
        ) : modalType === "trade" ? (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-[var(--color-background)] border border-table-line rounded-lg p-6 min-w-[340px] shadow-xl relative">
              <button
                className="absolute top-2 right-2 text-navbar-alt hover:text-foreground text-xl font-bold"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
              <div className="mb-2 font-semibold text-lg">
                Place Market Order
              </div>
              <div className="mb-4 text-table-header text-sm">
                Enter the details for your market order.
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirm();
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm mb-1">Market</label>
                  <select
                    className="w-full border border-table-line rounded px-3 py-2 bg-transparent text-[var(--color-foreground)]"
                    value={selectedMarketIndex}
                    onChange={(e) =>
                      setSelectedMarketIndex(Number(e.target.value))
                    }
                    required
                  >
                    {PerpMarkets["mainnet-beta"].map((market) => (
                      <option
                        key={market.marketIndex}
                        value={market.marketIndex}
                      >
                        {market.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-1">Order Type</label>
                  <select
                    className="w-full border border-table-line rounded px-3 py-2 bg-transparent text-[var(--color-foreground)]"
                    value={selectedOrderType}
                    onChange={(e) => setSelectedOrderType(e.target.value)}
                    required
                  >
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                    <option value="triggerMarket">Stop Market</option>
                    <option value="triggerLimit">Stop Limit</option>
                    <option value="oracle">Oracle</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-1">Direction</label>
                  <div className="flex w-full mb-4 rounded overflow-hidden">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-center ${
                        direction === "long"
                          ? "bg-green-600 text-white"
                          : "bg-[#1a2330] text-gray-300 hover:bg-[#212b3b]"
                      }`}
                      onClick={() => setDirection("long")}
                    >
                      Long
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-center ${
                        direction === "short"
                          ? "bg-red-600 text-white"
                          : "bg-[#1a2330] text-gray-300 hover:bg-[#212b3b]"
                      }`}
                      onClick={() => setDirection("short")}
                    >
                      Short
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-1">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="w-full border border-table-line rounded px-3 py-2 bg-transparent text-[var(--color-foreground)]"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 rounded font-semibold ${
                    direction === "long"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white transition`}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : direction === "long"
                    ? "Buy / Long"
                    : "Sell / Short"}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
}
