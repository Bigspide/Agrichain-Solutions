"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, AlertCircle, ArrowRight, Package } from "lucide-react";
import { toast } from "sonner";

const MOCK_CONTRACTS = [
  {
    id: "CON-2026-001",
    crop: "Maïs",
    quantity: "50 Tons",
    price: "250 USD/T",
    total: "12,500 USD",
    date: "2026-08-15",
    status: "active",
    counterparty: "Coopérative Sud-Est",
    role: "buyer"
  },
  {
    id: "CON-2026-002",
    crop: "Cacao",
    quantity: "10 Tons",
    price: "1,800 USD/T",
    total: "18,000 USD",
    date: "2026-10-20",
    status: "pending",
    counterparty: "Industrie Agro-West",
    role: "seller"
  },
  {
    id: "CON-2026-003",
    crop: "Anacarde",
    quantity: "20 Tons",
    price: "800 USD/T",
    total: "16,000 USD",
    date: "2026-05-01",
    status: "delivered",
    counterparty: "Trading Global Ltd",
    role: "buyer"
  }
];

export default function ContractList() {
  const handleConfirm = (id: string) => {
    toast.success(`Confirmation de livraison envoyée pour ${id}. Les fonds sont en cours de libération.`);
  };

  return (
    <div className="space-y-4">
      {MOCK_CONTRACTS.map((contract, i) => (
        <motion.div 
          key={contract.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-5 rounded-2xl border border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-800"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              contract.status === 'active' ? 'bg-indigo-100 text-indigo-600' : 
              contract.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold">{contract.crop}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  contract.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 
                  contract.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {contract.status === 'active' ? 'ACTIF' : contract.status === 'delivered' ? 'LIVRÉ' : 'ATTENTE'}
                </span>
              </div>
              <p className="text-xs text-gray-500">{contract.id} • {contract.counterparty}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-400">Valeur Totale</p>
              <p className="font-bold text-sm">{contract.total}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Date Livraison</p>
              <p className="text-xs font-medium">{contract.date}</p>
            </div>
            
            {contract.status === 'active' && contract.role === 'buyer' && (
              <button 
                onClick={() => handleConfirm(contract.id)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmer Livraison
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
