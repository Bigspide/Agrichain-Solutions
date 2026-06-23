"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, Map as MapIcon, CreditCard, Activity } from "lucide-react";
import RiskMap from "@/components/insurance/RiskMap";
import PolicyMarket from "@/components/insurance/PolicyMarket";
import PolicyStatus from "@/components/insurance/PolicyStatus";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

export default function InsurancePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace'>('overview');

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-navy-900 dark:text-white flex items-center gap-3">
            <Shield className="w-10 h-10 text-emerald-500 animate-sovereign-pulse" />
            <span className="gradient-text">{t("insurance.title", "Protection Paramétrique")}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">
            {t("insurance.subtitle", "Sécurisez vos récoltes avec des paiements automatiques basés sur les données satellites.")}
          </p>
        </div>
        
        <div className="flex bg-gray-100/50 dark:bg-navy-900/50 p-1 rounded-2xl w-fit glass">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-xl transition-all duration-300 ${activeTab === 'overview' ? 'bg-white dark:bg-navy-800 shadow-sm text-emerald-600 font-bold scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t("insurance.tab_overview", "Vue d'ensemble")}
          </button>
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`px-6 py-2 rounded-xl transition-all duration-300 ${activeTab === 'marketplace' ? 'bg-white dark:bg-navy-800 shadow-sm text-emerald-600 font-bold scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t("insurance.tab_market", "Marché des Polices")}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Col: Risk Map & Stats */}
            <div className="lg:col-span-2 space-y-8">
              <div className="card-premium glow-edge p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MapIcon className="text-emerald-500" />
                    {t("insurance.map_title", "Analyse des Risques en Temps Réel")}
                  </h2>
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-100/80 dark:bg-amber-900/30 text-amber-600 rounded-full text-sm font-bold animate-pulse glass">
                    <AlertTriangle className="w-4 h-4" />
                    {t("insurance.risk_warning", "Alerte Sécheresse Modérée")}
                  </div>
                </div>
                <div className="h-[450px] rounded-2xl overflow-hidden bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700">
                  <RiskMap />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Pluviométrie Actuelle", value: "12mm", icon: Activity, color: "text-blue-500", trend: "down" },
                  { label: "Indice NDVI", value: "0.42", icon: CheckCircle2, color: "text-emerald-500", trend: "stable" },
                  { label: "Seuil de Payout", value: "10mm", icon: Shield, color: "text-amber-500", trend: "near" },
                ].map((stat, i) => (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    key={i} 
                    className="card-premium p-5 flex items-center gap-4"
                  >
                    <div className={`p-3 rounded-xl bg-gray-50 dark:bg-navy-900 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                      <p className="text-xl font-black">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Col: Active Policies */}
            <div className="space-y-8">
              <div className="card-premium p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="text-emerald-500" />
                  {t("insurance.my_policies", "Mes Polices")}
                </h2>
                <PolicyStatus />
              </div>

              <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden group transition-all hover:scale-[1.02]">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Optimisez votre couverture</h3>
                  <p className="text-emerald-50 text-sm mb-4 opacity la-90 font-medium">
                    L'IA Nexus suggère une extension de couverture pour vos champs de Maïs face aux prévisions de juillet.
                  </p>
                  <button 
                    onClick={() => setActiveTab('marketplace')}
                    className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all active:scale-95 shadow-sm"
                  >
                    Voir les Offres
                  </button>
                </div>
                <Shield className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="marketplace"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="card-premium p-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black mb-4 gradient-text">{t("insurance.market_title", "Catalogue de Protections")}</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                  Choisissez le niveau de sécurité adapté à vos cultures. Chaque police est ancrée sur la blockchain et déclenchée automatiquement par satellite.
                </p>
              </div>
              <PolicyMarket />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
