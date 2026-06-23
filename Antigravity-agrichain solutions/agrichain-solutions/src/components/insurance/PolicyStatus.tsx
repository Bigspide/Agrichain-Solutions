"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const MOCK_POLICIES = [
  {
    id: "POL-8821",
    crop: "Maïs",
    coverage: "1,200 USD",
    status: "active",
    expiry: "2026-09-15",
    lastCheck: "Il y a 2h",
    riskLevel: "Low"
  },
  {
    id: "POL-7742",
    crop: "Cacao",
    coverage: "5,000 USD",
    status: "claimed",
    expiry: "2026-03-10",
    lastCheck: "12 Juin",
    riskLevel: "High"
  }
];

export default function PolicyStatus() {
  return (
    <div className="space-y-4">
      {MOCK_POLICIES.map((policy, i) => (
        <motion.div 
          key={policy.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 rounded-2xl border border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${policy.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {policy.status === 'active' ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-sm">{policy.crop}</p>
              <p className="text-xs text-gray-500">{policy.id} • {policy.coverage}</p>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              policy.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {policy.status === 'active' ? 'Active' : 'Payé'}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">{policy.lastCheck}</p>
          </div>
        </motion.div>
      ))}
      
      <button className="w-full py-3 text-sm text-emerald-600 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors border border-dashed border-emerald-200 dark:border-emerald-800">
        Ajouter une protection
      </button>
    </div>
  );
}
