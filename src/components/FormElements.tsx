"use client";
import React from "react";

interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "password" | "email";
  min?: number;
  step?: string | number;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
  required = false,
  autoFocus = false,
  className = "",
}: TextInputProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm mb-1">{label}</label>}
      <input
        type={type}
        min={min}
        step={step}
        className="w-full border border-table-line rounded px-3 py-2 bg-transparent text-[var(--color-foreground)]"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
      />
    </div>
  );
}

interface SelectInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{
    value: string | number;
    label: string;
  }>;
  required?: boolean;
  className?: string;
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  required = false,
  className = "",
}: SelectInputProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm mb-1">{label}</label>}
      <select
        className="w-full border border-table-line rounded px-3 py-2 bg-transparent text-[var(--color-foreground)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleButtonGroupProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    activeColor?: string;
  }>;
  className?: string;
}

export function ToggleButtonGroup({
  label,
  value,
  onChange,
  options,
  className = "",
}: ToggleButtonGroupProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm mb-1">{label}</label>}
      <div className="flex w-full mb-4 rounded overflow-hidden">
        {options.map((option) => {
          const isActive = value === option.value;
          let activeClass = "";

          if (isActive) {
            activeClass = option.activeColor || "bg-blue-600 text-white";
          } else {
            activeClass = "bg-[#1a2330] text-gray-300 hover:bg-[#212b3b]";
          }

          return (
            <button
              key={option.value}
              type="button"
              className={`flex-1 py-2 text-center ${activeClass}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "success" | "danger" | "warning" | "info";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  fullWidth = false,
  disabled = false,
  className = "",
}: ButtonProps) {
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
    info: "bg-gray-600 hover:bg-gray-700 text-white",
  };

  return (
    <button
      type={type}
      className={`${
        variantClasses[variant]
      } py-2 rounded font-semibold transition ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
