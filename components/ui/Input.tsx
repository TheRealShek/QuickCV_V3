// components/ui/Input.tsx — Minimal input and textarea components

"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && <label className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</label>}
      <input
        className={`bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-600 ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-gray-400 dark:text-gray-500">{hint}</span>}
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
      {label && <label className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</label>}
      <textarea
        className={`bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-600 resize-y ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-gray-400 dark:text-gray-500">{hint}</span>}
    </div>
  );
}
