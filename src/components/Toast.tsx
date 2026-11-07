"use client";

import { CheckCircle2, Info, AlertTriangle } from "lucide-react";
import React from "react";

export interface ToastData {
  title: string;
  subtitle?: string;
  type?: "success" | "info" | "warning";
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      onClick={onClose}
      className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-white text-[#0b1c30] px-4 py-3 rounded-xl shadow-xl shadow-purple-950/10 border border-[#e5eeff] transition-all duration-300 animate-in fade-in slide-in-from-top-4 cursor-pointer max-w-md"
    >
      <div className="w-8 h-8 rounded-full bg-[#57dffe]/20 text-[#006172] flex items-center justify-center shrink-0">
        {toast.type === "warning" ? (
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        ) : toast.type === "info" ? (
          <Info className="w-4 h-4 text-[#006172]" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-[#006172]" />
        )}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[13px] font-semibold text-[#0b1c30] leading-snug">
          {toast.title}
        </span>
        {toast.subtitle && (
          <span className="text-[12px] text-[#494453] leading-snug mt-0.5">
            {toast.subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
