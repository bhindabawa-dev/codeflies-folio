"use client";

import { APP_VERSION } from "@/lib/version";
import { AlertTriangle, CheckCircle2, RefreshCw, Rocket, ShieldAlert, Sparkles } from "lucide-react";
import React, { useState } from "react";

interface ForceUpdateModalProps {
  isOpen: boolean;
  targetVersion: string;
  updateMessage?: string;
  forceTimestamp: number;
}

export function ForceUpdateModal({
  isOpen,
  targetVersion,
  updateMessage,
  forceTimestamp,
}: ForceUpdateModalProps) {
  const [updating, setUpdating] = useState(false);

  if (!isOpen) return null;

  const handleClearCacheAndUpdate = async () => {
    try {
      setUpdating(true);

      // 1. Unregister all service workers
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // 2. Clear browser cache storage
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 3. Mark update timestamp as acknowledged in localStorage
      try {
        localStorage.setItem("codeflies_acknowledged_update_ts", forceTimestamp.toString());
        localStorage.setItem("codeflies_acknowledged_version", targetVersion);
      } catch {
        // Ignore localStorage restrictions
      }

      // 4. Force a hard cache-busting reload from origin
      const cacheBustUrl = `${window.location.pathname}?_cb=${Date.now()}`;
      window.location.replace(cacheBustUrl);
    } catch (err) {
      console.error("Cache clear failed, falling back to location reload:", err);
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-[#5e35b1]/30 p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-tr from-[#5e35b1]/20 to-[#461599]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated pulse badge */}
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#461599] to-[#5e35b1] text-white flex items-center justify-center shadow-xl shadow-purple-950/20">
              <Rocket className="w-8 h-8 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-['JetBrains_Mono'] font-bold border border-red-200 tracking-wider uppercase mb-2">
            Mandatory System Update
          </span>

          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#0b1c30] tracking-tight">
            New Version Available
          </h2>

          <div className="mt-3 flex items-center gap-2 text-xs font-['JetBrains_Mono']">
            <span className="text-[#7b7484]">Your Session:</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 line-through">
              {APP_VERSION}
            </span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded bg-[#eaddff] text-[#461599] font-bold">
              {targetVersion}
            </span>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-[#eff4ff]/80 border border-[#cbdbf5] text-xs text-[#0b1c30] text-left leading-relaxed w-full">
            <div className="flex items-center gap-1.5 font-bold text-[#461599] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#5e35b1]" />
              <span>Admin Update Notice:</span>
            </div>
            <p className="text-[#494453]">
              {updateMessage ||
                "A mandatory portfolio update has been published by the administrator. To prevent stale data and ensure security, access is temporarily locked until your browser refreshes to the new version."}
            </p>
          </div>

          <div className="mt-6 w-full space-y-2.5">
            <button
              onClick={handleClearCacheAndUpdate}
              disabled={updating}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#461599] to-[#5e35b1] hover:from-[#370f7d] hover:to-[#461599] text-white text-sm font-bold shadow-lg shadow-purple-950/20 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${updating ? "animate-spin" : ""}`} />
              <span>{updating ? "Clearing Cache & Reloading..." : "Clear Cache & Update Now"}</span>
            </button>

            <p className="text-[11px] text-[#7b7484]">
              * Automatically busts browser cache and synchronizes with latest release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
