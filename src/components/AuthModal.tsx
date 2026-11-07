"use client";

import { User } from "@/lib/types";
import { KeyRound, LogIn, ShieldAlert, ShieldCheck, UserCheck, X } from "lucide-react";
import React, { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  currentUser: User | null;
  googleConfigured: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onToast: (title: string, subtitle?: string, type?: "success" | "info" | "warning") => void;
}

export function AuthModal({
  isOpen,
  currentUser,
  googleConfigured,
  onClose,
  onLoginSuccess,
  onToast,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = async (demoRole: "admin" | "user" | "revoked") => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoRole }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        onLoginSuccess(data.user);
        onToast(
          "Signed In",
          `Welcome, ${data.user.name || data.user.email}! Role: ${data.user.role}`,
          "success"
        );
        onClose();
      } else {
        onToast("Login Failed", data.error || "Could not log in", "warning");
      }
    } catch {
      onToast("Error", "Network error during login", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        onLoginSuccess(data.user);
        onToast("Signed In", `Logged in as ${data.user.email}`, "success");
        onClose();
      } else {
        onToast("Login Failed", data.error || "Could not log in", "warning");
      }
    } catch {
      onToast("Error", "Network error during login", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!googleConfigured) {
      onToast(
        "Google OAuth Not Configured",
        "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env or use Quick Test Sign In below.",
        "info"
      );
      return;
    }
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#e5eeff] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#eff4ff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eaddff] text-[#461599] flex items-center justify-center font-bold">
              C
            </div>
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30]">
                Sign In to Codeflies Folio
              </h2>
              <p className="text-xs text-[#494453]">
                Role-based access to enterprise portfolio repository
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

        <div className="p-6 space-y-5">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#cbdbf5] hover:border-[#5e35b1] hover:bg-[#eff4ff]/30 text-sm font-semibold text-[#0b1c30] transition-all shadow-xs active:scale-98"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {!googleConfigured && (
            <p className="text-[11px] text-[#7b7484] text-center">
              Google OAuth keys can be set in <code>.env</code>. You can test immediately using the 1-click accounts below.
            </p>
          )}

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-[#eff4ff]"></span>
            <span className="absolute bg-white px-3 text-[11px] uppercase tracking-wider text-[#7b7484] font-semibold">
              Instant Test Accounts
            </span>
          </div>

          <div className="space-y-2">
            <button
              disabled={loading}
              onClick={() => handleQuickLogin("admin")}
              className="w-full p-3 rounded-xl border border-[#cbdbf5] hover:border-[#5e35b1] hover:bg-[#eff4ff]/60 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#eaddff] text-[#461599] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#0b1c30] group-hover:text-[#5e35b1]">
                    Admin (Full Access & User Control)
                  </div>
                  <div className="text-[11px] text-[#494453]">info@codeflies.com</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#5e35b1]">Login →</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleQuickLogin("user")}
              className="w-full p-3 rounded-xl border border-[#cbdbf5] hover:border-[#5e35b1] hover:bg-[#eff4ff]/60 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#006172] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#0b1c30] group-hover:text-[#5e35b1]">
                    Sales Engineer (Normal Active User)
                  </div>
                  <div className="text-[11px] text-[#494453]">member@codeflies.com</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#5e35b1]">Login →</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleQuickLogin("revoked")}
              className="w-full p-3 rounded-xl border border-red-200 bg-red-50/30 hover:bg-red-50 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#0b1c30] group-hover:text-red-700">
                    Revoked User (Test Access Revocation)
                  </div>
                  <div className="text-[11px] text-[#494453]">revoked@codeflies.com</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-red-600">Test →</span>
            </button>
          </div>

          <form onSubmit={handleCustomLogin} className="pt-2">
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Or sign in with custom email:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="name@codeflies.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#5e35b1]"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-4 py-2 rounded-xl bg-[#5e35b1] text-white text-xs font-semibold hover:bg-[#461599] transition-all disabled:opacity-50 shrink-0"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
