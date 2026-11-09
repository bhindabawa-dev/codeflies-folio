"use client";

import { User, UserRole, UserStatus } from "@/lib/types";
import { CheckCircle2, FileSpreadsheet, Search, Shield, ShieldAlert, ShieldCheck, UserCheck, UserX, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface AdminUsersModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onOpenImport?: () => void;
  onClose: () => void;
  onToast: (title: string, subtitle?: string, type?: "success" | "info" | "warning") => void;
}

export function AdminUsersModal({
  isOpen,
  currentUser,
  onOpenImport,
  onClose,
  onToast,
}: AdminUsersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        onToast("Failed to load users", data.error, "warning");
      }
    } catch {
      onToast("Error", "Could not fetch users", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateUser = async (
    userId: string,
    updates: { role?: UserRole; status?: UserStatus }
  ) => {
    try {
      setActionLoadingId(userId);
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      const data = await res.json();

      if (!res.ok) {
        onToast("Action Failed", data.error || "Could not update user", "warning");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...data.user } : u))
      );

      if (updates.status === "REVOKED") {
        onToast("Access Revoked", `User access has been revoked immediately.`, "warning");
      } else if (updates.status === "ACTIVE") {
        onToast("Access Granted", `User can now view and copy portfolio links.`, "success");
      } else if (updates.role) {
        onToast("Role Updated", `Role changed to ${updates.role}.`, "info");
      }
    } catch {
      onToast("Error", "Network error updating user", "warning");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#e5eeff] flex flex-col max-h-[85vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#eff4ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#eaddff] text-[#461599] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-[#0b1c30]">
                Access Control & Team Permissions
              </h2>
              <p className="text-xs text-[#494453]">
                Grant or revoke portfolio view access and manage administrator roles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenImport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenImport();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all shadow-2xs"
                title="Switch to Excel Import"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Import Excel</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#494453] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-[#eff4ff] bg-[#f8f9ff]">
          <div className="relative flex items-center bg-white rounded-xl border border-[#cbdbf5] px-3 py-1.5 focus-within:border-[#5e35b1]">
            <Search className="w-4 h-4 text-[#7b7484] mr-2" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent text-[#0b1c30] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-8 text-center text-xs text-[#494453]">
              Loading user directory...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#494453]">
              No users matching query.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isActionLoading = actionLoadingId === u.id;

                return (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl border border-[#eff4ff] bg-white hover:border-[#cbdbf5] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#eff4ff] text-[#5e35b1] font-bold flex items-center justify-center text-xs">
                        {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-[#0b1c30]">
                            {u.name || u.email.split("@")[0]}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#eaddff] text-[#24005b] font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#494453] font-['JetBrains_Mono']">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                      <select
                        disabled={isSelf || isActionLoading}
                        value={u.role}
                        onChange={(e) =>
                          handleUpdateUser(u.id, { role: e.target.value as UserRole })
                        }
                        className="px-2.5 py-1 text-xs rounded-lg bg-[#eff4ff] border border-[#cbdbf5] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#5e35b1] cursor-pointer disabled:opacity-60"
                      >
                        <option value="USER">User (Standard)</option>
                        <option value="ADMIN">Admin (Full Access)</option>
                      </select>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : u.status === "REVOKED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {u.status}
                      </span>

                      {!isSelf && (
                        u.status === "ACTIVE" ? (
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleUpdateUser(u.id, { status: "REVOKED" })}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Revoke portfolio viewing access"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </button>
                        ) : (
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleUpdateUser(u.id, { status: "ACTIVE" })}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
                            title="Grant access to view projects"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Grant Access</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#eff4ff] bg-[#f8f9ff] flex items-center justify-between text-xs text-[#494453]">
          <span>
            * Revoked users are immediately blocked from viewing projects.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#cbdbf5] text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
