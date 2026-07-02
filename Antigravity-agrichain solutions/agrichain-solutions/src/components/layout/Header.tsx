"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Bell, ShoppingCart, Sun, Moon, Globe, User,
  ChevronDown, LogOut, Settings, Search, Leaf
} from "lucide-react";
import WalletConnect from "./WalletConnect";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuthStore, useCartStore, useNotificationStore, useUIStore } from "@/lib/store";

export default function Header() {
  const { t, locale, setLocale, locales } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount());
  const { unreadCount, notifications, markAllAsRead } = useNotificationStore();
  const { toggleSidebar } = useUIStore();
  const pathname = usePathname();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isLanding = pathname === "/";
  const isDashboard = pathname?.startsWith("/dashboard");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isLanding
          ? "bg-transparent"
          : "glass border-b border-gray-200/50 dark:border-gray-800/50"
      }`}
    >
      <div className={`${isLanding ? "max-w-7xl mx-auto" : ""} px-4 sm:px-6`}>
        <div className="flex items-center justify-between h-20">
          {/* Left Section - Branding */}
          <div className="flex items-center gap-4">
            {isDashboard && (
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400"
                id="sidebar-toggle"
                aria-controls="sidebar-menu"
                aria-expanded={false}
                aria-label={t('common.sidebar')}
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 relative transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/logo.png"
                  alt="AgriChain Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-extrabold text-xl tracking-tight gradient-text">AgriChain</span>
              </div>
            </Link>
          </div>

          {/* Center Section - Landing Navigation */}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-1 bg-white/40 dark:bg-navy-900/40 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
              {[
                { href: "#features", label: t("features.title") },
                { href: "#pricing", label: t("pricing.title") },
                { href: "/dashboard/marketplace", label: t("nav.marketplace") },
                { href: "/dashboard/traceability", label: t("nav.traceability") },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl hover:bg-white dark:hover:bg-navy-800 transition-all shadow-sm"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-3">
            {/* Search Experience */}
            {isDashboard && (
              <div className="relative hidden sm:block">
                <AnimatePresence mode="wait">
                  {showSearch ? (
                    <motion.div
                      initial={{ width: 40, opacity: 0 }}
                      animate={{ width: 300, opacity: 1 }}
                      exit={{ width: 40, opacity: 0 }}
                      className="flex items-center"
                    >
                      <label htmlFor="header-search-input" className="sr-only">
                        {t("common.search")}
                      </label>
                      <input
                        type="text"
                        id="header-search-input"
                        placeholder={t("common.search")}
                        className="input-premium w-full pl-10 pr-4 py-2 text-sm outline-none"
                        autoFocus
                        onBlur={() => setShowSearch(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setShowSearch(false);
                          }
                        }}
                      />
                      <Search className="absolute left-3 w-4 h-4 text-gray-400" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowSearch(true)}
                      className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500"
                      id="search-toggle"
                      aria-controls="search-input"
                      aria-expanded={false}
                      aria-label={t("common.search")}
                    >
                      <Search className="w-5 h-5" aria-hidden="true" />
                    </button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500"
              id="theme-toggle"
              aria-label={t(`common.theme_${theme}`)}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "light" ? <Moon className="w-5 h-5" aria-hidden="true" /> : <Sun className="w-5 h-5 text-yellow-400" aria-hidden="true" />}
              </motion.div>
            </button>

            <WalletConnect />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Shopping Cart */}
                <Link
                  href="/dashboard/cart"
                  className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500"
                  id="cart-button"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>

                {/* Notifications Center */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500"
                    id="notifications-button"
                    aria-controls="notifications-menu"
                    aria-expanded={false}
                    aria-label={`${t("common.notifications")} ${unreadCount > 0 ? `(${unreadCount} ${t("common.notifications_unread")})` : ""}`}
                  >
                    <Bell className="w-5 h-5" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </button>
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-14 w-80 card-premium overflow-hidden z-50 shadow-2xl"
                        role="region"
                        aria-labelledby="notifications-button"
                      >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950/50">
                          <h3 className="font-bold text-sm">{t("common.notifications")}</h3>
                          <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline font-semibold">
                            Tout marquer comme lu
                          </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Aucune notification</div>
                          ) : (
                            notifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif.id}
                                className={`px-5 py-4 border-b border-gray-50 dark:border-navy-800/50 hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-all ${
                                  !notif.read ? "bg-primary-50/30 dark:bg-primary-900/10" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                    notif.type === "success" ? "bg-green-500" :
                                    notif.type === "warning" ? "bg-yellow-500" :
                                    notif.type === "error" ? "bg-red-500" : "bg-blue-500"
                                  }`} />
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{notif.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 truncate">{notif.message}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Account Menu */}
                <div ref={userRef} className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    id="user-menu-button"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{user?.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{user?.role && t(`role.${user.role}`)}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-14 w-60 card-premium py-2 z-50 overflow-hidden shadow-2xl"
                      >
                        <div className="px-4 py-3 mb-2 bg-gray-50 dark:bg-navy-950/50 border-b border-gray-100 dark:border-navy-800">
                          <p className="text-xs font-bold text-gray-400 uppercase">Compte</p>
                        </div>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-all"
                        >
                          <User className="w-4 h-4" /> {t("common.profile")}
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-all"
                        >
                          <Settings className="w-4 h-4" /> {t("nav.settings")}
                        </Link>
                        <hr className="my-2 border-gray-100 dark:border-navy-800" />
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); signOut({ callbackUrl: "/login" }); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <LogOut className="w-4 h-4" /> {t("nav.logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-all"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className="btn-premium text-sm"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
