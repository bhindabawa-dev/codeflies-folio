"use client";

import { APP_VERSION } from "@/lib/version";
import { AlertTriangle, Radio, RefreshCw, Rocket, ShieldAlert, Sparkles, X, Zap } from "lucide-react";
import React, { useState } from "react";

interface AdminForceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (version: string) => void;
  onToast: (title: string, subtitle?: string, type?: "success" | "info" | "warning") => void;
}

export function AdminForceUpdateModal({
  isOpen,
  onClose,
  onSuccess,
  onToast,
}: AdminForceUpdateModalProps) {
  const [version, setVersion] = useState(APP_VERSION);
  const [message, setMessage] = useState(
    "A new feature update has been deployed. Please clear cache and refresh now to access the latest version."
  );
  const [broadcasting, setBroadcasting] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim()) {
      onToast("Version Required", "Please specify a target version.", "warning");
      return;
    }

    try {
      setBroadcasting(true);
      const res = await fetch("/api/system/force-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: version.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to broadcast force update");
      }

      onSuccess(version.trim());
      onToast(
        "⚡ Force Update Broadcasted!",
        `All active users will immediately see the mandatory update screen for ${version.trim()}.`,
        "success"
      );
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error broadcasting update";
      onToast("Broadcast Failed", errorMsg, "warning");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#e5eeff] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eff4ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-[#0b1c30]">
                Broadcast Force Update
              </h2>
              <p className="text-xs text-[#494453]">
                Push an immediate mandatory update to all logged-in users
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#494453] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleBroadcast} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-0.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Real-Time Lockout Behavior:</span>
            </div>
            When you trigger this update, every user who currently has the portfolio open on their screen will immediately receive a blocking pop-up. They will not be able to interact with the directory until they clear cache and reload.
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Required Target Version *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="e.g. v1.2.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-sm font-['JetBrains_Mono'] font-bold text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setVersion(APP_VERSION)}
                className="px-3 py-2.5 rounded-xl bg-[#eff4ff] text-[#5e35b1] border border-[#cbdbf5] text-xs font-semibold hover:bg-[#eaddff] transition-colors whitespace-nowrap"
              >
                Use {APP_VERSION}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Update Notice / Release Notes for Users
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the update (e.g. New category filters, speed improvements)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#eff4ff]">
            <span className="text-[11px] text-[#7b7484] flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              Broadcasts via live heartbeat
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#494453] hover:bg-[#eff4ff] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={broadcasting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-950/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${broadcasting ? "animate-spin" : ""}`} />
                <span>{broadcasting ? "Broadcasting..." : "Force Update Now"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
