// components/ui/Input.tsx — Minimal input and textarea components

"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <input
        className={`border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <textarea
        className={`border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
  );
}
