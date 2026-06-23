"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Package, Truck, Wallet, Bot,
  QrCode, GraduationCap, Settings, Shield, X, Users, BarChart3,
  Factory, ChevronLeft, Leaf
} from "lucide-react";
import { useI18n } from "@/lib/i18n/translation";
import { useAuthStore, useUIStore } from "@/lib/store";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, ShoppingBag, Package, Truck, Wallet, Bot,
  QrCode, GraduationCap, Settings, Shield, Users, BarChart3, Factory, Leaf,
};

interface SidebarItem {
  key: string;
  icon: string;
  href: string;
  roles?: string[];
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { key: "dashboard", icon: "LayoutDashboard", href: "/dashboard" },
  { key: "marketplace", icon: "ShoppingBag", href: "/dashboard/marketplace" },
  { key: "orders", icon: "Package", href: "/dashboard/orders" },
  { key: "tracking", icon: "Truck", href: "/dashboard/tracking" },
  { key: "wallet", icon: "Wallet", href: "/dashboard/wallet" },
  { key: "ai_advisor", icon: "Bot", href: "/dashboard/ai-advisor" },
  { key: "traceability", icon: "QrCode", href: "/dashboard/traceability" },
  { key: "education", icon: "GraduationCap", href: "/dashboard/education" },
  { key: "settings", icon: "Settings", href: "/dashboard/settings" },
  { key: "admin", icon: "Shield", href: "/dashboard/admin", roles: ["admin"] },
];

export default function Sidebar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapse } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const filteredItems = sidebarItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white text-sm">🌱</span>
            </div>
            <span className="font-display font-bold gradient-text">AgriChain</span>
          </Link>
        )}
        <button
          onClick={() => {
            if (isMobile) {
              setSidebarOpen(false);
            } else {
              toggleSidebarCollapse();
            }
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isMobile ? (
            <X className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronLeft className={`w-5 h-5 text-gray-500 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
          )}
        </button>
      </div>

      {/* User Info */}
      {!sidebarCollapsed && user && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{t(`role.${user.role}`)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
              title={sidebarCollapsed ? t(`nav.${item.key}`) : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary-600 dark:text-primary-400" : ""}`} />
              {!sidebarCollapsed && <span>{t(`nav.${item.key}`)}</span>}
              {item.badge && !sidebarCollapsed && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-gradient-to-br from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20 rounded-xl p-3">
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-400">AgriChain Pro</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Débloquez toutes les fonctionnalités</p>
            <Link
              href="/dashboard/subscription"
              className="mt-2 block text-center text-xs font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg py-1.5 hover:shadow-glow transition-shadow"
            >
              Mise à niveau →
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-white dark:bg-navy-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
          sidebarCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-navy-950 border-r border-gray-200 dark:border-gray-800 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
