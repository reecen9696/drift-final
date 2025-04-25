"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletStore } from "@/store/walletStore";
import { createDriftClient } from "@/lib/driftClient";

const WalletMultiButton = dynamic(
  async () => {
    const mod = await import("@solana/wallet-adapter-react-ui");
    return mod.WalletMultiButton;
  },
  { ssr: false }
);

export default function ConnectWalletButton() {
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey, wallet } = useWallet();
  const setWallet = useWalletStore((s) => s.setWallet);
  const setDriftClient = useWalletStore((s) => s.setDriftClient);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("[ConnectWalletButton] connected:", connected, "publicKey:", publicKey?.toBase58(), "wallet:", wallet);
    if (connected && publicKey && wallet) {
      setWallet(publicKey.toBase58(), true);
      setDriftClient(createDriftClient(wallet));
      toast.success(`Wallet connected: ${publicKey.toBase58().slice(0, 6)}...`);
    } else {
      setWallet(null, false);
      setDriftClient(null);
    }
  }, [connected, publicKey, wallet, setWallet, setDriftClient]);

  if (!mounted) return null;

  return (
    <WalletMultiButton
      className="font-sans"
      style={{ fontSize: "var(--font-size-navbar)" }}
    />
  );
}
