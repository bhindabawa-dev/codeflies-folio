"use client";

import { Copy, ExternalLink, Lock, LogIn, Search, ShieldCheck, Sparkles } from "lucide-react";
import React from "react";

interface AnonymousGateViewProps {
  onOpenAuth: () => void;
  googleConfigured: boolean;
}

export function AnonymousGateView({ onOpenAuth, googleConfigured }: AnonymousGateViewProps) {
  return (
    <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-purple-950/5 border border-[#e5eeff] p-8 sm:p-12 text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-[#5e35b1]/10 to-[#57dffe]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#461599] to-[#5e35b1] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-950/20 mb-6">
            C
          </div>

          <span className="px-3 py-1 rounded-full bg-[#eff4ff] text-[#5e35b1] text-xs font-['JetBrains_Mono'] font-semibold tracking-wider uppercase mb-3 border border-[#cbdbf5]">
            Authorized Access Only
          </span>

          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-5xl font-extrabold text-[#0b1c30] tracking-tight max-w-2xl">
            Codeflies Portfolio Showcase Directory
          </h1>

          <p className="text-sm sm:text-base text-[#494453] mt-4 max-w-xl leading-relaxed">
            Welcome to the Codeflies repository of verified enterprise links and client-ready case studies. Please sign in to explore projects, filter architectures, and multi-copy sales pitches.
          </p>

          {/* Sign In CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={() => {
                if (googleConfigured) {
                  window.location.href = "/api/auth/google";
                } else {
                  onOpenAuth();
                }
              }}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#5e35b1] text-white text-sm font-semibold hover:bg-[#461599] transition-all shadow-md shadow-purple-950/20 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#ffffff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#ffffff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#ffffff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#cbdbf5] text-sm font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors whitespace-nowrap"
            >
              Other Sign In Options
            </button>
          </div>
        </div>

        {/* Feature Grid Preview */}
        <div className="mt-12 pt-8 border-t border-[#eff4ff] grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-4 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff]">
            <div className="w-8 h-8 rounded-lg bg-white text-[#5e35b1] flex items-center justify-center mb-3 shadow-xs">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0b1c30]">
              Instant Fuzzy Search
            </h4>
            <p className="text-xs text-[#494453] mt-1 leading-snug">
              Search by client title, tech stack (Next.js, WebRTC, AI), or hashtags with zero lag.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff]">
            <div className="w-8 h-8 rounded-lg bg-white text-[#5e35b1] flex items-center justify-center mb-3 shadow-xs">
              <Copy className="w-4 h-4" />
            </div>
            <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0b1c30]">
              Batch Multi-Copy
            </h4>
            <p className="text-xs text-[#494453] mt-1 leading-snug">
              Select multiple case studies and copy formatted WhatsApp pitches, Markdown, or emails.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#eff4ff]/60 border border-[#e5eeff]">
            <div className="w-8 h-8 rounded-lg bg-white text-[#5e35b1] flex items-center justify-center mb-3 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0b1c30]">
              Access Managed
            </h4>
            <p className="text-xs text-[#494453] mt-1 leading-snug">
              Administrators grant and revoke viewer permissions with real-time access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
