"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  Coins, 
  Zap, 
  ArrowUpRight, 
  Users, 
  BookOpen 
} from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function FortunePage() {
  const { theme } = useTheme();

  // Mock data - In production, this comes from an API
  const userFortune = {
    agriTokens: 1250.75,
    tokenValueUSD: 125.08,
    prestige: "Silver",
    nextTier: "Gold",
    progressToNext: 65,
    insuranceStatus: "Active",
    coverage: "1,000,000 XOF",
    impactScore: 84, // % sustainability
    dailyStreak: 12,
  };

  const milestones = [
    { title: "Eco-Warrior", desc: "Use organic compost 5 times", progress: 100, icon: <Zap className="text-yellow-400" /> },
    { title: "Community Mentor", desc: "Help 3 new farmers", progress: 40, icon: <Users className="text-blue-400" /> },
    { title: "Scholar of Earth", desc: "Complete 5 courses", progress: 80, icon: <BookOpen className="text-green-400" /> },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-navy-900 dark:text-white">Mon Patrimoine</h1>
          <p className="text-gray-500 dark:text-gray-400">Suivez votre richesse, votre prestige et votre impact.</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Statut Global</span>
          <div className="flex items-center gap-2 text-gold-600 font-bold text-xl">
            <Award size={24} />
            {userFortune.prestige} Member
          </div>
        </div>
      </div>

      {/* Main Fortune Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="card-premium p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Coins size={80} className="text-gold-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gold-600 mb-2">
              <Coins size={20} />
              <span className="font-semibold uppercase text-xs tracking-widest">AgriTokens ($AGRI)</span>
            </div>
            <div className="text-5xl font-black text-navy-900 dark:text-white mb-2">
              {userFortune.agriTokens.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-green-500 font-medium text-sm">
              <TrendingUp size={16} />
              <span>≈ {userFortune.tokenValueUSD} USD</span>
            </div>
          </div>
        </motion.div>

        {/* Insurance Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="card-premium p-6 relative overflow-hidden group border-l-4 border-l-emerald-500"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <ShieldCheck size={80} className="text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <ShieldCheck size={20} />
              <span className="font-semibold uppercase text-xs tracking-widest">Assurance Paramétrique</span>
            </div>
            <div className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
              {userFortune.insuranceStatus}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              Couverture totale : <span className="font-bold text-navy-900 dark:text-white">{userFortune.coverage}</span>
            </div>
          </div>
        </motion.div>

        {/* Impact Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="card-premium p-6 relative overflow-hidden group border-l-4 border-l-navy-600"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Award size={80} className="text-navy-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-navy-600 mb-2">
              <Award size={20} />
              <span className="font-semibold uppercase text-xs tracking-widest">Score d'Impact</span>
            </div>
            <div className="text-5xl font-black text-navy-900 dark:text-white mb-2">
              {userFortune.impactScore}%
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              Niveau de durabilité : <span className="font-bold text-navy-900 dark:text-white">Élevé</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Prestige Progress & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prestige Progress */}
        <div className="card-premium p-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="text-gold-500" />
            Progression vers le niveau {userFortune.nextTier}
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Expérience Prestige</span>
              <span className="font-bold text-navy-900 dark:text-white">{userFortune.progressToNext}%</span>
            </div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${userFortune.progressToNext}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-gold-400 to-gold-600"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              Gagnez encore <span className="font-bold text-gold-600">2,500 $AGRI</span> pour devenir membre Gold.
            </p>
          </div>
        </div>

        {/* Milestones */}
        <div className="card-premium p-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="text-yellow-500" />
            Objectifs et Récompenses
          </h3>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform">
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-navy-900 dark:text-white">{m.title}</span>
                    <span className="text-xs font-bold text-gray-400">{m.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-navy-600" 
                      style={{ width: `${m.progress}%` }} 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-navy-900 text-white p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="text-center md:text-left">
          <h4 className="text-2xl font-bold mb-2">Boostez votre patrimoine !</h4>
          <p className="text-navy-300">Complétez des formations ou adoptez des pratiques bio pour gagner plus de $AGRI.</p>
        </div>
        <button className="btn-premium px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
          Découvrir les Missions <ArrowUpRight size={20} />
        </button>
      </div>
    </div>
  );
}
