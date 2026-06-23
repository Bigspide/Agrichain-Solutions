"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  ArrowUpRight, 
  UserCheck 
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AdminAnalyticsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) {
          if (res.status === 403) throw new Error("Accès interdit : Réservé aux administrateurs");
          throw new Error("Erreur lors du chargement des données");
        }
        const json = await res.json();
        setData(json.metrics);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-navy-950 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-navy-950 text-white p-4">
      <div className="card-premium p-8 text-center max-w-md border-red-500/50">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-950 p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-display font-extrabold mb-2 tracking-tight">
              Observatoire <span className="text-primary-500">Administrateur</span>
            </h1>
            <p className="text-gray-400 font-medium">Analyse en temps réel de l&apos;engagement et de la croissance.</p>
          </div>
          <div className="text-right">
            <span className="px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest">
              Mode Shadow Active
            </span>
          </div>
        </header>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard 
            title="Utilisateurs Quotidiens (DAU)" 
            value={data.activeUsers.dau} 
            icon={Users} 
            color="text-blue-400" 
            trend="+12%"
          />
          <MetricCard 
            title="Utilisateurs Mensuels (MAU)" 
            value={data.activeUsers.mau} 
            icon={TrendingUp} 
            color="text-emerald-400" 
            trend="+5%"
          />
          <MetricCard 
            title="Temps Moyen / Session" 
            value={`${Math.round(data.engagement.avgTimeSpent / 60)} min`} 
            icon={Clock} 
            color="text-gold-400" 
            trend="+2m"
          />
          <MetricCard 
            title="Nouveaux Utilisateurs" 
            value={data.growth.newUsersThisMonth} 
            icon={UserCheck} 
            color="text-primary-400" 
            trend="+18%"
          />
        </div>

        {/* Detailed Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card-premium p-8 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                Dynamique d&apos;Engagement
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-lg bg-white/5 text-xs text-gray-400 border border-white/10">Réel</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-navy-900/30 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-500 via-transparent to-transparent" />
              <p className="text-gray-500 italic text-sm z-10">
                Graphique de flux d'utilisateurs en cours d&apos;implémentation (Recharts)...
              </p>
            </div>
          </div>

          <div className="card-premium p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-gold-500" />
              Santé du Système
            </h3>
            <div className="space-y-6">
              <HealthItem label="Base de données" status="Optimal" color="text-emerald-400" />
              <HealthItem label="API Blockchain" status="Stable" color="text-emerald-400" />
              <HealthItem label="IA Multimodale" status="Surchargée" color="text-gold-400" />
              <HealthItem label="Hub Paiements" status="Optimal" color="text-emerald-400" />
            </div>
            <button className="w-full mt-8 btn-secondary-premium py-3 rounded-xl font-bold text-sm">
              Lancer un diagnostic complet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card-premium p-6 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" /> {trend}
        </span>
      </div>
      <div className="text-3xl font-display font-extrabold mb-1 tracking-tight">{value}</div>
      <div className="text-sm text-gray-400 font-medium">{title}</div>
    </motion.div>
  );
}

function HealthItem({ label, status, color }: any) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{status}</span>
    </div>
  );
}
