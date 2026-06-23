"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Leaf, User, Phone, MapPin, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Header from "@/components/layout/Header";

const roles = [
  { key: "producer", icon: "🌾", color: "from-green-500 to-emerald-600" },
  { key: "cooperative", icon: "🤝", color: "from-blue-500 to-indigo-600" },
  { key: "logistics", icon: "🚛", color: "from-orange-500 to-amber-600" },
  { key: "industry", icon: "🏭", color: "from-purple-500 to-violet-600" },
  { key: "consumer", icon: "🛒", color: "from-pink-500 to-rose-600" },
  { key: "investor", icon: "💰", color: "from-gold-500 to-amber-600" },
];

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "", role: "", location: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!formData.role) {
      setError("Veuillez choisir un rôle.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Inscription impossible.");
      }
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) throw new Error("Compte créé, mais connexion impossible.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-950 dark:to-navy-900 relative overflow-hidden">
      <Header />
      
      {/* Background Decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-10" />

      <div className="flex items-center justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-10 shadow-2xl border-t-4 border-primary-500 relative overflow-hidden"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-primary-500/10">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                {t("auth.register_title")}
              </h1>
              <p className="text-sm text-gray-500 font-medium">{t("auth.register_subtitle")}</p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1">
                  <div className={`h-2 rounded-full transition-all duration-500 ${s <= step ? "bg-primary-500 shadow-sm" : "bg-gray-200 dark:bg-gray-700"}`} />
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300 font-bold">
                {error}
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Kouamé Yao"
                      className="input-premium w-full pl-12 pr-4 py-3.5 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2">{t("auth.email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="input-premium w-full pl-12 pr-4 py-3.5 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2">{t("auth.phone")}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+225 07 08 09 10"
                      className="input-premium w-full pl-12 pr-4 py-3.5 text-sm outline-none"
                    />
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="btn-premium w-full py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2">
                  {t("common.next")} <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{t("onboarding.step2_title")}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t("onboarding.step2_desc")}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <button
                      key={role.key}
                      onClick={() => setFormData({ ...formData, role: role.key })}
                      className={`flex items-center gap-3 p-5 rounded-2xl border-2 transition-all group ${
                        formData.role === role.key
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md"
                          : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{role.icon}</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {t(`role.${role.key}`)}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(1)} className="btn-secondary-premium flex-1 py-4 rounded-2xl font-bold">{t("common.back")}</button>
                  <button onClick={() => setStep(3)} className="btn-premium flex-1 py-4 rounded-2xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2">
                    {t("common.next")} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Password & Location */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2">Localisation</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text" value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Daloa, Côte d'Ivoire"
                      className="input-premium w-full pl-12 pr-4 py-3.5 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2">{t("auth.password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"} value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="input-premium w-full pl-12 pr-12 py-3.5 text-sm outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2">{t("auth.confirm_password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password" value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="input-premium w-full pl-12 pr-4 py-3.5 text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(2)} className="btn-secondary-premium flex-1 py-4 rounded-2xl font-bold">{t("common.back")}</button>
                  <button onClick={handleRegister} disabled={isSubmitting} className="btn-premium flex-1 py-4 rounded-2xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t("onboarding.complete")} <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            <div className="text-center mt-10">
              <p className="text-sm text-gray-500 font-medium">
                {t("auth.has_account")}{" "}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-bold underline underline-offset-4">
                  {t("nav.login")}
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
