"use client";
import React from "react";
import { useWalletStore } from "@/store/walletStore";
import { getReadOnlyWallet, createDriftClient } from "@/lib/driftClient";
import { toast } from "react-hot-toast";

interface ViewWalletModalProps {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ViewWalletModal({
  open,
  value,
  onChange,
  onClose,
  onSubmit,
}: ViewWalletModalProps) {
  const setWallet = useWalletStore((s) => s.setWallet);
  const setDriftClient = useWalletStore((s) => s.setDriftClient);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[var(--color-background)] border border-table-line rounded-lg p-6 min-w-[340px] shadow-xl relative">
        <button
          className="absolute top-2 right-2 text-navbar-alt hover:text-foreground text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div
          className="mb-2 font-semibold"
          style={{ fontSize: "var(--font-size-h2)" }}
        >
          View Wallet
        </div>
        <div
          className="mb-4 text-table-header"
          style={{ fontSize: "var(--font-size-subtext)" }}
        >
          Paste a Solana wallet address to view its Drift subaccounts.
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              // Validate base58
              if (!value || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) {
                toast.error("Invalid Solana wallet address");
                return;
              }
              setWallet(value, false);
              setDriftClient(createDriftClient(getReadOnlyWallet(value)));
              onSubmit();
            } catch (err) {
              toast.error("Invalid Solana wallet address");
            }
          }}
        >
          <input
            className="flex-1 px-3 py-2 rounded border border-table-line bg-navbar-alt text-foreground focus:outline-none focus:ring-2 focus:ring-wallet-gradient-from font-sans"
            type="text"
            placeholder="Enter wallet address..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
            style={{ fontSize: "var(--font-size-body)" }}
          />
          <button
            type="submit"
            className="rounded bg-button text-button-text border border-button-border px-3 py-2 font-semibold hover:bg-button-border transition font-sans"
            style={{ fontSize: "var(--font-size-body)" }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
