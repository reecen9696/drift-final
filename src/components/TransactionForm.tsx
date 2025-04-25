"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  TextInput,
  SelectInput,
  ToggleButtonGroup,
  Button,
} from "./FormElements";
import {
  createDriftClient,
  depositToSpot,
  withdrawFromSpot,
  openPerpMarketOrder,
} from "@/lib/driftClient";
import { SpotMarkets, PerpMarkets } from "@drift-labs/sdk";

export type TransactionType = "deposit" | "withdraw" | "trade";

interface TransactionFormProps {
  type: TransactionType;
  subAccountId: number;
  wallet: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TransactionForm({
  type,
  subAccountId,
  wallet,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [marketIndex, setMarketIndex] = useState(0);
  const [orderType, setOrderType] = useState("market");
  const [loading, setLoading] = useState(false);

  const formConfig = {
    deposit: {
      title: "Deposit",
      subtitle: "Enter the amount to deposit.",
      buttonText: "Confirm Deposit",
      buttonVariant: "primary" as const,
    },
    withdraw: {
      title: "Withdraw",
      subtitle: "Enter the amount to withdraw.",
      buttonText: "Confirm Withdraw",
      buttonVariant: "danger" as const,
    },
    trade: {
      title: "Place Market Order",
      subtitle: "Enter the details for your market order.",
      buttonText: direction === "long" ? "Buy / Long" : "Sell / Short",
      buttonVariant:
        direction === "long" ? ("success" as const) : ("danger" as const),
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !wallet.publicKey ||
      !amount ||
      isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!wallet.signTransaction || !wallet.signAllTransactions) {
      toast.error("Your wallet doesn't support the required signing methods");
      return;
    }

    setLoading(true);
    try {
      const driftClient = createDriftClient(wallet);
      await driftClient.subscribe();

      if (type === "deposit") {
        await depositToSpot(
          driftClient,
          marketIndex,
          Number(amount),
          subAccountId
        );
        toast.success(`Deposit of ${amount} successful!`);
      } else if (type === "withdraw") {
        await withdrawFromSpot(
          driftClient,
          marketIndex,
          Number(amount),
          subAccountId
        );
        toast.success(`Withdraw of ${amount} successful!`);
      } else if (type === "trade") {
        await openPerpMarketOrder(
          driftClient,
          marketIndex,
          Number(amount),
          direction,
          subAccountId
        );
        toast.success(
          `${direction === "long" ? "Buy" : "Sell"} market order placed!`
        );
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Transaction error:", err);
      toast.error("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const marketOptions =
    type === "trade"
      ? PerpMarkets["mainnet-beta"].map((market) => ({
          value: market.marketIndex,
          label: market.symbol,
        }))
      : SpotMarkets["mainnet-beta"].map((market) => ({
          value: market.marketIndex,
          label: market.symbol,
        }));

  // Configure order type options for trading
  const orderTypeOptions = [
    { value: "market", label: "Market" },
    { value: "limit", label: "Limit" },
    { value: "triggerMarket", label: "Stop Market" },
    { value: "triggerLimit", label: "Stop Limit" },
    { value: "oracle", label: "Oracle" },
  ];

  // Direction options for trading
  const directionOptions = [
    { value: "long", label: "Long", activeColor: "bg-green-600 text-white" },
    { value: "short", label: "Short", activeColor: "bg-red-600 text-white" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <SelectInput
        label={type === "trade" ? "Market" : "Currency"}
        value={marketIndex}
        onChange={(value) => setMarketIndex(Number(value))}
        options={marketOptions}
        required
      />

      {type === "trade" && (
        <SelectInput
          label="Order Type"
          value={orderType}
          onChange={setOrderType}
          options={orderTypeOptions}
          required
        />
      )}

      {type === "trade" && (
        <ToggleButtonGroup
          label="Direction"
          value={direction}
          onChange={(value) => setDirection(value as "long" | "short")}
          options={directionOptions}
        />
      )}

      <TextInput
        label="Amount"
        value={amount}
        onChange={setAmount}
        type="number"
        min={0}
        step="any"
        placeholder="Amount"
        required
        autoFocus
      />

      <Button
        type="submit"
        variant={formConfig[type].buttonVariant}
        fullWidth
        disabled={loading}
      >
        {loading ? "Processing..." : formConfig[type].buttonText}
      </Button>
    </form>
  );
}
