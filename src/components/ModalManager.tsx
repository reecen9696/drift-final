"use client";
import React, { useState } from "react";
import Modal from "./Modal";
import TransactionForm, { TransactionType } from "./TransactionForm";

interface ModalManagerProps {
  subAccountId: number;
  wallet: any;
  onSuccess?: () => void;
}

export default function ModalManager({
  subAccountId,
  wallet,
  onSuccess,
}: ModalManagerProps) {
  const [modalType, setModalType] = useState<TransactionType | null>(null);

  const closeModal = () => {
    setModalType(null);
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    closeModal();
  };

  // Config for each transaction type
  const modalConfig = {
    deposit: {
      title: "Deposit",
      subtitle: "Enter the amount to deposit.",
    },
    withdraw: {
      title: "Withdraw",
      subtitle: "Enter the amount to withdraw.",
    },
    trade: {
      title: "Place Market Order",
      subtitle: "Enter the details for your market order.",
    },
  };

  if (!modalType) return null;

  return (
    <Modal
      isOpen={!!modalType}
      onClose={closeModal}
      title={modalConfig[modalType].title}
      subtitle={modalConfig[modalType].subtitle}
    >
      <TransactionForm
        type={modalType}
        subAccountId={subAccountId}
        wallet={wallet}
        onSuccess={handleSuccess}
        onCancel={closeModal}
      />
    </Modal>
  );
}
