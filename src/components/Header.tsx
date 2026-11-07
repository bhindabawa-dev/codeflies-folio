"use client";

import { User } from "@/lib/types";
import { LogIn, LogOut, Plus, ShieldCheck, Users } from "lucide-react";
import React from "react";

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenAddProject: () => void;
  onLogout: () => void;
}

export function Header({
  user,
  onOpenAuth,
  onOpenAdmin,
  onOpenAddProject,
  onLogout,
}: HeaderProps) {
  const canAddProject = Boolean(user && user.status === "ACTIVE");
  const isAdmin = user?.role === "ADMIN" && user?.status === "ACTIVE";

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#5e35b1]/10 shadow-[0_4px_24px_-4px_rgba(94,53,177,0.08)]">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#461599] to-[#5e35b1] flex items-center justify-center text-white font-bold text-base shadow-sm">
              C
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-bold tracking-tight text-[#461599]">
              Codeflies
            </span>
          </div>
          <span className="h-4 w-px bg-[#cbc3d5] hidden sm:inline-block"></span>
          <span className="font-['JetBrains_Mono'] text-xs text-[#494453] hidden sm:inline-block">
            Portfolio Directory
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {canAddProject && (
            <button
              onClick={onOpenAddProject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5e35b1] text-white text-xs sm:text-sm font-semibold hover:bg-[#461599] transition-all shadow-sm active:scale-95"
              title="Add New Portfolio Project"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Project</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#cbc3d5] text-[#0b1c30] text-xs sm:text-sm font-medium hover:border-[#5e35b1] hover:text-[#5e35b1] transition-all shadow-sm active:scale-95"
              title="Manage Users & Access"
            >
              <Users className="w-4 h-4 text-[#5e35b1]" />
              <span className="hidden sm:inline">User Access</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-[#cbc3d5]/60 sm:border-0 sm:pl-0">
              <div
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-[#e5eeff] text-[#0b1c30] text-xs shadow-sm cursor-pointer hover:border-[#5e35b1] transition-colors"
                title="Click to switch account"
              >
                <div className="w-6 h-6 rounded-full bg-[#eaddff] text-[#24005b] font-semibold flex items-center justify-center text-[11px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-[11px] leading-tight truncate max-w-[90px] sm:max-w-[130px]">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <span className="text-[10px] text-[#494453] leading-none flex items-center gap-1">
                    {user.role === "ADMIN" ? (
                      <span className="text-[#5e35b1] font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      "Member"
                    )}
                    {user.status === "REVOKED" && (
                      <span className="text-red-600 font-semibold">(Revoked)</span>
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-[#494453] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5e35b1] text-white text-xs sm:text-sm font-semibold hover:bg-[#461599] transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
