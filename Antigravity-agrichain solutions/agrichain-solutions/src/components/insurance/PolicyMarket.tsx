"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Crown } from "lucide-react";
import { toast } from "sonner";

const POLICIES = [
  {
    id: "starter",
    name: "Protection Starter",
    price: "50 USD",
    coverage: "500 USD",
    threshold: "15mm rain",
    duration: "3 mois",
    icon: ShieldCheck,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    description: "Idéal pour les petites exploitations. Couverture basique contre la sécheresse."
  },
  {
    id: "pro",
    name: "Protection Pro",
    price: "120 USD",
    coverage: "2,000 USD",
    threshold: "12mm rain",
    duration: "6 mois",
    icon: Zap,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    description: "Le choix recommandé. Meilleur ratio prime/couverture et seuils plus sensibles.",
    popular: true
  },
  {
    id: "platinum",
    name: "Protection Platinum",
    price: "300 USD",
    coverage: "10,000 USD",
    threshold: "10mm rain",
    duration: "12 mois",
    icon: Crown,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    description: "Souveraineté totale. Couverture maximale et déclenchement ultra-rapide."
  }
];

export default function PolicyMarket() {
  const handlePurchase = (policyName: string) => {
    toast.success(`Demande de souscription à ${policyName} envoyée !`, {
      description: "Le paiement sera traité via votre wallet connecté.",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {POLICIES.map((policy, i) => (
        <motion.div 
          key={policy.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -10 }}
          className={`relative p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${policy.border} ${policy.bg} ${policy.popular ? 'ring-4 ring-emerald-500/30 scale-105 z-10' : ''}`}
          onClick={() => handlePurchase(policy.name)}
        >
          {policy.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Recommandé
            </div>
          )}
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${policy.color} bg-white dark:bg-navy-900 shadow-sm`}>
            <policy.icon className="w-8 h-8" />
          </div>
          
          <h3 className="text-2xl font-bold mb-2">{policy.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 h-12">
            {policy.description}
          </p>
          
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Couverture</span>
              <span className="font-bold">{policy.coverage}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Seuil Payout</span>
              <span className="font-bold">{policy.threshold}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Durée</span>
              <span className="font-bold">{policy.duration}</span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-3xl font-black">{policy.price}</span>
            <span className="text-gray-400 text-sm">/prime</span>
          </div>
          
          <button className="w-full py-3 rounded-xl bg-navy-900 dark:bg-emerald-500 text-white font-bold hover:opacity-90 transition-opacity">
            Souscrire
          </button>
        </motion.div>
      ))}
    </div>
  );
}
