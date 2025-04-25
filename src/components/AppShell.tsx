"use client";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useEffect, useState } from "react";
import Toasts from "./Toasts";
import Navbar from "./Navbar";
import LoadingOverlay from "./LoadingOverlay";
import WalletContextProvider from "./WalletContextProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);
  return (
    <WalletContextProvider>
      <LoadingOverlay show={loading} />
      <Toasts />
      <Navbar />
      {children}
    </WalletContextProvider>
  );
}
