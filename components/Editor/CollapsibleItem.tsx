"use client";

import { useState } from "react";

interface CollapsibleItemProps {
    title: string;
    children: React.ReactNode;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export default function CollapsibleItem({
    title,
    children,
    onMoveUp,
    onMoveDown,
    onRemove,
    isFirst,
    isLast,
}: CollapsibleItemProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-gray-100 rounded flex flex-col">
            <div
                className="flex justify-between items-center bg-white hover:bg-gray-50 rounded p-2 cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-xs text-gray-400 w-3 text-center">{open ? "▾" : "▸"}</span>
                    <span className="text-sm font-medium text-gray-700 select-none truncate">
                        {title}
                    </span>
                </div>
                <div className="flex gap-1 items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={isFirst}
                        className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 px-1"
                        title="Move up"
                    >
                        ▲
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={isLast}
                        className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 px-1"
                        title="Move down"
                    >
                        ▼
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        title="Remove"
                        className="text-[16px] text-[#9CA3AF] hover:text-[#DC2626] bg-transparent border-none leading-none px-1 ml-1"
                    >
                        ×
                    </button>
                </div>
            </div>
            {open && <div className="p-2 pt-1 border-t border-gray-100 flex flex-col gap-2">{children}</div>}
        </div>
    );
}
