"use client";

import { User } from "@/lib/types";
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldAlert, ShieldCheck, X } from "lucide-react";
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
  googleConfigured,
  onClose,
  onLoginSuccess,
  onToast,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdminEmail =
    email.trim().toLowerCase() === "info@codeflies.com" ||
    email.trim().toLowerCase().includes("admin");

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password: password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        onLoginSuccess(data.user);
        onToast(
          "Signed In",
          `Logged in as ${data.user.name || data.user.email} (${data.user.role})`,
          "success"
        );
        setEmail("");
        setPassword("");
        onClose();
      } else {
        const errorText = data.error || "Authentication failed. Please check your credentials.";
        setErrorMessage(errorText);
        onToast("Login Failed", errorText, "warning");
      }
    } catch {
      const netError = "Network error during login. Please try again.";
      setErrorMessage(netError);
      onToast("Error", netError, "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!googleConfigured) {
      onToast(
        "Google OAuth Not Configured",
        "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to environment variables or sign in with your email below.",
        "info"
      );
      return;
    }
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#e5eeff] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eff4ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#eaddff] text-[#461599] flex items-center justify-center font-bold text-sm">
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

        <div className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#cbdbf5] hover:border-[#5e35b1] hover:bg-[#eff4ff]/30 text-sm font-semibold text-[#0b1c30] transition-all shadow-2xs active:scale-98"
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

          <div className="relative flex items-center justify-center my-3">
            <span className="w-full border-t border-[#eff4ff]"></span>
            <span className="absolute bg-white px-3 text-[11px] uppercase tracking-wider text-[#7b7484] font-medium">
              Or sign in with email
            </span>
          </div>

          {/* Secure Email & Password Form */}
          <form onSubmit={handleCustomLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@codeflies.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-[#0b1c30] placeholder-[#7b7484] focus:outline-none focus:ring-1 focus:ring-[#5e35b1] focus:bg-white transition-colors"
                />
                <Mail className="w-4 h-4 text-[#7b7484] absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#0b1c30]">
                  Password
                </label>
                {isAdminEmail && (
                  <span className="text-[10px] text-[#5e35b1] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Admin credentials required
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isAdminEmail ? "Enter admin password" : "•••••••• (optional for members)"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-[#eff4ff] border border-[#cbdbf5] text-[#0b1c30] placeholder-[#7b7484] focus:outline-none focus:ring-1 focus:ring-[#5e35b1] focus:bg-white transition-colors"
                />
                <Lock className="w-4 h-4 text-[#7b7484] absolute left-3 top-2.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#7b7484] hover:text-[#0b1c30] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#7b7484] mt-1.5 leading-snug">
                {isAdminEmail
                  ? "Administrator accounts must provide the authorized admin password."
                  : "Enter your Codeflies work email to access the repository."}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-2.5 rounded-xl bg-[#5e35b1] text-white text-xs font-semibold hover:bg-[#461599] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Sign In to Folio"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
