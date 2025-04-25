"use client";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: ModalProps) {
  if (!isOpen) return null;

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
        <div className="mb-2 font-semibold text-lg">{title}</div>
        {subtitle && (
          <div className="mb-4 text-table-header text-sm">{subtitle}</div>
        )}
        {children}
      </div>
    </div>
  );
}
