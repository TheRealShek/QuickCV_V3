// components/ui/Button.tsx — Minimal button component

"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost";
  size?: "sm" | "md";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "rounded font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeClass = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const variantClass =
    variant === "danger"
      ? "bg-red-600 text-white hover:opacity-90"
      : variant === "ghost"
        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
        : "bg-blue-600 text-white hover:opacity-90";

  return (
    <button className={`${base} ${sizeClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
