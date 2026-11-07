"use client";

import { User } from "@/lib/types";
import { LogOut, ShieldAlert, UserCheck } from "lucide-react";
import React from "react";

interface AccessDeniedViewProps {
  user: User;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function AccessDeniedView({
  user,
  onOpenAuth,
  onLogout,
}: AccessDeniedViewProps) {
  const isRevoked = user.status === "REVOKED";

  return (
    <div className="max-w-xl mx-auto my-16 px-4">
      <div className="bg-white rounded-2xl shadow-xl shadow-red-950/5 border border-red-200 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0b1c30]">
          {isRevoked ? "Access Revoked" : "Approval Pending"}
        </h2>

        <p className="text-sm text-[#494453] mt-2 leading-relaxed">
          {isRevoked ? (
            <>
              Your access to the Codeflies Portfolio Directory has been revoked by an administrator. You do not have permission to view projects or copy client links.
            </>
          ) : (
            <>
              Your account has been registered and is pending administrator authorization before you can access the portfolio directory.
            </>
          )}
        </p>

        <div className="mt-4 p-3 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] inline-flex items-center gap-2 text-xs text-[#0b1c30]">
          <span className="text-[#494453]">Signed in as:</span>
          <strong className="font-['JetBrains_Mono']">{user.email}</strong>
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold">
            {user.status}
          </span>
        </div>

        <div className="mt-8 pt-6 border-t border-[#eff4ff] flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5e35b1] text-white text-xs sm:text-sm font-semibold hover:bg-[#461599] transition-all shadow-sm active:scale-95"
          >
            Switch Account / Log In As Admin
          </button>

          <button
            onClick={onLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#cbdbf5] text-xs sm:text-sm font-semibold text-[#494453] hover:text-red-600 hover:border-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
