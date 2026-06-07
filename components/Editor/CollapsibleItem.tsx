"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleItemProps {
    title: string;
    children: React.ReactNode;
    onRemove: () => void;
    dragHandleProps?: Record<string, unknown>;
}

export default function CollapsibleItem({
    title,
    children,
    onRemove,
    dragHandleProps,
}: CollapsibleItemProps) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="border border-gray-100 dark:border-white/5 rounded flex flex-col bg-white dark:bg-[#2a2a2a] transition-colors">
            <div
                className="flex justify-between items-center bg-white dark:bg-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-white/5 rounded p-2 cursor-pointer transition-colors"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-3 text-center">{open ? "▾" : "▸"}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 select-none truncate">
                        {title}
                    </span>
                </div>
                <div className="flex gap-1 items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                    {dragHandleProps && (
                        <div {...dragHandleProps} className="cursor-grab hover:bg-gray-100 dark:hover:bg-white/5 p-1 rounded text-gray-400 dark:text-gray-500 text-lg leading-none flex items-center justify-center mr-1 transition-colors" title="Drag to reorder">
                            ⋮⋮
                        </div>
                    )}
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
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-2 pt-1 border-t border-gray-100 dark:border-white/5 flex flex-col gap-2">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
