"use client";
import { ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const endpoint = process.env.NEXT_PUBLIC_SOLANA_MAINNET_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_SOLANA_MAINNET_URL
  : "https://api.mainnet-beta.solana.com";

export default function WalletContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const wallets = useMemo(
    () => [new TorusWalletAdapter(), new LedgerWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
