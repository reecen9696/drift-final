"use client";
import { Toaster } from "react-hot-toast";

export default function Toasts() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        className:
          "bg-table-bg text-foreground font-sans text-[var(--font-size-body)] border border-table-line rounded-lg shadow-lg px-4 py-3",
        error: {
          iconTheme: {
            primary: "#e53935",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
