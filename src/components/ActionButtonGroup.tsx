"use client";
import React from "react";
import { Button } from "./FormElements";

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "success" | "danger" | "warning" | "info";
}

interface ActionButtonGroupProps {
  buttons: ActionButtonProps[];
  className?: string;
}

export default function ActionButtonGroup({
  buttons,
  className = "",
}: ActionButtonGroupProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant || "primary"}
          onClick={button.onClick}
        >
          {button.label}
        </Button>
      ))}
    </div>
  );
}
