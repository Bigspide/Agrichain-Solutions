"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Leaf, AlertCircle, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Header from "@/components/layout/Header";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Identifiants invalides ou compte introuvable.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Connexion impossible pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-950 dark:to-navy-900 relative overflow-hidden">
      <Header />
      
      {/* Background Decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-10" />

      <div className="flex items-center justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium p-10 shadow-2xl border-t-4 border-primary-500 relative overflow-hidden"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-primary-500/10">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                {t("auth.login_title")}
              </h1>
              <p className="text-sm text-gray-500 font-medium">{t("auth.login_subtitle")}</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl text-sm text-red-600 dark:text-red-400 font-bold"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input-premium w-full pl-12 pr-4 py-3.5 text-sm outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                    {t("auth.password")}
                  </label>
                  <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-bold">
                    {t("auth.forgot_password")}
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-premium w-full pl-12 pr-12 py-3.5 text-sm outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer group">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                  <span className="group-hover:text-gray-700 transition-colors">Se souvenir de moi</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-premium w-full py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t("nav.login")} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-10">
              <p className="text-sm text-gray-500 font-medium">
                {t("auth.no_account")}{" "}
                <Link href="/register" className="text-primary-600 hover:text-primary-700 font-bold underline underline-offset-4">
                  {t("nav.register")}
                </Link>
              </p>
            </div>
          </motion.div>

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Utilisez les comptes créés par le seed Prisma ou inscrivez un nouvel utilisateur.
          </p>
        </div>
      </div>
    </div>
  );
}
