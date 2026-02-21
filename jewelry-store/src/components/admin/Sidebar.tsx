"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CircleDot,
  Gem,
  FolderTree,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Gem as GemLogo,
  X,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Metals",
    href: "/admin/metals",
    icon: CircleDot,
  },
  {
    label: "Gemstones",
    href: "/admin/gemstones",
    icon: Gem,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Price Update",
    href: "/admin/price-update",
    icon: DollarSign,
  },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  setCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Whether to show labels (always on mobile overlay, conditional on desktop)
  const showLabels = mobileOpen || !collapsed;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-50
          ${collapsed ? "md:w-18" : "md:w-64"}
          ${mobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 shrink-0">
              <GemLogo className="w-5 h-5 text-white" />
            </div>
            {showLabels && (
              <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
                Jewelry Admin
              </span>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={!showLabels ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? "text-amber-400"
                      : "text-slate-500 group-hover:text-white"
                  }`}
                />
                {showLabels && <span className="whitespace-nowrap">{item.label}</span>}
                {isActive && showLabels && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="hidden md:block px-3 py-4 border-t border-slate-800 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
