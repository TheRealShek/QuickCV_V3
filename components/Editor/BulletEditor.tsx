// components/Editor/BulletEditor.tsx — Reusable bullet list editor
// Used by Experience, Projects, and Education (achievements)

"use client";

import Button from "@/components/ui/Button";

interface BulletEditorProps {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function BulletEditor({
  bullets,
  onChange,
  placeholder = "Action verb + what + tool + metric",
  label = "Bullets",
}: BulletEditorProps) {
  function update(index: number, value: string) {
    const next = [...bullets];
    next[index] = value;
    onChange(next);
  }

  function add() {
    onChange([...bullets, ""]);
  }

  function remove(index: number) {
    onChange(bullets.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...bullets];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === bullets.length - 1) return;
    const next = [...bullets];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</label>
      {bullets.map((bullet, i) => (
        <div key={i} className="flex gap-1 items-start">
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 min-w-[16px]">
            {i + 1}.
          </span>
          <textarea
            value={bullet}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex-1 bg-white/50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:border-gray-300 dark:hover:border-white/20 resize-y"
          />
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => moveUp(i)}
              disabled={i === 0}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 px-1 transition-colors"
              title="Move up"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveDown(i)}
              disabled={i === bullets.length - 1}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 px-1 transition-colors"
              title="Move down"
            >
              ▼
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            title="Remove bullet"
            className="text-[16px] text-[#9CA3AF] hover:text-[#DC2626] bg-transparent border-none mt-1.5 px-1 leading-none"
          >
            ×
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add} className="self-start">
        + Add bullet
      </Button>
    </div>
  );
}
