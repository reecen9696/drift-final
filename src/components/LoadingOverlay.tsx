"use client";
import { ClipLoader } from "react-spinners";

export default function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <ClipLoader color="#fff" size={64} speedMultiplier={1.1} />
    </div>
  );
}
