"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Handshake, Clock, AlertCircle, CheckCircle2, ArrowRight, Plus } from "lucide-react";
import ContractList from "@/components/contracts/ContractList";
import ContractModal from "@/components/contracts/ContractModal";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

export default function ContractsPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-navy-900 dark:text-white flex items-center gap-3">
            <Handshake className="w-10 h-10 text-indigo-500" />
            {t("contracts.title", "Ventes à Terme")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            {t("contracts.subtitle", "Sécurisez vos revenus et vos approvisionnements via des contrats d'escrow blockchain.")}
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          {t("contracts.create", "Créer un Contrat")}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-navy-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="text-indigo-500" />
              {t("contracts.my_stats", "Mes Contrats")}
            </h3>
            <div className="space-y-4">
              {[
                { label: "En attente", value: "3", color: "text-amber-500" },
                { label: "Actifs", value: "12", color: "text-emerald-500" },
                { label: "Livrés", value: "45", color: "text-blue-500" },
                { label: "Litiges", value: "1", color: "text-red-500" },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-navy-900">
                  <span className="text-sm text-gray-500">{stat.label}</span>
                  <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Conseil Escrow
            </h3>
            <p className="text-indigo-100 text-sm opacity-90">
              Le dépôt de garantie est verrouillé sur la blockchain et ne sera libéré qu'à la confirmation de livraison.
            </p>
          </div>
        </div>

        {/* Main Content: Contracts List */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-navy-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Contrats en Cours</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300">Tous</button>
                <button className="px-3 py-1 text-xs font-medium rounded-lg text-gray-400">Acheteur</button>
                <button className="px-3 py-1 text-xs font-medium rounded-lg text-gray-400">Vendeur</button>
              </div>
            </div>
            <ContractList />
          </div>
        </div>
      </div>

      <ContractModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
