"use client";

import { defaultResumeData } from "@/lib/resume-data";
import { resumeSchema } from "@/lib/schema";
import type { ResumeData } from "@/types/resume";
import { useRef, useState } from "react";

interface DataControlsProps {
    data: ResumeData;
    onImport: (data: ResumeData) => void;
}

export default function DataControls({ data, onImport }: DataControlsProps) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showError = (message: string) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    const showSuccess = (message: string) => {
        setSuccess(message);
        setTimeout(() => setSuccess(null), 2000);
    };

    const handleExport = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume-data.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset input so importing the same file twice triggers onChange
        event.target.value = "";

        try {
            const text = await file.text();
            const parsedJSON = JSON.parse(text);

            const validation = resumeSchema.safeParse(parsedJSON);

            if (!validation.success) {
                const firstError = validation.error.issues[0];
                const path = firstError.path.join(".");
                showError(`Invalid resume file: [${path}] ${firstError.message}`);
                return;
            }

            const imported = validation.data;

            // Merge with default data to patch missing optional root blocks
            const merged: ResumeData = {
                ...defaultResumeData,
                ...imported,
                meta: { ...defaultResumeData.meta, ...imported.meta },
                header: { ...defaultResumeData.header, ...imported.header },
            };

            onImport(merged);
            showSuccess("Resume loaded.");
        } catch {
            showError("Failed to parse JSON file.");
        }
    };

    return (
        <div className="flex flex-col items-end">
            <div className="flex gap-2">
                <button
                    onClick={handleImportClick}
                    className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                >
                    Import JSON
                </button>
                <button
                    onClick={handleExport}
                    className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                >
                    Export JSON
                </button>
                <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {error && (
                <div className="text-xs text-red-600 mt-1 absolute top-full right-0 bg-white p-1 rounded shadow border border-red-100 z-50 whitespace-nowrap">
                    {error}
                </div>
            )}

            {success && (
                <div className="text-xs text-green-600 mt-1 absolute top-full right-0 bg-white p-1 rounded shadow border border-green-100 z-50 whitespace-nowrap">
                    {success}
                </div>
            )}
        </div>
    );
}
