"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, Award, Coins } from "lucide-react";

interface FinancialCockpitProps {
  balance: number;
  prestige: string;
  impactScore: number;
  agriTokenBalance: number;
}

export default function FinancialCockpit({ balance, prestige, impactScore, agriTokenBalance }: FinancialCockpitProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Balance */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="col-span-2 card-premium p-8 bg-gradient-to-br from-navy-900 via-navy-950 to-black border-primary-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Wallet className="w-4 h-4" /> Portefeuille Souverain
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-5xl font-display font-extrabold text-white tracking-tighter">
              {balance.toLocaleString()} <span className="text-2xl text-gray-500 font-medium">FCFA</span>
            </h2>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              <TrendingUp className="w-3 h-3" /> +12.5%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Actifs $AGRI</p>
              <p className="text-xl font-display font-bold text-white">{agriTokenBalance} <span className="text-sm text-gold-400">AGRI</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Score d'Impact</p>
              <p className="text-xl font-display font-bold text-white">{impactScore} <span className="text-sm text-primary-400">pts</span></p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Prestige Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="card-premium p-8 bg-gradient-to-br from-gold-600/20 via-navy-900 to-navy-950 border-gold-500/30 flex flex-col items-center justify-center text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow-gold mb-4">
          <Award className="w-10 h-10 text-navy-950" />
        </div>
        <p className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-1">Niveau de Prestige</p>
        <h3 className="text-3xl font-display font-extrabold text-white capitalize">{prestige}</h3>
        <div className="w-full bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gold-400 shadow-[0_0_10px_#facc15]"
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-3 font-medium">Progression vers le niveau suivant</p>
      </motion.div>
    </div>
  );
}
