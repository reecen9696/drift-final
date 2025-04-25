"use client";
import Image from "next/image";
import { useState } from "react";
import ViewWalletModal from "./ViewWalletModal";
import ConnectWalletButton from "./ConnectWalletButton";
import { useWalletStore } from "@/store/walletStore";

export default function Navbar() {
  const [showWalletInput, setShowWalletInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const connected = useWalletStore((s) => s.connected);

  return (
    <nav
      className="w-full flex items-center justify-between px-6 py-3 bg-navbar text-navbar-alt font-sans"
      style={{ fontSize: "var(--font-size-navbar)" }}
    >
      <div className="flex items-center gap-2 font-sans">
        <a href="/">
          <Image
            src="/images/drift.png"
            alt="Drift Logo"
            width={100}
            height={100}
            style={{ cursor: "pointer" }}
          />
        </a>
      </div>

      <div className="flex items-center gap-3 font-sans">
        <button
          className="rounded bg-button text-button-text px-3 py-1 hover:bg-button-border transition font-sans disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (!connected) setShowWalletInput(true);
          }}
          style={{ fontSize: "var(--font-size-navbar)" }}
          disabled={connected}
        >
          Enter Wallet
        </button>
        <ConnectWalletButton />
      </div>

      <ViewWalletModal
        open={showWalletInput}
        value={inputValue}
        onChange={setInputValue}
        onClose={() => setShowWalletInput(false)}
        onSubmit={() => setShowWalletInput(false)}
      />
    </nav>
  );
}
