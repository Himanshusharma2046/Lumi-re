"use client";

import { LogOut, User } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function AdminTopbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div>
        {/* Breadcrumb or page title can go here */}
      </div>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-slate-800">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-xs text-slate-500">
              {session?.user?.email || ""}
            </p>
          </div>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
              <p className="text-sm font-medium text-slate-800">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-500">
                {session?.user?.email || ""}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
